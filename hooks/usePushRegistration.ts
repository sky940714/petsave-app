import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { ENDPOINTS, MOCK_MODE } from '../constants/Config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushRegistration() {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) return;
    if (MOCK_MODE) return; // 展示模式不需要真正的推播權限與註冊

    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.HIGH,
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const pushToken = await Notifications.getExpoPushTokenAsync();
        await apiFetch(ENDPOINTS.PUSH_TOKENS, token, {
          method: 'POST',
          body: JSON.stringify({ expo_push_token: pushToken.data, device_info: Platform.OS }),
        });
      } catch (e) {
        console.error('推播註冊失敗:', e);
      }
    })();
  }, [user, token]);
}
