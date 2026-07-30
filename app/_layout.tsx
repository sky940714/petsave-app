import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { usePushRegistration } from '../hooks/usePushRegistration';
import { View, ActivityIndicator } from 'react-native';

function RootNavigator() {
  const { loading, user } = useAuth();
  const router = useRouter();
  usePushRegistration();

  // 通知點擊導向：依「目前登入的裝置是哪個角色」決定跳去哪個案件詳情頁，
  // 而不是依通知內容原本設計給誰看 —— 展示模式沒有真正的跨裝置推播，
  // 同一支通知在哪個角色的裝置上被點開，就導去哪個角色的案件詳情頁。
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const caseId = data?.caseId;
      if (!caseId || !user) return;
      // 「體驗鈕」流程的通知由 (staff)/(tabs)/index.tsx 自己的監聽器接手（開啟受理下滑視窗），
      // 這裡不做預設導頁，避免兩邊搶著處理同一則通知。
      if (data?.flow === 'experience') return;
      if (user.role === 'dispatcher') router.push(`/(dispatcher)/case/${caseId}`);
      else if (user.role === 'field_staff') router.push(`/(staff)/case/${caseId}`);
    });
    return () => sub.remove();
  }, [user, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3D3635" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="unauthorized" />
      <Stack.Screen name="(dispatcher)" />
      <Stack.Screen name="(staff)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
