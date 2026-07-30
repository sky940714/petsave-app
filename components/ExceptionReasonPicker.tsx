import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ENDPOINTS } from '../constants/Config';
import { apiFetch } from '../utils/api';
import { ExceptionReason } from '../types/case';

export default function ExceptionReasonPicker({
  token,
  value,
  onChange,
}: {
  token: string | null;
  value: number | null;
  onChange: (id: number) => void;
}) {
  const [reasons, setReasons] = useState<ExceptionReason[]>([]);

  useEffect(() => {
    apiFetch<ExceptionReason[]>(ENDPOINTS.EXCEPTION_REASONS, token)
      .then(setReasons)
      .catch(() => setReasons([]));
  }, [token]);

  return (
    <View style={styles.container}>
      {reasons.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={[styles.option, value === r.id && styles.optionSelected]}
          onPress={() => onChange(r.id)}
        >
          <Text style={[styles.optionText, value === r.id && styles.optionTextSelected]}>{r.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionSelected: {
    backgroundColor: '#3D3635',
    borderColor: '#3D3635',
  },
  optionText: { fontSize: 13, fontWeight: '600', color: '#3D3635' },
  optionTextSelected: { color: '#fff' },
});
