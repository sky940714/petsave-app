import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usePolling } from '../hooks/usePolling';
import { apiFetch } from '../utils/api';
import { ENDPOINTS } from '../constants/Config';
import { Vehicle } from '../types/case';
import VehicleStatusPill from './VehicleStatusPill';
import { formatDateTime } from '../utils/time';

export default function VehicleStatusBoard() {
  const { token } = useAuth();
  const { data, refreshing, onRefresh } = usePolling<Vehicle[]>(
    () => apiFetch<Vehicle[]>(ENDPOINTS.VEHICLES, token),
    [token]
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={data ?? []}
      keyExtractor={(v) => String(v.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <Text style={styles.hint}>
          機動車無固定轄區，需人工判斷是否派遣（例如轄區車忙碌中，或機動車離現場較近）
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.rowTop}>
            <Text style={styles.vehicleNo}>
              {item.vehicle_no} {item.type === 'roaming' ? '（機動車）' : ''}
            </Text>
            <VehicleStatusPill status={item.current_status} />
          </View>
          {item.territory_name && <Text style={styles.territory}>轄區：{item.territory_name}</Text>}
          <Text style={styles.meta}>進行中案件：{item.active_case_count} 件</Text>
          {item.last_position_at && (
            <Text style={styles.meta}>最後位置更新：{formatDateTime(item.last_position_at)}</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, gap: 12 },
  hint: { fontSize: 12, color: '#999', marginBottom: 8, lineHeight: 18 },
  card: {
    backgroundColor: '#F8F9FB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 6,
    marginBottom: 12,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleNo: { fontSize: 16, fontWeight: '900', color: '#3D3635' },
  territory: { fontSize: 12, color: '#666' },
  meta: { fontSize: 12, color: '#999' },
});
