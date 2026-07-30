import React from 'react';
import { Stack } from 'expo-router';
import { useRoleGuard } from '../../hooks/useRoleGuard';

export default function StaffLayout() {
  const { ready, redirect } = useRoleGuard(['field_staff']);
  if (!ready) return redirect;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { color: '#3D3635', fontWeight: '900' },
        headerShadowVisible: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="case/[id]" options={{ title: '案件詳情' }} />
    </Stack>
  );
}
