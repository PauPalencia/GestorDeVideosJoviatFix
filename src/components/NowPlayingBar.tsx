import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  title?: string;
  author?: string;
  thumbnailUrl?: string;
  onManageLists?: () => void;
};

export const NowPlayingBar: React.FC<Props> = ({
  title = 'Title',
  author = 'Artist',
  thumbnailUrl,
  onManageLists,
}) => {
  return (
    <View style={styles.container}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="musical-note" size={16} color={colors.muted} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.author} numberOfLines={1}>{author}</Text>
      </View>
      <Pressable style={styles.iconBtn}>
        <Ionicons name="pause" size={20} color={colors.text} />
      </Pressable>
      <Pressable style={styles.iconBtn}>
        <Ionicons name="star-outline" size={20} color={colors.text} />
      </Pressable>
      {onManageLists && (
        <Pressable style={[styles.iconBtn, styles.manageBtn]} onPress={onManageLists}>
          <Ionicons name="list" size={20} color="#fff" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#1b3e24',
    borderTopWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  thumb: { width: 42, height: 42, borderRadius: 6 },
  thumbPlaceholder: {
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { color: colors.text, fontWeight: '600', fontSize: 13 },
  author: { color: colors.muted, fontSize: 11 },
  iconBtn: { padding: 6 },
  manageBtn: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
});
