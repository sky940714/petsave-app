import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_LABELS: Record<string, string> = {
  standby: '待命中',
  busy: '處理中',
  offline: '離線',
};
const STATUS_COLORS: Record<string, string> = {
  standby: '#5B8C5A',
  busy: '#B15B3E',
  offline: '#999',
};

export default function VehicleStatusPill({ status }: { status: 'standby' | 'busy' | 'offline' }) {
  const color = STATUS_COLORS[status];
  return (
    <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 12, fontWeight: '700' },
});
