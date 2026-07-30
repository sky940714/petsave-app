import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../utils/api';
import { ENDPOINTS } from '../../../constants/Config';
import { Case } from '../../../types/case';
import StatusBadge from '../../../components/StatusBadge';
import { formatDateTime } from '../../../utils/time';
import { STATUS_LABELS } from '../../../constants/caseStatus';

const PHOTO_CATEGORY_LABELS: Record<string, string> = {
  scene: '事發地點照',
  processing: '處理中照',
  triplicate_form: '三聯單照',
};

export default function AdminCaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [history, setHistory] = useState<{ statusHistory: any[]; assignmentHistory: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [caseResult, historyResult] = await Promise.all([
      apiFetch<Case>(ENDPOINTS.CASE_DETAIL(id), token),
      apiFetch<{ statusHistory: any[]; assignmentHistory: any[] }>(ENDPOINTS.CASE_HISTORY(id), token),
    ]);
    setCaseData(caseResult);
    setHistory(historyResult);
  }, [id, token]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading || !caseData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3D3635" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.caseNo}>{caseData.case_no}</Text>
        <StatusBadge status={caseData.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>案件資訊</Text>
        <InfoRow label="陳情人" value={`${caseData.reporter_name}（${caseData.reporter_phone}）`} />
        {caseData.reporter_org ? <InfoRow label="陳情單位" value={caseData.reporter_org} /> : null}
        <InfoRow label="通報地址" value={caseData.report_address} />
        <InfoRow label="通報事由" value={caseData.report_reason} />
        <InfoRow
          label="動物數量"
          value={`公${caseData.animal_male_count} 母${caseData.animal_female_count} 幼${caseData.animal_juvenile_count} 成${caseData.animal_adult_count}`}
        />
        <InfoRow label="受理時間" value={formatDateTime(caseData.received_at)} />
        <InfoRow label="負責車輛" value={caseData.assigned_vehicle_no ?? '尚未指派'} />
        <InfoRow label="負責人員" value={caseData.assigned_staff_name ?? '尚未指派'} />
      </View>

      {caseData.status === 'closed' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>結案資訊</Text>
          <InfoRow label="結案類型" value={caseData.close_type === 'standard' ? '標準結案' : '例外結案'} />
          {caseData.resolution_notes ? <InfoRow label="處理結果" value={caseData.resolution_notes} /> : null}
          <InfoRow label="結案時間" value={formatDateTime(caseData.closed_at)} />
        </View>
      )}

      {caseData.photos && caseData.photos.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>照片</Text>
          <View style={styles.thumbRow}>
            {caseData.photos.map((p) => (
              <View key={p.id} style={styles.thumbBox}>
                <Text style={styles.thumbLabel}>{PHOTO_CATEGORY_LABELS[p.category] ?? p.category}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {history && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>案件歷程</Text>
          {history.statusHistory.map((h, idx) => (
            <View key={idx} style={styles.historyRow}>
              <Text style={styles.historyText}>
                {formatDateTime(h.changed_at)} — {STATUS_LABELS[h.to_status as keyof typeof STATUS_LABELS]}
                {h.changed_by_name ? `（${h.changed_by_name}）` : ''}
              </Text>
            </View>
          ))}
          {history.assignmentHistory.map((h, idx) => (
            <View key={`a-${idx}`} style={styles.historyRow}>
              <Text style={styles.historyText}>
                {formatDateTime(h.assigned_at)} — 指派車號 {h.vehicle_no} / {h.staff_name}
                {h.reason === 'support_handover' ? '（支援改派）' : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, gap: 16, paddingBottom: 60 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  caseNo: { fontSize: 20, fontWeight: '900', color: '#3D3635' },
  card: {
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#3D3635' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  infoLabel: { fontSize: 13, color: '#999', width: 80 },
  infoValue: { fontSize: 13, color: '#3D3635', flex: 1, textAlign: 'right' },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbBox: { backgroundColor: '#EEE', borderRadius: 10, padding: 8 },
  thumbLabel: { fontSize: 11, color: '#3D3635' },
  historyRow: { paddingVertical: 4, borderTopWidth: 1, borderTopColor: '#EEE' },
  historyText: { fontSize: 12, color: '#666' },
});
