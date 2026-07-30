import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>權限不足</Text>
      <Text style={styles.subtitle}>您的帳號沒有存取此頁面的權限</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
      >
        <Text style={styles.buttonText}>返回登入</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#3D3635' },
  subtitle: { fontSize: 14, color: '#999' },
  button: { marginTop: 20, backgroundColor: '#3D3635', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
