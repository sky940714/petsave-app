import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { ChevronsRight } from 'lucide-react-native';

const KNOB_SIZE = 52;
const TRACK_PADDING = 4;

export default function SlideToAccept({
  label,
  onAccept,
  disabled,
}: {
  label: string;
  onAccept: () => void;
  disabled?: boolean;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const [completed, setCompleted] = useState(false);

  const maxTranslate = Math.max(trackWidth - KNOB_SIZE - TRACK_PADDING * 2, 1);

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const triggerAccept = () => {
    setCompleted(true);
    onAccept();
  };

  const pan = Gesture.Pan()
    .enabled(!disabled && !completed)
    .onChange((e) => {
      const next = translateX.value + e.changeX;
      translateX.value = Math.min(Math.max(next, 0), maxTranslate);
    })
    .onEnd(() => {
      if (translateX.value > maxTranslate * 0.7) {
        translateX.value = withSpring(maxTranslate);
        runOnJS(triggerAccept)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: translateX.value + KNOB_SIZE }));
  const textStyle = useAnimatedStyle(() => ({ opacity: 1 - translateX.value / maxTranslate }));

  return (
    <View style={styles.track} onLayout={handleLayout}>
      <Animated.View style={[styles.fill, fillStyle]} />
      <Animated.Text style={[styles.label, textStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, knobStyle]}>
          <ChevronsRight size={22} color="#fff" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const TRACK_HEIGHT = KNOB_SIZE + TRACK_PADDING * 2;

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#5B8C5A55',
  },
  label: { textAlign: 'center', fontWeight: '800', color: '#3D3635', fontSize: 14 },
  knob: {
    position: 'absolute',
    left: TRACK_PADDING,
    top: TRACK_PADDING,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#3D3635',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
