import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Check } from 'lucide-react-native';
import { uploadCasePhoto } from '../utils/api';
import { CasePhoto } from '../types/case';

const CATEGORY_LABELS: Record<CasePhoto['category'], string> = {
  scene: '事發地點照',
  processing: '處理中照',
  triplicate_form: '三聯單照',
};

export default function PhotoUploader({
  caseId,
  category,
  token,
  photos,
  onUploaded,
}: {
  caseId: number;
  category: CasePhoto['category'];
  token: string | null;
  photos: CasePhoto[];
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const categoryPhotos = photos.filter((p) => p.category === category);

  const upload = async (uri: string) => {
    setUploading(true);
    try {
      await uploadCasePhoto(caseId, category, uri, token);
      onUploaded();
    } catch (e: any) {
      Alert.alert('上傳失敗', e.message || '請稍後再試');
    } finally {
      setUploading(false);
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('需要相機權限');
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) upload(result.assets[0].uri);
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('需要相簿權限');
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) upload(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{CATEGORY_LABELS[category]}</Text>
        {categoryPhotos.length > 0 && (
          <View style={styles.doneRow}>
            <Check size={14} color="#5B8C5A" />
            <Text style={styles.doneText}>已上傳 {categoryPhotos.length} 張</Text>
          </View>
        )}
      </View>

      <View style={styles.thumbRow}>
        {categoryPhotos.map((p) => (
          <Image key={p.id} source={{ uri: p.url }} style={styles.thumb} />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={pickFromCamera} disabled={uploading}>
          <Camera size={16} color="#3D3635" />
          <Text style={styles.buttonText}>拍照</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickFromLibrary} disabled={uploading}>
          <ImageIcon size={16} color="#3D3635" />
          <Text style={styles.buttonText}>從相簿選擇</Text>
        </TouchableOpacity>
        {uploading && <ActivityIndicator />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '700', color: '#3D3635' },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doneText: { fontSize: 12, color: '#5B8C5A', fontWeight: '600' },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#EEE' },
  buttonRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: { fontSize: 13, fontWeight: '700', color: '#3D3635' },
});
