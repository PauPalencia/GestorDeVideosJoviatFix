import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Video } from '../types/models';
import { colors } from '../theme/colors';

type Props = {
  video: Video;
  onPress: () => void;
};

const formatDate = (ts: any): string => {
  if (!ts) return '';
  const ms = typeof ts === 'number' ? ts : ts?.toMillis?.() ?? (ts?.seconds ? ts.seconds * 1000 : 0);
  return new Date(ms).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const VideoCard: React.FC<Props> = ({ video, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: video.thumbnailUrl || 'https://placehold.co/120x90' }} style={styles.thumb} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title} numberOfLines={1}>{video.title}</Text>
        {!!video.description && (
          <Text style={styles.desc} numberOfLines={2}>{video.description}</Text>
        )}
        <Text style={styles.date}>{formatDate(video.createdAt)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start'
  },
  thumb: { width: 80, height: 60, borderRadius: 8, backgroundColor: '#2e2e2e' },
  title: { color: colors.text, fontWeight: '700', fontSize: 14 },
  desc: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  date: { color: '#8fc18e', fontSize: 11, marginTop: 2 }
});
