import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { ENDPOINTS } from '../../constants/Config';
import { Territory, Vehicle } from '../../types/case';
import { REPORT_REASONS, ReportReason } from '../../constants/caseStatus';

export default function CaseNewScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [territories, setTerritories] = useState<Territory[]>([]);
  const [territoryId, setTerritoryId] = useState<number | null>(null);
  const [suggestedVehicle, setSuggestedVehicle] = useState<Vehicle | null>(null);

  const [reporterName, setReporterName] = useState('');
  const [reporterOrg, setReporterOrg] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [maleCount, setMaleCount] = useState('0');
  const [femaleCount, setFemaleCount] = useState('0');
  const [juvenileCount, setJuvenileCount] = useState('0');
  const [adultCount, setAdultCount] = useState('0');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Territory[]>(ENDPOINTS.TERRITORIES, token)
      .then(setTerritories)
      .catch(() => setTerritories([]));
  }, [token]);

  useEffect(() => {
    if (!territoryId) {
      setSuggestedVehicle(null);
      return;
    }
    apiFetch<Vehicle>(ENDPOINTS.VEHICLE_SUGGEST(territoryId), token)
      .then(setSuggestedVehicle)
      .catch(() => setSuggestedVehicle(null));
  }, [territoryId, token]);

  const handleSubmit = async () => {
    if (!reporterName || !reporterPhone || !address || !reason) {
      return Alert.alert('請填寫必填欄位', '陳情人姓名、電話、通報地址、通報事由為必填');
    }
    setSubmitting(true);
    try {
      const result = await apiFetch<{ id: number; case_no: string }>(ENDPOINTS.CASES, token, {
        method: 'POST',
        body: JSON.stringify({
          reporter_name: reporterName,
          reporter_org: reporterOrg || null,
          reporter_phone: reporterPhone,
          report_address: address,
          territory_id: territoryId,
          report_reason: reason,
          animal_male_count: Number(maleCount) || 0,
          animal_female_count: Number(femaleCount) || 0,
          animal_juvenile_count: Number(juvenileCount) || 0,
          animal_adult_count: Number(adultCount) || 0,
        }),
      });
      router.replace(`/(dispatcher)/case/${result.id}`);
    } catch (e: any) {
      Alert.alert('受理失敗', e.message || '請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>陳情人資訊</Text>
      <TextInput style={styles.input} placeholder="陳情人姓名 *" value={reporterName} onChangeText={setReporterName} />
      <TextInput
        style={styles.input}
        placeholder="陳情人單位（可選，如：里辦公室、1999轉來）"
        value={reporterOrg}
        onChangeText={setReporterOrg}
      />
      <TextInput
        style={styles.input}
        placeholder="陳情人電話 *"
        value={reporterPhone}
        onChangeText={setReporterPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.sectionLabel}>案件資訊</Text>
      <TextInput style={styles.input} placeholder="通報地址 *" value={address} onChangeText={setAddress} />

      <Text style={styles.fieldLabel}>轄區</Text>
      <View style={styles.chipRow}>
        {territories.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.chip, territoryId === t.id && styles.chipActive]}
            onPress={() => setTerritoryId(t.id)}
          >
            <Text style={[styles.chipText, territoryId === t.id && styles.chipTextActive]}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {suggestedVehicle && (
        <Text style={styles.suggestText}>建議車號：{suggestedVehicle.vehicle_no}（指派時可調整）</Text>
      )}

      <Text style={styles.fieldLabel}>通報事由 *</Text>
      <View style={styles.chipRow}>
        {REPORT_REASONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, reason === r && styles.chipActive]}
            onPress={() => setReason(r)}
          >
            <Text style={[styles.chipText, reason === r && styles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>動物數量</Text>
      <View style={styles.countRow}>
        <View style={styles.countField}>
          <Text style={styles.fieldLabel}>公</Text>
          <TextInput style={styles.countInput} value={maleCount} onChangeText={setMaleCount} keyboardType="number-pad" />
        </View>
        <View style={styles.countField}>
          <Text style={styles.fieldLabel}>母</Text>
          <TextInput style={styles.countInput} value={femaleCount} onChangeText={setFemaleCount} keyboardType="number-pad" />
        </View>
        <View style={styles.countField}>
          <Text style={styles.fieldLabel}>幼</Text>
          <TextInput style={styles.countInput} value={juvenileCount} onChangeText={setJuvenileCount} keyboardType="number-pad" />
        </View>
        <View style={styles.countField}>
          <Text style={styles.fieldLabel}>成</Text>
          <TextInput style={styles.countInput} value={adultCount} onChangeText={setAdultCount} keyboardType="number-pad" />
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>受理案件</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, gap: 10, paddingBottom: 60 },
  sectionLabel: { fontSize: 15, fontWeight: '900', color: '#3D3635', marginTop: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#999', marginTop: 6 },
  input: {
    backgroundColor: '#F8F9FB',
    padding: 16,
    borderRadius: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#3D3635', borderColor: '#3D3635' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#3D3635' },
  chipTextActive: { color: '#fff' },
  suggestText: { fontSize: 13, color: '#3E7CB1', fontWeight: '700' },
  countRow: { flexDirection: 'row', gap: 10 },
  countField: { flex: 1, alignItems: 'center' },
  countInput: {
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  submitBtn: {
    backgroundColor: '#3D3635',
    padding: 18,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
