import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ClipboardList, Truck, CalendarDays, Users, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { usePolling } from '../../hooks/usePolling';
import { apiFetch } from '../../utils/api';
import { ENDPOINTS } from '../../constants/Config';
import { Case, ExceptionReason } from '../../types/case';

function isToday(isoString: string) {
  const d = new Date(isoString.replace(' ', 'T'));
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function AdminDashboard() {
  const router = useRouter();
  const { logout, token } = useAuth();

  const { data: cases, loading } = usePolling<Case[]>(() => apiFetch<Case[]>(ENDPOINTS.CASES, token), [token]);
  const { data: exceptionReasons } = usePolling<ExceptionReason[]>(
    () => apiFetch<ExceptionReason[]>(ENDPOINTS.EXCEPTION_REASONS, token),
    [token]
  );

  const stats = useMemo(() => {
    const list = cases ?? [];
    const todayReceived = list.filter((c) => isToday(c.received_at)).length;
    const inProgress = list.filter((c) => ['dispatched', 'acknowledged', 'in_progress'].includes(c.status)).length;

    const closed = list.filter((c) => c.status === 'closed');
    const falseReportReasonId = (exceptionReasons ?? []).find((r) => r.code === 'false_report')?.id;
    const falseReportCount = closed.filter((c) => c.exception_reason_id === falseReportReasonId).length;
    const falseReportRate = closed.length > 0 ? Math.round((falseReportCount / closed.length) * 100) : 0;

    return { todayReceived, inProgress, falseReportRate, closedCount: closed.length };
  }, [cases, exceptionReasons]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.headline}>管理總覽</Text>
        <TouchableOpacity onPress={logout}>
          <LogOut size={20} color="#B15B3E" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#3D3635" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.todayReceived}</Text>
            <Text style={styles.statLabel}>今日受理</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>處理中案件</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.falseReportRate}%</Text>
            <Text style={styles.statLabel}>誤報率（{stats.closedCount} 件已結案）</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionHeader}>管理功能</Text>
      <View style={styles.navGrid}>
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(admin)/cases')}>
          <ClipboardList size={22} color="#3D3635" />
          <Text style={styles.navCardText}>案件總覽</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(admin)/vehicles')}>
          <Truck size={22} color="#3D3635" />
          <Text style={styles.navCardText}>車輛狀態</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(admin)/roster')}>
          <CalendarDays size={22} color="#3D3635" />
          <Text style={styles.navCardText}>班表管理</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(admin)/accounts')}>
          <Users size={22} color="#3D3635" />
          <Text style={styles.navCardText}>帳號管理</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>統計數字為展示模式的即時計算，僅供展示參考。</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 60, gap: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headline: { fontSize: 26, fontWeight: '900', color: '#3D3635' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 24, fontWeight: '900', color: '#3D3635' },
  statLabel: { fontSize: 11, color: '#999', fontWeight: '600', textAlign: 'center' },
  sectionHeader: { fontSize: 16, fontWeight: '900', color: '#3D3635', marginTop: 20, marginBottom: 4 },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  navCard: {
    width: '47%',
    backgroundColor: '#F8F9FB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 18,
    gap: 10,
  },
  navCardText: { fontSize: 14, fontWeight: '800', color: '#3D3635' },
  disclaimer: { fontSize: 11, color: '#CCC', marginTop: 24, textAlign: 'center' },
});
