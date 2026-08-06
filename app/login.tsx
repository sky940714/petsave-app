import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, Radio, Truck, ShieldCheck, PawPrint, PlayCircle } from 'lucide-react-native';
import { useAuth, Role } from '../context/AuthContext';
import { loginAsRole, login as mockLogin } from '../mock/mockStore';
import { useGuidedDemo } from '../context/GuidedDemoContext';

export default function LoginScreen() {
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signing, setSigning] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { startGuide } = useGuidedDemo();
  const insets = useSafeAreaInsets();

  const goToRoleHome = (role: Role) => {
    if (role === 'dispatcher') router.replace('/(dispatcher)' as any);
    else if (role === 'field_staff') router.replace('/(staff)' as any);
    else if (role === 'admin') router.replace('/(admin)' as any);
    else router.replace('/unauthorized');
  };

  const handleDemoLogin = async (role: Role) => {
    setDemoLoading(role);
    try {
      const data = loginAsRole(role);
      await login(data.token, data.user);
      goToRoleHome(data.user.role);
    } finally {
      setDemoLoading(null);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('請填寫 Email 與密碼');
      return;
    }
    setSigning(true);
    try {
      const data = mockLogin(email.trim(), password);
      await login(data.token, data.user);
      goToRoleHome(data.user.role as Role);
    } catch (e: any) {
      Alert.alert('登入失敗', e.message || '請稍後再試');
    } finally {
      setSigning(false);
    }
  };

  const disabled = demoLoading !== null || signing;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
          disabled={disabled}
        >
          <View style={styles.demoBtnIconBox}><Radio size={26} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBtnTitle}>值班台</Text>
            <Text style={styles.demoBtnDesc}>受理案件、指派車輛、班表管理</Text>
          </View>
          {demoLoading === 'dispatcher' && <ActivityIndicator color="#3D3635" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoBtn, styles.demoBtnStaff]}
          onPress={() => handleDemoLogin('field_staff')}
          disabled={disabled}
        >
          <View style={styles.demoBtnIconBox}><Truck size={26} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBtnTitle}>出勤人員</Text>
            <Text style={styles.demoBtnDesc}>接收案件、到場打卡、回報結案</Text>
          </View>
          {demoLoading === 'field_staff' && <ActivityIndicator color="#3D3635" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoBtn, styles.demoBtnAdmin]}
          onPress={() => handleDemoLogin('admin')}
          disabled={disabled}
        >
          <View style={styles.demoBtnIconBox}><ShieldCheck size={26} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.demoBtnTitle}>管理端</Text>
            <Text style={styles.demoBtnDesc}>帳號管理、班表總覽</Text>
          </View>
          {demoLoading === 'admin' && <ActivityIndicator color="#3D3635" />}
        </TouchableOpacity>

        {/* 帳號登入 */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>或輸入帳號登入 / Sign In</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />
        <TextInput
          style={styles.input}
          placeholder="密碼 Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!disabled}
        />

        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn} disabled={disabled}>
          {signing
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.signInBtnText}>登入 / Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register' as any)} disabled={disabled}>
          <Text style={styles.registerLinkText}>還沒有帳號？立即註冊 / Register</Text>
        </TouchableOpacity>

        <View style={styles.guideDivider} />

        <TouchableOpacity style={styles.guideBtn} onPress={startGuide} disabled={disabled}>
          <PlayCircle size={20} color="#3D3635" />
          <View style={{ flex: 1 }}>
            <Text style={styles.guideBtnTitle}>完整流程體驗</Text>
            <Text style={styles.guideBtnSub}>Full Experience Demo</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { paddingHorizontal: 28, gap: 12 },
  header: { alignItems: 'center', marginBottom: 6, gap: 4 },
  logoBox: { backgroundColor: '#3D3635', padding: 22, borderRadius: 28, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '900', color: '#3D3635' },
  demoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#D97A3D18', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5, marginTop: 6,
  },
  demoBadgeText: { fontSize: 11, fontWeight: '700', color: '#D97A3D' },
  subTitle: { fontSize: 14, color: '#AAA', marginTop: 4, fontWeight: '600' },
  pickLabel: { fontSize: 14, fontWeight: '800', color: '#999', textAlign: 'center', marginBottom: 2 },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: 24, paddingVertical: 16, paddingHorizontal: 18, borderWidth: 1,
  },
  demoBtnDispatcher: { backgroundColor: '#3E7CB122', borderColor: '#3E7CB1' },
  demoBtnStaff: { backgroundColor: '#5B8C5A22', borderColor: '#5B8C5A' },
  demoBtnAdmin: { backgroundColor: '#3D363522', borderColor: '#3D3635' },
  demoBtnIconBox: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: '#3D3635', alignItems: 'center', justifyContent: 'center',
  },
  demoBtnTitle: { fontSize: 17, fontWeight: '900', color: '#3D3635' },
  demoBtnDesc: { fontSize: 12, color: '#777', marginTop: 2, fontWeight: '600' },
  sectionDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EFEFEF' },
  dividerText: { fontSize: 12, color: '#BBB', fontWeight: '700' },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    backgroundColor: '#FAFAFA', color: '#3D3635',
  },
  signInBtn: {
    backgroundColor: '#3D3635', borderRadius: 20,
    paddingVertical: 15, alignItems: 'center',
  },
  signInBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  registerLink: { alignItems: 'center', paddingVertical: 4 },
  registerLinkText: { color: '#3E7CB1', fontSize: 13, fontWeight: '700' },
  guideDivider: { height: 1, backgroundColor: '#EFEFEF', marginVertical: 2 },
  guideBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 24, paddingVertical: 16, paddingHorizontal: 18,
    borderWidth: 1, borderColor: '#DCDCDC', backgroundColor: '#FAFAFA',
  },
  guideBtnTitle: { fontSize: 15, fontWeight: '900', color: '#3D3635' },
  guideBtnSub: { fontSize: 11, color: '#AAA', marginTop: 1, fontWeight: '600' },
});
