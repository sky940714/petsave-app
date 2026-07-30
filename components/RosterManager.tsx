import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { ENDPOINTS } from '../constants/Config';
import { Vehicle } from '../types/case';
import RosterShiftTable, { RosterEntry, StaffOption } from './RosterShiftTable';

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_OPTIONS = [
  { offset: 1, label: '明天', date: dateOffset(1) },
  { offset: 2, label: '後天', date: dateOffset(2) },
];
const SHIFTS = ['小夜', '大夜'] as const;

// 值班台與管理端共用的班表編輯畫面（需求規格 VI：兩者皆有班表編輯/發布權限）
export default function RosterManager() {
  const { token } = useAuth();
  const [dayOffset, setDayOffset] = useState(1);
  const [shift, setShift] = useState<'小夜' | '大夜'>('小夜');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [rosterData, setRosterData] = useState<{ published: boolean; entries: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const selectedDate = DAY_OPTIONS.find((d) => d.offset === dayOffset)!.date;

  const load = useCallback(async () => {
    const [vehicleResult, userResult, rosterResult] = await Promise.all([
      apiFetch<Vehicle[]>(ENDPOINTS.VEHICLES, token),
      apiFetch<any[]>(ENDPOINTS.USERS, token),
      apiFetch<{ published: boolean; entries: any[] }>(ENDPOINTS.ROSTER(selectedDate, shift), token),
    ]);
    setVehicles(vehicleResult);
    setStaffOptions(userResult.filter((u) => u.role === 'field_staff' && u.status === 'active'));
    setRosterData(rosterResult);
  }, [token, selectedDate, shift]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const entries: RosterEntry[] = useMemo(() => {
    return vehicles.map((v) => {
      const match = rosterData?.entries.find((e) => e.vehicle_id === v.id);
      return {
        vehicle_id: v.id,
        vehicle_no: v.vehicle_no,
        staff_user_id: match?.staff_user_id ?? null,
        staff_name: match?.staff_name ?? null,
      };
    });
  }, [vehicles, rosterData]);

  const handleAssign = async (vehicleId: number, staffUserId: number) => {
    try {
      await apiFetch(ENDPOINTS.ROSTER_UPSERT, token, {
        method: 'POST',
        body: JSON.stringify({ date: selectedDate, shift, entries: [{ vehicle_id: vehicleId, staff_user_id: staffUserId }] }),
      });
      await load();
    } catch (e: any) {
      Alert.alert('更新失敗', e.message || '請稍後再試');
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await apiFetch(ENDPOINTS.ROSTER_PUBLISH, token, {
        method: 'POST',
        body: JSON.stringify({ date: selectedDate, shift }),
      });
      await load();
      Alert.alert('班表已發布');
    } catch (e: any) {
      Alert.alert('發布失敗', e.message || '請稍後再試');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tabRow}>
        {DAY_OPTIONS.map((d) => (
          <TouchableOpacity
            key={d.offset}
            style={[styles.tab, dayOffset === d.offset && styles.tabActive]}
            onPress={() => setDayOffset(d.offset)}
          >
            <Text style={[styles.tabText, dayOffset === d.offset && styles.tabTextActive]}>
              {d.label} {d.date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabRow}>
        {SHIFTS.map((s) => (
          <TouchableOpacity key={s} style={[styles.tab, shift === s && styles.tabActive]} onPress={() => setShift(s)}>
            <Text style={[styles.tabText, shift === s && styles.tabTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!rosterData?.published && (
        <View style={styles.warningBanner}>
          <AlertTriangle size={16} color="#B15B3E" />
          <Text style={styles.warningText}>班表未發布 — 出勤人員在此班別看到的班表會顯示「未更新」</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} color="#3D3635" />
      ) : (
        <RosterShiftTable entries={entries} editable staffOptions={staffOptions} onAssign={handleAssign} />
      )}

      <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} disabled={publishing}>
        {publishing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.publishText}>{rosterData?.published ? '重新發布' : '發布班表'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, gap: 14, paddingBottom: 60 },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  tabActive: { backgroundColor: '#3D3635', borderColor: '#3D3635' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#3D3635' },
  tabTextActive: { color: '#fff' },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FBEDE7',
    borderRadius: 14,
    padding: 12,
  },
  warningText: { fontSize: 12, color: '#B15B3E', flex: 1, lineHeight: 18 },
  publishBtn: { backgroundColor: '#3D3635', borderRadius: 20, padding: 16, alignItems: 'center', marginTop: 10 },
  publishText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
