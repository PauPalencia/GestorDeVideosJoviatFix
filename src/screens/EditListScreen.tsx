import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { VideoList } from '../types/models';
import { updateList } from '../services/firebaseService';

export const EditListScreen = ({ route, navigation }: any) => {
  const list: VideoList = route.params.list;
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await updateList(list.id, { title: title.trim(), description: description.trim() });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Editar llista</Text>

      <Text style={styles.label}>Títol</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Títol de la llista"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Descripció</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.multiline]}
        placeholder="Descripció de la llista"
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={4}
      />

      <Pressable style={[styles.btn, saving && styles.btnDisabled]} onPress={save} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Guardant...' : 'Guardar canvis'}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.cancel}>Cancel·lar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, paddingTop: 60, gap: 10 },
  heading: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 10 },
  label: { color: colors.muted, fontSize: 13 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  cancel: { color: colors.muted, textAlign: 'center', marginTop: 8 },
});
