import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import StatusBadge from './StatusBadge';
import { Case } from '../types/case';
import { elapsedSince } from '../utils/time';

export default function CaseCard({ item, onPress }: { item: Case; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        <Text style={styles.caseNo}>{item.case_no}</Text>
        <StatusBadge status={item.status} />
      </View>

      <Text style={styles.reason}>{item.report_reason}</Text>

      <View style={styles.row}>
        <MapPin size={14} color="#999" />
        <Text style={styles.rowText} numberOfLines={1}>
          {item.report_address}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.row}>
          <Clock size={14} color="#999" />
          <Text style={styles.rowText}>{elapsedSince(item.received_at)}</Text>
        </View>
        {item.assigned_vehicle_no ? (
          <Text style={styles.vehicleText}>車號 {item.assigned_vehicle_no}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseNo: {
    fontSize: 15,
    fontWeight: '900',
    color: '#3D3635',
  },
  reason: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D3635',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowText: {
    fontSize: 13,
    color: '#999',
    flexShrink: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3E7CB1',
  },
});
