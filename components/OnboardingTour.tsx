import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

export interface TourStep {
  Icon: LucideIcon;
  title: string;
  description: string;
}

export default function OnboardingTour({
  visible,
  steps,
  onFinish,
}: {
  visible: boolean;
  steps: TourStep[];
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      setIndex(0);
      onFinish();
    } else {
      setIndex(index + 1);
    }
  };

  const handleSkip = () => {
    setIndex(0);
    onFinish();
  };

  if (!step) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>跳過</Text>
          </TouchableOpacity>

          <View style={styles.iconBox}>
            <step.Icon size={32} color="#fff" />
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.dotsRow}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextText}>{isLast ? '開始使用' : '下一步'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
  },
  skipBtn: { position: 'absolute', top: 16, right: 16, padding: 6 },
  skipText: { fontSize: 13, color: '#999', fontWeight: '700' },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#3D3635',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  title: { fontSize: 18, fontWeight: '900', color: '#3D3635', textAlign: 'center', marginBottom: 10 },
  description: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EEE' },
  dotActive: { backgroundColor: '#3D3635', width: 18 },
  nextBtn: {
    width: '100%',
    backgroundColor: '#3D3635',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
