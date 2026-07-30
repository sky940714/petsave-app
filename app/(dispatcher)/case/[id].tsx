import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../utils/api';
import { ENDPOINTS } from '../../../constants/Config';
import { Case, Vehicle } from '../../../types/case';
import StatusBadge from '../../../components/StatusBadge';
import ExceptionReasonPicker from '../../../components/ExceptionReasonPicker';
import { formatDateTime } from '../../../utils/time';
import { STATUS_LABELS } from '../../../constants/caseStatus';

interface StaffOption {
  id: number;
  full_name: string;
}

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [history, setHistory] = useState<{ statusHistory: any[]; assignmentHistory: any[] } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionReasonId, setExceptionReasonId] = useState<number | null>(null);
  const [exceptionNotes, setExceptionNotes] = useState('');
  const [closing, setClosing] = useState(false);

  const load = useCallback(async () => {
    const [caseResult, historyResult, vehicleResult, userResult] = await Promise.all([
      apiFetch<Case>(ENDPOINTS.CASE_DETAIL(id), token),
      apiFetch<{ statusHistory: any[]; assignmentHistory: any[] }>(ENDPOINTS.CASE_HISTORY(id), token),
      apiFetch<Vehicle[]>(ENDPOINTS.VEHICLES, token),
      apiFetch<any[]>(ENDPOINTS.USERS, token),
    ]);
    setCaseData(caseResult);
    setHistory(historyResult);
    setVehicles(vehicleResult);
    setStaffOptions(userResult.filter((u) => u.role === 'field_staff' && u.status === 'active'));
    setSelectedVehicleId(caseResult.assigned_vehicle_id);
    setSelectedStaffId(caseResult.assigned_staff_id);
  }, [id, token]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleDispatch = async () => {
    if (!selectedVehicleId || !selectedStaffId) {
      return Alert.alert('請選擇車輛與人員');
    }
    setDispatching(true);
    try {
      await apiFetch(ENDPOINTS.CASE_DISPATCH(id), token, {
        method: 'PATCH',
        body: JSON.stringify({ vehicle_id: selectedVehicleId, staff_id: selectedStaffId }),
      });
      await load();
      Alert.alert('已指派');
    } catch (e: any) {
      Alert.alert('指派失敗', e.message || '請稍後再試');
    } finally {
      setDispatching(false);
    }
  };

  const handleExceptionClose = async () => {
    if (!exceptionReasonId) return Alert.alert('請選擇例外結案原因');
    setClosing(true);
    try {
      await apiFetch(ENDPOINTS.CASE_CLOSE_EXCEPTION(id), token, {
        method: 'PATCH',
        body: JSON.stringify({ exception_reason_id: exceptionReasonId, notes: exceptionNotes || undefined }),
      });
      setShowExceptionForm(false);
      await load();
    } catch (e: any) {
      Alert.alert('例外結案失敗', e.message || '請稍後再試');
    } finally {
      setClosing(false);
    }
  };

  if (loading || !caseData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3D3635" />
      </View>
    );
  }

  const isClosed = caseData.status === 'closed';

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
      </View>

      {!isClosed && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{caseData.assigned_vehicle_id ? '改派車輛/人員' : '指派車輛/人員'}</Text>
          <Text style={styles.fieldLabel}>車輛</Text>
          <View style={styles.chipRow}>
            {vehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.chip, selectedVehicleId === v.id && styles.chipActive]}
                onPress={() => setSelectedVehicleId(v.id)}
              >
                <Text style={[styles.chipText, selectedVehicleId === v.id && styles.chipTextActive]}>
                  {v.vehicle_no} {v.type === 'roaming' ? '(機動)' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>人員</Text>
          <View style={styles.chipRow}>
            {staffOptions.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.chip, selectedStaffId === s.id && styles.chipActive]}
                onPress={() => setSelectedStaffId(s.id)}
              >
                <Text style={[styles.chipText, selectedStaffId === s.id && styles.chipTextActive]}>
                  {s.full_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleDispatch} disabled={dispatching}>
            {dispatching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>{caseData.assigned_vehicle_id ? '確認改派' : '確認指派'}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {caseData.photos && caseData.photos.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>照片</Text>
          <View style={styles.thumbRow}>
            {caseData.photos.map((p) => (
              <View key={p.id} style={styles.thumbBox}>
                <Text style={styles.thumbLabel}>
                  {p.category === 'scene' ? '事發地點照' : p.category === 'processing' ? '處理中照' : '三聯單照'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!isClosed && (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setShowExceptionForm(!showExceptionForm)}>
            <Text style={styles.cardTitle}>例外結案</Text>
          </TouchableOpacity>
          {showExceptionForm && (
            <View style={{ gap: 10, marginTop: 10 }}>
              <ExceptionReasonPicker token={token} value={exceptionReasonId} onChange={setExceptionReasonId} />
              <TextInput
                style={styles.notesInput}
                placeholder="備註（選填）"
                value={exceptionNotes}
                onChangeText={setExceptionNotes}
                multiline
              />
              <TouchableOpacity style={styles.dangerBtn} onPress={handleExceptionClose} disabled={closing}>
                {closing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>確認例外結案</Text>}
              </TouchableOpacity>
            </View>
          )}
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

function InfoRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, warn && { color: '#B15B3E', fontWeight: '700' }]}>{value}</Text>
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
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#999' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#3D3635', borderColor: '#3D3635' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#3D3635' },
  chipTextActive: { color: '#fff' },
  primaryBtn: { backgroundColor: '#3D3635', borderRadius: 16, padding: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  dangerBtn: { backgroundColor: '#B15B3E', borderRadius: 16, padding: 14, alignItems: 'center' },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbBox: { backgroundColor: '#EEE', borderRadius: 10, padding: 8 },
  thumbLabel: { fontSize: 11, color: '#3D3635' },
  historyRow: { paddingVertical: 4, borderTopWidth: 1, borderTopColor: '#EEE' },
  historyText: { fontSize: 12, color: '#666' },
});
