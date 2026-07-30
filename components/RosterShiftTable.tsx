import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

export interface RosterEntry {
  vehicle_id: number;
  vehicle_no: string;
  staff_user_id: number | null;
  staff_name: string | null;
}

export interface StaffOption {
  id: number;
  full_name: string;
}

export default function RosterShiftTable({
  entries,
  editable,
  staffOptions,
  onAssign,
}: {
  entries: RosterEntry[];
  editable: boolean;
  staffOptions?: StaffOption[];
  onAssign?: (vehicleId: number, staffUserId: number) => void;
}) {
  const [expandedVehicleId, setExpandedVehicleId] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      {entries.map((entry) => (
        <View key={entry.vehicle_id} style={styles.row}>
          <TouchableOpacity
            style={styles.rowHeader}
            disabled={!editable}
            onPress={() => setExpandedVehicleId(expandedVehicleId === entry.vehicle_id ? null : entry.vehicle_id)}
          >
            <Text style={styles.vehicleNo}>車號 {entry.vehicle_no}</Text>
            <View style={styles.staffRow}>
              <Text style={[styles.staffName, !entry.staff_name && styles.staffNameEmpty]}>
                {entry.staff_name ?? '未指派'}
              </Text>
              {editable && <ChevronDown size={16} color="#999" />}
            </View>
          </TouchableOpacity>

          {editable && expandedVehicleId === entry.vehicle_id && (
            <View style={styles.optionsBox}>
              {(staffOptions ?? []).map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.optionItem}
                  onPress={() => {
                    onAssign?.(entry.vehicle_id, s.id);
                    setExpandedVehicleId(null);
                  }}
                >
                  <Text style={styles.optionText}>{s.full_name}</Text>
                </TouchableOpacity>
              ))}
              {(staffOptions ?? []).length === 0 && <Text style={styles.optionText}>目前無可指派人員</Text>}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  row: {
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  vehicleNo: { fontSize: 15, fontWeight: '800', color: '#3D3635' },
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  staffName: { fontSize: 14, fontWeight: '600', color: '#3D3635' },
  staffNameEmpty: { color: '#CCC' },
  optionsBox: { borderTopWidth: 1, borderTopColor: '#EEE' },
  optionItem: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EEE' },
  optionText: { fontSize: 14, color: '#3D3635' },
});
