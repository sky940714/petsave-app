import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { PhoneIncoming, MessageCircle, ClipboardList, Truck, Check } from 'lucide-react-native';

export interface AssignResult {
  caseId: number;
  caseNo: string;
  address: string;
  reason: string;
  vehicleNo: string;
  staffName: string;
}

const STEPS = [
  { Icon: PhoneIncoming, text: '民眾撥打動保處/1999進線通報' },
  { Icon: MessageCircle, text: '值班台與民眾了解詳情' },
  { Icon: ClipboardList, text: '受理案件中' },
  { Icon: Truck, text: '指派案件以及車號' },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function IncomingCallSimulation({
  visible,
  onReachAssignStep,
  onComplete,
}: {
  visible: boolean;
  onReachAssignStep: () => Promise<AssignResult>;
  onComplete: (result: AssignResult) => void;
}) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [assignResult, setAssignResult] = useState<AssignResult | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const contentOpacity = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.6);

  useEffect(() => {
    if (!visible) {
      setStepIndex(-1);
      setAssignResult(null);
      setShowCheck(false);
      contentOpacity.value = 0;
      checkOpacity.value = 0;
      checkScale.value = 0.6;
      return;
    }

    let cancelled = false;
    contentOpacity.value = withTiming(1, { duration: 300 });

    const run = async () => {
      setStepIndex(0);
      await sleep(1100);
      if (cancelled) return;
      setStepIndex(1);
      await sleep(1100);
      if (cancelled) return;
      setStepIndex(2);
      await sleep(1100);
      if (cancelled) return;
      setStepIndex(3);

      const result = await onReachAssignStep();
      if (cancelled) return;
      setAssignResult(result);
      await sleep(1300);
      if (cancelled) return;

      contentOpacity.value = withTiming(0, { duration: 350 });
      await sleep(380);
      if (cancelled) return;

      setShowCheck(true);
      checkOpacity.value = withTiming(1, { duration: 250 });
      checkScale.value = withTiming(1, { duration: 250 });
      await sleep(1100);
      if (cancelled) return;

      checkOpacity.value = withTiming(0, { duration: 300 });
      await sleep(320);
      if (cancelled) return;

      onComplete(result);
    };
    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {!showCheck ? (
            <Animated.View style={contentStyle}>
              <Text style={styles.title}>模擬案件受理流程</Text>
              {STEPS.map((step, idx) => {
                if (idx > stepIndex) return null;
                const isDone = idx < stepIndex || (idx === 3 && !!assignResult);
                const label =
                  idx === 3 && assignResult
                    ? `指派車號 ${assignResult.vehicleNo}．${assignResult.staffName}`
                    : step.text;
                return (
                  <View key={idx} style={styles.stepRow}>
                    <View style={[styles.stepIconBox, isDone && styles.stepIconBoxDone]}>
                      {isDone ? <Check size={14} color="#fff" /> : <step.Icon size={14} color="#fff" />}
                    </View>
                    <Text style={styles.stepText}>{label}</Text>
                  </View>
                );
              })}
            </Animated.View>
          ) : (
            <Animated.View style={[styles.checkWrapper, checkStyle]}>
              <View style={styles.checkCircle}>
                <Check size={40} color="#fff" />
              </View>
              <Text style={styles.checkText}>已完成派遣</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    minHeight: 200,
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '900', color: '#3D3635', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  stepIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3E7CB1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconBoxDone: { backgroundColor: '#5B8C5A' },
  stepText: { fontSize: 14, fontWeight: '700', color: '#3D3635', flex: 1 },
  checkWrapper: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#5B8C5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 16, fontWeight: '900', color: '#3D3635' },
});
