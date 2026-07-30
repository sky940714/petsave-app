import React from 'react';
import DemoMapView, { MapPinSpec } from './DemoMapView';

export interface CaseMapPin {
  id: number;
  lat: number;
  lng: number;
  color: string;
  label?: string;
}

// react-native-maps 不支援 web，這裡退回示意地圖，維持與原生版本相同的 props 介面
export default function RealMapView({
  pins,
  height,
  onExpand,
}: {
  pins: CaseMapPin[];
  height?: number;
  onExpand?: () => void;
  showsUserLocation?: boolean;
}) {
  const demoPins: MapPinSpec[] = pins.map((p, idx) => ({
    x: 20 + ((idx * 173) % 60),
    y: 20 + ((idx * 97) % 60),
    color: p.color,
  }));
  return <DemoMapView pins={demoPins} height={height} onExpand={onExpand} />;
}
