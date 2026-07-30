import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Maximize2 } from 'lucide-react-native';

export interface CaseMapPin {
  id: number;
  lat: number;
  lng: number;
  color: string;
  label?: string;
}

const DEFAULT_CENTER = { latitude: 25.03, longitude: 121.5 };

export default function RealMapView({
  pins,
  height,
  onExpand,
  showsUserLocation = true,
}: {
  pins: CaseMapPin[];
  height?: number;
  onExpand?: () => void;
  showsUserLocation?: boolean;
}) {
  useEffect(() => {
    if (showsUserLocation) {
      Location.requestForegroundPermissionsAsync().catch(() => {});
    }
  }, [showsUserLocation]);

  const center = pins[0] ? { latitude: pins[0].lat, longitude: pins[0].lng } : DEFAULT_CENTER;

  return (
    <View style={[styles.container, height ? { height } : { flex: 1 }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
      >
        {pins.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} pinColor={p.color} title={p.label} />
        ))}
      </MapView>

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
