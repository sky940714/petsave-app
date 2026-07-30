import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { Maximize2, Compass, PawPrint } from 'lucide-react-native';

export interface MapPinSpec {
  x: number; // 0-100 (% across)
  y: number; // 0-100 (% down)
  color: string;
}

// 純視覺展示用的「假地圖」— 不連接真實地圖圖資，只為了呈現類似 Uber 司機端首頁的視覺效果
export default function DemoMapView({
  pins,
  onExpand,
  height,
}: {
  pins: MapPinSpec[];
  onExpand?: () => void;
  height?: number;
}) {
  return (
    <View style={[styles.container, height ? { height } : { flex: 1 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <Rect x={0} y={0} width={100} height={100} fill="#F1E9DC" />
        <Path d="M -5 30 C 20 20, 30 45, 50 40 S 80 20, 105 35" stroke="#BFD3E6" strokeWidth={3} fill="none" />
        <Path d="M -5 65 C 25 60, 35 80, 60 72 S 90 85, 105 75" stroke="#BFD3E6" strokeWidth={2.2} fill="none" />
        <Path d="M 15 -5 C 25 20, 10 40, 25 60 S 20 90, 30 105" stroke="#D8CDBB" strokeWidth={1.5} fill="none" />
        <Path d="M 70 -5 C 65 25, 78 45, 68 65 S 75 90, 72 105" stroke="#D8CDBB" strokeWidth={1.5} fill="none" />
        {pins.map((p, idx) => (
          <Circle key={idx} cx={p.x} cy={p.y} r={9} fill={p.color} opacity={0.16} />
        ))}
      </Svg>

      {pins.map((p, idx) => (
        <View
          key={idx}
          style={[
            styles.pin,
            { left: `${p.x}%`, top: `${p.y}%`, backgroundColor: p.color, transform: [{ translateX: -14 }, { translateY: -14 }] },
          ]}
        >
          <PawPrint size={14} color="#fff" />
        </View>
      ))}

      <View style={styles.centerMarker}>
        <Compass size={20} color="#fff" />
      </View>

      {onExpand && (
        <TouchableOpacity style={styles.expandBtn} onPress={onExpand}>
          <Maximize2 size={18} color="#3D3635" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F1E9DC',
    position: 'relative',
  },
  pin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  centerMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  expandBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
