import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { usePolling } from '../../../hooks/usePolling';
import { apiFetch } from '../../../utils/api';
import { ENDPOINTS } from '../../../constants/Config';
import { Case } from '../../../types/case';
import CaseCard from '../../../components/CaseCard';

export default function StaffHistoryTab() {
  const router = useRouter();
  const { token } = useAuth();

  const { data, loading, refreshing, onRefresh } = usePolling<Case[]>(
    () => apiFetch<Case[]>(ENDPOINTS.CASES, token),
    [token]
  );

  const closedCases = (data ?? []).filter((c) => c.status === 'closed');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>歷史案件</Text>
      </View>
      <FlatList
        data={closedCases}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <CaseCard item={item} onPress={() => router.push(`/(staff)/case/${item.id}`)} />
        )}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>目前沒有已結案的紀錄</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#3D3635' },
  listContent: { padding: 16, paddingBottom: 140 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});
