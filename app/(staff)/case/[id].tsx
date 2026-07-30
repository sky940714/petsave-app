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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../utils/api';
import { ENDPOINTS } from '../../../constants/Config';
import { Case } from '../../../types/case';
import StatusBadge from '../../../components/StatusBadge';
import PhotoUploader from '../../../components/PhotoUploader';
import { formatDateTime } from '../../../utils/time';

export default function StaffCaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const load = useCallback(async () => {
    const result = await apiFetch<Case>(ENDPOINTS.CASE_DETAIL(id), token);
    setCaseData(result);
  }, [id, token]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleAcknowledge = async () => {
    setActing(true);
    try {
      await apiFetch(ENDPOINTS.CASE_ACKNOWLEDGE(id), token, { method: 'PATCH' });
      await load();
    } catch (e: any) {
      Alert.alert('確認失敗', e.message || '請稍後再試');
    } finally {
      setActing(false);
    }
  };

  const handleStart = async () => {
    setActing(true);
    try {
      await apiFetch(ENDPOINTS.CASE_START(id), token, { method: 'PATCH' });
      await load();
    } catch (e: any) {
      Alert.alert('狀態更新失敗', e.message || '請稍後再試');
    } finally {
      setActing(false);
    }
  };

  const handleCloseStandard = async () => {
    if (!resolutionNotes.trim()) return Alert.alert('請填寫處理結果描述');
    setActing(true);
    try {
      await apiFetch(ENDPOINTS.CASE_CLOSE_STANDARD(id), token, {
        method: 'PATCH',
        body: JSON.stringify({ resolution_notes: resolutionNotes }),
      });
      await load();
      Alert.alert('已結案');
    } catch (e: any) {
      Alert.alert('結案失敗', e.message || '請確認三類照片皆已上傳');
    } finally {
      setActing(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.caseNo}>{caseData.case_no}</Text>
          <StatusBadge status={caseData.status} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>案件資訊</Text>
          <InfoRow label="陳情人" value={`${caseData.reporter_name}（${caseData.reporter_phone}）`} />
          <InfoRow label="通報地址" value={caseData.report_address} />
          <InfoRow label="通報事由" value={caseData.report_reason} />
          <InfoRow
            label="動物數量"
            value={`公${caseData.animal_male_count} 母${caseData.animal_female_count} 幼${caseData.animal_juvenile_count} 成${caseData.animal_adult_count}`}
          />
        </View>

        {caseData.status === 'dispatched' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAcknowledge} disabled={acting}>
            {acting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>收到，確認接案</Text>}
          </TouchableOpacity>
        )}

        {caseData.status === 'acknowledged' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStart} disabled={acting}>
            {acting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>開始處理</Text>}
          </TouchableOpacity>
        )}

        {caseData.status === 'in_progress' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>標準結案 — 上傳照片</Text>
            <PhotoUploader
              caseId={caseData.id}
              category="scene"
              token={token}
              photos={caseData.photos ?? []}
              onUploaded={load}
            />
            <PhotoUploader
              caseId={caseData.id}
              category="processing"
              token={token}
              photos={caseData.photos ?? []}
              onUploaded={load}
            />
            <PhotoUploader
              caseId={caseData.id}
              category="triplicate_form"
              token={token}
              photos={caseData.photos ?? []}
              onUploaded={load}
            />

            <Text style={styles.fieldLabel}>處理結果描述</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="請描述處理結果"
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleCloseStandard} disabled={acting}>
              {acting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>確認標準結案</Text>}
            </TouchableOpacity>
          </View>
        )}

        {isClosed && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>結案資訊</Text>
            <InfoRow label="結案類型" value={caseData.close_type === 'standard' ? '標準結案' : '例外結案'} />
            {caseData.resolution_notes ? <InfoRow label="處理結果" value={caseData.resolution_notes} /> : null}
            <InfoRow label="結案時間" value={formatDateTime(caseData.closed_at)} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#3D3635' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  infoLabel: { fontSize: 13, color: '#999', width: 80 },
  infoValue: { fontSize: 13, color: '#3D3635', flex: 1, textAlign: 'right' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#999' },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  primaryBtn: { backgroundColor: '#3D3635', borderRadius: 18, padding: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
