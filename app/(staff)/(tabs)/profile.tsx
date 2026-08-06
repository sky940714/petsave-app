import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { UserCircle2, LogOut, Clock, Camera, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../utils/api';
import { ENDPOINTS } from '../../../constants/Config';
import { AttendanceRecord } from '../../../types/case';
import { formatDateTime } from '../../../utils/time';
import { deleteAccount } from '../../../mock/mockStore';

export default function StaffProfileTab() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleDeleteAccount = () => {
    Alert.alert(
      '刪除帳號 / Delete Account',
      '確定要刪除帳號嗎？此操作無法復原。\nAre you sure? This cannot be undone.',
      [
        { text: '取消 Cancel', style: 'cancel' },
        {
          text: '確認刪除 Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              deleteAccount(token);
              await logout();
              router.replace('/login' as any);
            } catch (e: any) {
              Alert.alert('刪除失敗', e.message || '請稍後再試');
            }
          },
        },
      ]
    );
  };
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  const load = useCallback(async () => {
    const result = await apiFetch<AttendanceRecord[]>(ENDPOINTS.ATTENDANCE_LIST, token);
    setRecords(result);
  }, [token]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onDuty = records[0]?.type === 'in';

  const handlePunch = async () => {
    setPunching(true);
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPerm.granted) {
        Alert.alert('需要相機權限', '打卡需要拍照存證，請允許使用相機');
        return;
      }
      const photo = await ImagePicker.launchCameraAsync({ quality: 0.6 });
      if (photo.canceled || !photo.assets[0]) return;

      const locationPerm = await Location.requestForegroundPermissionsAsync();
      let lat: number | null = null;
      let lng: number | null = null;
      let address: string | null = null;
      if (locationPerm.granted) {
        const position = await Location.getCurrentPositionAsync({});
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }).catch(() => [null]);
        address = place ? `${place.city ?? ''}${place.district ?? ''}${place.street ?? ''}` : null;
      }

      const endpoint = onDuty ? ENDPOINTS.ATTENDANCE_CLOCK_OUT : ENDPOINTS.ATTENDANCE_CLOCK_IN;
      await apiFetch(endpoint, token, {
        method: 'POST',
        body: JSON.stringify({ photo_url: photo.assets[0].uri, lat, lng, address }),
      });
      await load();
    } catch (e: any) {
      Alert.alert('打卡失敗', e.message || '請稍後再試');
    } finally {
      setPunching(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <UserCircle2 size={40} color="#fff" />
        </View>
        <View>
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.role}>出勤人員</Text>
        </View>
      </View>

      <View style={styles.dutyCard}>
        <View style={styles.dutyHeaderRow}>
          <Clock size={18} color="#3D3635" />
          <Text style={styles.dutyLabel}>
            {onDuty ? `打卡上班中（${formatDateTime(records[0].timestamp)} 起）` : '尚未打卡上班'}
          </Text>
        </View>

        <TouchableOpacity style={[styles.dutyBtn, onDuty && styles.dutyBtnActive]} onPress={handlePunch} disabled={punching}>
          {punching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Camera size={18} color="#fff" />
              <Text style={styles.dutyBtnText}>{onDuty ? '拍照打卡下班' : '拍照打卡上班'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>我的出勤紀錄</Text>

      {loading ? (
        <ActivityIndicator color="#3D3635" style={{ marginTop: 20 }} />
      ) : records.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>目前還沒有打卡紀錄</Text>
        </View>
      ) : (
        records.map((r) => (
          <View key={r.id} style={styles.recordRow}>
            <Image source={{ uri: r.photo_url }} style={styles.recordThumb} />
            <View style={{ flex: 1 }}>
              <View style={styles.recordHeaderRow}>
                <View style={[styles.recordBadge, r.type === 'in' ? styles.recordBadgeIn : styles.recordBadgeOut]}>
                  <Text style={styles.recordBadgeText}>{r.type === 'in' ? '上班' : '下班'}</Text>
                </View>
                <Text style={styles.recordTime}>{formatDateTime(r.timestamp)}</Text>
              </View>
              {r.address ? <Text style={styles.recordAddress}>{r.address}</Text> : null}
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <LogOut size={18} color="#B15B3E" />
        <Text style={styles.logoutText}>登出 / Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
        <Trash2 size={16} color="#999" />
        <Text style={styles.deleteText}>刪除帳號 / Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 140, gap: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3D3635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '900', color: '#3D3635' },
  role: { fontSize: 13, color: '#999', fontWeight: '600', marginTop: 2 },
  dutyCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 14,
  },
  dutyHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dutyLabel: { fontSize: 14, fontWeight: '800', color: '#3D3635' },
  dutyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3D3635',
    borderRadius: 18,
    paddingVertical: 14,
  },
  dutyBtnActive: { backgroundColor: '#B15B3E' },
  dutyBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  sectionHeader: { fontSize: 16, fontWeight: '900', color: '#3D3635', marginTop: 4 },
  emptyBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  emptyText: { color: '#999', textAlign: 'center' },
  recordRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
  },
  recordThumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#EEE' },
  recordHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  recordBadgeIn: { backgroundColor: '#5B8C5A22' },
  recordBadgeOut: { backgroundColor: '#B15B3E22' },
  recordBadgeText: { fontSize: 11, fontWeight: '800', color: '#3D3635' },
  recordTime: { fontSize: 12, color: '#999', fontWeight: '600' },
  recordAddress: { fontSize: 12, color: '#999', marginTop: 4 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#B15B3E',
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutText: { color: '#B15B3E', fontWeight: '800' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  deleteText: { color: '#CCC', fontSize: 12, fontWeight: '600' },
});
