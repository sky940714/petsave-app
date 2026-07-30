import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, Radio, Truck, ShieldCheck, PawPrint } from 'lucide-react-native';
import { useAuth, Role } from '../context/AuthContext';
import { loginAsRole } from '../mock/mockStore';

export default function LoginScreen() {
  const [loading, setLoading] = useState<Role | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const goToRoleHome = (role: Role) => {
    if (role === 'dispatcher') router.replace('/(dispatcher)');
    else if (role === 'field_staff') router.replace('/(staff)');
    else if (role === 'admin') router.replace('/(admin)' as any);
    else router.replace('/unauthorized');
  };

  const handleDemoLogin = async (role: Role) => {
    setLoading(role);
    try {
      const data = loginAsRole(role);
      await login(data.token, data.user);
      goToRoleHome(data.user.role);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <PawPrint color="#fff" size={40} />
          </View>
          <Text style={styles.title}>PetSave 派遣系統</Text>
          <View style={styles.demoBadge}>
            <Sparkles size={12} color="#D97A3D" />
            <Text style={styles.demoBadgeText}>展示 DEMO 版本．資料皆為模擬展示</Text>
          </View>
          <Text style={styles.subTitle}>動物救援勤務派遣管理</Text>
        </View>

        <Text style={styles.pickLabel}>請選擇要體驗的身份</Text>

        <TouchableOpacity
          style={[styles.demoBtn, styles.demoBtnDispatcher]}
          onPress={() => handleDemoLogin('dispatcher')}
          disabled={loading !== null}
        >
          <View style={styles.demoBtnIconBox}>
            <Radio size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBtnTitle}>值班台</Text>
            <Text style={styles.demoBtnDesc}>受理案件、指派車輛、班表管理</Text>
          </View>
          {loading === 'dispatcher' && <ActivityIndicator color="#3D3635" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoBtn, styles.demoBtnStaff]}
          onPress={() => handleDemoLogin('field_staff')}
          disabled={loading !== null}
        >
          <View style={styles.demoBtnIconBox}>
            <Truck size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBtnTitle}>出勤人員</Text>
            <Text style={styles.demoBtnDesc}>接收案件、到場打卡、回報結案</Text>
          </View>
          {loading === 'field_staff' && <ActivityIndicator color="#3D3635" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoBtn, styles.demoBtnAdmin]}
          onPress={() => handleDemoLogin('admin')}
          disabled={loading !== null}
        >
          <View style={styles.demoBtnIconBox}>
            <ShieldCheck size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBtnTitle}>管理端</Text>
            <Text style={styles.demoBtnDesc}>帳號管理、班表總覽</Text>
          </View>
          {loading === 'admin' && <ActivityIndicator color="#3D3635" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  inner: { flex: 1, padding: 28, justifyContent: 'center', gap: 14 },
  header: { alignItems: 'center', marginBottom: 10 },
  logoBox: { backgroundColor: '#3D3635', padding: 22, borderRadius: 28, marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '900', color: '#3D3635' },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D97A3D18',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  demoBadgeText: { fontSize: 11, fontWeight: '700', color: '#D97A3D' },
  subTitle: { fontSize: 14, color: '#AAA', marginTop: 8, fontWeight: '600' },
  pickLabel: { fontSize: 14, fontWeight: '800', color: '#999', textAlign: 'center', marginBottom: 4 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  demoBtnDispatcher: { backgroundColor: '#3E7CB122', borderColor: '#3E7CB1' },
  demoBtnStaff: { backgroundColor: '#5B8C5A22', borderColor: '#5B8C5A' },
  demoBtnAdmin: { backgroundColor: '#3D363522', borderColor: '#3D3635' },
  demoBtnIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#3D3635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnTitle: { fontSize: 18, fontWeight: '900', color: '#3D3635' },
  demoBtnDesc: { fontSize: 12, color: '#777', marginTop: 2, fontWeight: '600' },
});
