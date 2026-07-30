import React from 'react';
import { Stack } from 'expo-router';
import { useRoleGuard } from '../../hooks/useRoleGuard';

export default function AdminLayout() {
  const { ready, redirect } = useRoleGuard(['admin']);
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
      <Stack.Screen name="index" options={{ title: '管理總覽' }} />
      <Stack.Screen name="cases" options={{ title: '案件總覽' }} />
      <Stack.Screen name="case/[id]" options={{ title: '案件詳情' }} />
      <Stack.Screen name="vehicles" options={{ title: '車輛狀態' }} />
      <Stack.Screen name="roster" options={{ title: '班表管理' }} />
      <Stack.Screen name="accounts" options={{ title: '帳號管理' }} />
    </Stack>
  );
}
