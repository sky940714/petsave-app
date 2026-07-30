import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usePolling } from '../../hooks/usePolling';
import { apiFetch } from '../../utils/api';
import { ENDPOINTS } from '../../constants/Config';
import { Case } from '../../types/case';
import { CaseStatus, STATUS_LABELS } from '../../constants/caseStatus';
import CaseCard from '../../components/CaseCard';

const FILTERS: { key: CaseStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'received', label: STATUS_LABELS.received },
  { key: 'dispatched', label: STATUS_LABELS.dispatched },
  { key: 'acknowledged', label: STATUS_LABELS.acknowledged },
  { key: 'in_progress', label: STATUS_LABELS.in_progress },
  { key: 'closed', label: STATUS_LABELS.closed },
];

export default function AdminCasesScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all');

  const { data, loading, refreshing, onRefresh } = usePolling<Case[]>(async () => {
    const url = filter === 'all' ? ENDPOINTS.CASES : `${ENDPOINTS.CASES}?status=${filter}`;
    return apiFetch<Case[]>(url, token);
  }, [token, filter]);

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f.key}
        style={styles.filterRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        style={styles.mainList}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <CaseCard item={item} onPress={() => router.push(`/(admin)/case/${item.id}` as any)} />
        )}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>目前沒有符合條件的案件</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filterRow: { flexGrow: 0, marginVertical: 10 },
  filterChip: {
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: '#3D3635', borderColor: '#3D3635' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#3D3635' },
  filterTextActive: { color: '#fff' },
  mainList: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});
