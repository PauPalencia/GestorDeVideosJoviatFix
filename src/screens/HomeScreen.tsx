import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FloatingMenu } from '../components/FloatingMenu';
import { NowPlayingBar } from '../components/NowPlayingBar';
import { VideoCard } from '../components/VideoCard';
import { VideoPlayer } from '../components/VideoPlayer';
import { ListManagerModal } from '../components/ListManagerModal';
import { colors } from '../theme/colors';
import { detectSource } from '../utils/video';
import { Video } from '../types/models';
import { createVideo, fetchLists, fetchUserVideos } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

const formatDate = (ts: any): string => {
  if (!ts) return '';
  const ms = typeof ts === 'number' ? ts : ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : 0);
  return new Date(ms).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [currentVideo, setCurrentVideo] = useState<Video | undefined>(undefined);
  const [videos, setVideos] = useState<Video[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [listManagerOpen, setListManagerOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [availableLists, setAvailableLists] = useState<{ id: string; title: string }[]>([]);

  const loadVideos = async () => {
    if (!user) return;
    const data = await fetchUserVideos(user.uid);
    setVideos(data as Video[]);
    if (data.length > 0 && !currentVideo) setCurrentVideo(data[0] as Video);
  };

  const loadLists = async () => {
    if (!user) return;
    const data = await fetchLists(user.uid);
    setAvailableLists(data.map(l => ({ id: l.id, title: l.title })));
    if (data.length > 0 && !selectedListId) setSelectedListId(data[0].id);
  };

  useEffect(() => {
    loadVideos();
    loadLists();
  }, [user]);

  const addVideo = async () => {
    if (!user || !url || !title) return;
    const created: Video = {
      id: `${Date.now()}`,
      url,
      title,
      description,
      authorName,
      thumbnailUrl: 'https://placehold.co/120x90',
      createdAt: Date.now(),
      source: detectSource(url),
      ownerUid: user.uid,
      listIds: selectedListId ? [selectedListId] : [],
    };
    setVideos((p) => [created, ...p]);
    setCurrentVideo(created);
    setUrl('');
    setTitle('');
    setDescription('');
    setAuthorName('');
    setEditorOpen(false);
    await createVideo({ ...created });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <VideoPlayer url={currentVideo?.url} />

        {currentVideo ? (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.authorBadge}>
                <Text style={styles.authorInitial}>
                  {currentVideo.authorName?.[0]?.toUpperCase() ?? 'A'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle} numberOfLines={1}>{currentVideo.title}</Text>
                {!!currentVideo.description && (
                  <Text style={styles.infoDesc} numberOfLines={2}>{currentVideo.description}</Text>
                )}
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={12} color={colors.muted} />
                  <Text style={styles.metaText}>{formatDate(currentVideo.createdAt)}</Text>
                  {!!currentVideo.duration && (
                    <>
                      <Text style={styles.metaSep}>·</Text>
                      <Text style={styles.metaText}>{currentVideo.duration}</Text>
                    </>
                  )}
                </View>
              </View>
              <Pressable onPress={() => setEditorOpen(true)} style={styles.pencilBtn}>
                <Ionicons name="pencil-outline" size={18} color={colors.muted} />
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={styles.noVideo}>Selecciona un vídeo per reproduir-lo</Text>
        )}

        <Text style={styles.section}>Favorits</Text>
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Afegeix un vídeo a la llista o selecciona una existent.</Text>
          }
          renderItem={({ item }) => (
            <VideoCard video={item} onPress={() => setCurrentVideo(item)} />
          )}
          ListFooterComponent={
            <Pressable style={styles.addBtn} onPress={() => setEditorOpen(true)}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Afegir +</Text>
            </Pressable>
          }
        />
      </View>

      <NowPlayingBar
        title={currentVideo?.title}
        author={currentVideo?.authorName}
        thumbnailUrl={currentVideo?.thumbnailUrl}
        onManageLists={() => setListManagerOpen(true)}
      />
      <FloatingMenu
        onHome={() => navigation.navigate('Inici')}
        onUser={() => navigation.navigate('Usuari')}
        onLists={() => navigation.navigate('Llistes')}
      />

      <Modal visible={editorOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Gestor de vídeos</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="URL de YouTube o Instagram"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Títol del vídeo"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descripció (opcional)"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={authorName}
              onChangeText={setAuthorName}
              placeholder="Nom de l'autor (opcional)"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            {availableLists.length > 0 && (
              <View>
                <Text style={styles.inputLabel}>Assignar a llista:</Text>
                <View style={styles.listPicker}>
                  {availableLists.map(l => (
                    <Pressable
                      key={l.id}
                      style={[styles.listChip, selectedListId === l.id && styles.listChipSelected]}
                      onPress={() => setSelectedListId(l.id)}
                    >
                      <Text style={[styles.listChipText, selectedListId === l.id && styles.listChipTextSelected]}>
                        {l.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            <Pressable style={styles.saveBtn} onPress={addVideo}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </Pressable>
            <Pressable onPress={() => setEditorOpen(false)}>
              <Text style={styles.cancel}>Tancar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ListManagerModal
        visible={listManagerOpen}
        onClose={() => setListManagerOpen(false)}
        userId={user?.uid ?? ''}
        onRefresh={() => { loadVideos(); loadLists(); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 12, paddingTop: 50, gap: 8 },
  infoCard: { backgroundColor: colors.card, borderRadius: 12, padding: 10 },
  infoRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  authorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: { color: colors.text, fontWeight: '700', fontSize: 16 },
  infoTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  infoDesc: { color: colors.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { color: colors.muted, fontSize: 11 },
  metaSep: { color: colors.muted, fontSize: 11 },
  pencilBtn: { padding: 4 },
  noVideo: { color: colors.muted, textAlign: 'center', paddingVertical: 8 },
  section: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 4 },
  empty: { color: colors.text, backgroundColor: colors.card, borderRadius: 12, padding: 12 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 140,
  },
  addBtnText: { color: '#fff', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: '#00000080', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 10,
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  input: {
    backgroundColor: '#dce9de',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#111',
  },
  inputLabel: { color: colors.muted, fontSize: 12, marginBottom: 6 },
  listPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  listChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.cardSoft,
  },
  listChipSelected: { backgroundColor: colors.accent },
  listChipText: { color: colors.muted, fontSize: 13 },
  listChipTextSelected: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  cancel: { color: colors.muted, textAlign: 'center', marginTop: 4 },
});
