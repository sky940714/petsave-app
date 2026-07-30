import React from 'react';
import { Platform } from 'react-native';
import type { CaseMapPin } from './RealMapView.native';

export type { CaseMapPin };

// Metro 會優先選 RealMapView.native.tsx / RealMapView.web.tsx（依平台），實際上不會載入這個檔案。
// 這裡只是給 TypeScript 型別檢查用的替身，同時保留 require() 版本以防萬一真的被載入。
type RealMapViewProps = {
  pins: CaseMapPin[];
  height?: number;
  onExpand?: () => void;
  showsUserLocation?: boolean;
};

const impl: React.ComponentType<RealMapViewProps> =
  Platform.OS === 'web' ? require('./RealMapView.web').default : require('./RealMapView.native').default;

export default impl;
