import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { X, MapPin, PawPrint } from 'lucide-react-native';
import { Case } from '../types/case';
import SlideToAccept from './SlideToAccept';

export default function CaseAcceptSheet({
  visible,
  caseData,
  accepting,
  onAccept,
  onClose,
}: {
  visible: boolean;
  caseData: Case | null;
  accepting: boolean;
  onAccept: () => void;
  onClose: () => void;
}) {
  const translateY = useSharedValue(420);

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : 420, { damping: 22, stiffness: 180 });
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>新案件通知</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {caseData && (
            <View style={styles.infoBox}>
              <Text style={styles.caseNo}>{caseData.case_no}</Text>
              <View style={styles.infoRow}>
                <PawPrint size={16} color="#999" />
                <Text style={styles.infoText}>{caseData.report_reason}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={16} color="#999" />
                <Text style={styles.infoText} numberOfLines={2}>
                  {caseData.report_address}
                </Text>
              </View>
              <Text style={styles.detail}>
                陳情人：{caseData.reporter_name}（{caseData.reporter_phone}）
              </Text>
              <Text style={styles.detail}>
                動物數量：公{caseData.animal_male_count} 母{caseData.animal_female_count} 幼
                {caseData.animal_juvenile_count} 成{caseData.animal_adult_count}
              </Text>
            </View>
          )}

          <View style={styles.sliderWrapper}>
            {accepting ? (
              <ActivityIndicator color="#3D3635" />
            ) : (
              <SlideToAccept label="滑動以受理案件" onAccept={onAccept} />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#EEE', alignSelf: 'center', marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '900', color: '#3D3635' },
  infoBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 16,
    gap: 8,
  },
  caseNo: { fontSize: 14, fontWeight: '900', color: '#3D3635', marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 15, fontWeight: '700', color: '#3D3635', flexShrink: 1 },
  detail: { fontSize: 13, color: '#999' },
  sliderWrapper: { marginTop: 24 },
});
