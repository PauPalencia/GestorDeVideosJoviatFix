import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Video, VideoList } from '../types/models';
import {
  createList,
  fetchListById,
  fetchLists,
  fetchVideoById,
  joinListById,
  toggleFavoriteList,
} from '../services/firebaseService';

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onRefresh: () => void;
};

type View = 'select' | 'create';

export const ListManagerModal: React.FC<Props> = ({ visible, onClose, userId, onRefresh }) => {
  const [view, setView] = useState<View>('select');
  const [lists, setLists] = useState<VideoList[]>([]);
  const [loading, setLoading] = useState(false);
  const [addIdInput, setAddIdInput] = useState('');
  const [addIdError, setAddIdError] = useState('');
  const [addingById, setAddingById] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListVideoIdInput, setNewListVideoIdInput] = useState('');
  const [newListVideos, setNewListVideos] = useState<Video[]>([]);
  const [creating, setCreating] = useState(false);
  const [addVideoError, setAddVideoError] = useState('');

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await fetchLists(userId);
    setLists(data as VideoList[]);
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      setView('select');
      setAddIdInput('');
      setAddIdError('');
      load();
    }
  }, [visible]);

  const toggleFav = async (list: VideoList) => {
    const next = !list.isFavorite;
    setLists((prev) => prev.map((l) => (l.id === list.id ? { ...l, isFavorite: next } : l)));
    await toggleFavoriteList(list.id, next);
    onRefresh();
  };

  const handleAddById = async () => {
    if (!addIdInput.trim()) return;
    setAddIdError('');
    setAddingById(true);
    const exists = await fetchListById(addIdInput.trim());
    if (!exists) {
      setAddIdError('No s\'ha trobat cap llista amb aquest ID');
      setAddingById(false);
      return;
    }
    await joinListById(addIdInput.trim(), userId);
    setAddIdInput('');
    setAddingById(false);
    load();
    onRefresh();
  };

  const handleAddVideoToNew = async () => {
    if (!newListVideoIdInput.trim()) return;
    setAddVideoError('');
    const video = await fetchVideoById(newListVideoIdInput.trim());
    if (!video) {
      setAddVideoError('No s\'ha trobat el vídeo');
      return;
    }
    if (newListVideos.find((v) => v.id === video.id)) {
      setAddVideoError('El vídeo ja existeix a la llista');
      return;
    }
    setNewListVideos((prev) => [...prev, video]);
    setNewListVideoIdInput('');
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    await createList({
      title: newListName.trim(),
      description: '',
      ownerUid: userId,
      isFavorite: false,
      videoIds: newListVideos.map((v) => v.id),
    });
    setCreating(false);
    setNewListName('');
    setNewListVideos([]);
    setNewListVideoIdInput('');
    setView('select');
    load();
    onRefresh();
  };

  const goToCreate = () => {
    setView('create');
    setNewListName('');
    setNewListVideos([]);
    setNewListVideoIdInput('');
    setAddVideoError('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {view === 'select' ? (
            <>
              <View style={styles.topBar}>
                <View style={styles.addIdRow}>
                  <TextInput
                    value={addIdInput}
                    onChangeText={setAddIdInput}
                    placeholder="ID de llista per unir-se..."
                    placeholderTextColor={colors.muted}
                    style={styles.addIdInput}
                  />
                  <Pressable style={styles.addIdBtn} onPress={handleAddById} disabled={addingById}>
                    {addingById ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="add" size={18} color="#fff" />
                    )}
                  </Pressable>
                </View>
                <Pressable style={styles.createBtn} onPress={goToCreate}>
                  <Ionicons name="add-circle-outline" size={16} color="#fff" />
                  <Text style={styles.createBtnText}>Nova llista</Text>
                </Pressable>
              </View>

              {!!addIdError && <Text style={styles.error}>{addIdError}</Text>}

              {loading ? (
                <ActivityIndicator color={colors.success} style={{ marginVertical: 20 }} />
              ) : (
                <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                  {lists.length === 0 ? (
                    <Text style={styles.empty}>Sense llistes. Crea'n una!</Text>
                  ) : (
                    lists.map((item) => (
                      <Pressable key={item.id} style={styles.listRow} onPress={() => toggleFav(item)}>
                        <Ionicons
                          name={item.isFavorite ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={item.isFavorite ? colors.accent : colors.muted}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listTitle}>{item.title}</Text>
                          <Text style={styles.listSub} numberOfLines={1}>
                            {item.videoIds?.length
                              ? `${item.videoIds.length} vídeo(s)`
                              : 'Sense vídeos'}
                          </Text>
                        </View>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              )}

              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={20} color={colors.text} />
                <Text style={styles.closeBtnText}>Tancar</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.createHeader}>
                <Pressable onPress={() => setView('select')} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={22} color={colors.text} />
                </Pressable>
                <TextInput
                  value={newListName}
                  onChangeText={setNewListName}
                  placeholder="Nom de la llista"
                  placeholderTextColor={colors.muted}
                  style={styles.nameInput}
                  autoFocus
                />
                <Pressable
                  style={[styles.saveBtn, (!newListName.trim() || creating) && styles.saveBtnDisabled]}
                  onPress={handleCreateList}
                  disabled={!newListName.trim() || creating}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="checkmark" size={22} color="#fff" />
                  )}
                </Pressable>
              </View>

              <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {newListVideos.length === 0 ? (
                  <Text style={styles.empty}>Sense vídeos. Afegeix-ne un per ID.</Text>
                ) : (
                  newListVideos.map((v) => (
                    <View key={v.id} style={styles.videoRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.videoTitle} numberOfLines={1}>{v.title}</Text>
                        <Text style={styles.videoUrl} numberOfLines={1}>{v.url}</Text>
                      </View>
                      <Pressable onPress={() => setNewListVideos((prev) => prev.filter((x) => x.id !== v.id))}>
                        <Ionicons name="close-circle" size={20} color={colors.muted} />
                      </Pressable>
                    </View>
                  ))
                )}
              </ScrollView>

              <View style={styles.addVideoRow}>
                <TextInput
                  value={newListVideoIdInput}
                  onChangeText={setNewListVideoIdInput}
                  placeholder="ID del vídeo"
                  placeholderTextColor={colors.muted}
                  style={styles.addIdInput}
                />
                <Pressable style={styles.addIdBtn} onPress={handleAddVideoToNew}>
                  <Ionicons name="add" size={18} color="#fff" />
                </Pressable>
              </View>
              {!!addVideoError && <Text style={styles.error}>{addVideoError}</Text>}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000080', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    gap: 10,
  },
  topBar: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addIdRow: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center' },
  addIdInput: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 13,
  },
  addIdBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  createBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  listContainer: { maxHeight: 300 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardSoft,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  listTitle: { color: colors.text, fontWeight: '600' },
  listSub: { color: colors.muted, fontSize: 12 },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  closeBtnText: { color: colors.text, fontWeight: '600' },
  createHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { padding: 4 },
  nameInput: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  videoTitle: { color: colors.text, fontWeight: '600', fontSize: 13 },
  videoUrl: { color: colors.muted, fontSize: 11 },
  addVideoRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  error: { color: colors.danger, fontSize: 12 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 16 },
});
