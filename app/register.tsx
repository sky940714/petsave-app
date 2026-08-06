import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PawPrint } from 'lucide-react-native';
import { useAuth, Role } from '../context/AuthContext';
import { register } from '../mock/mockStore';

const ROLES: { key: Role; label: string; labelEn: string }[] = [
  { key: 'dispatcher', label: '值班台', labelEn: 'Dispatcher' },
  { key: 'field_staff', label: '出勤人員', labelEn: 'Field Staff' },
  { key: 'admin', label: '管理端', labelEn: 'Admin' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('field_staff');
  const [loading, setLoading] = useState(false);

  const goToRoleHome = (r: Role) => {
    if (r === 'dispatcher') router.replace('/(dispatcher)' as any);
    else if (r === 'field_staff') router.replace('/(staff)' as any);
    else router.replace('/(admin)' as any);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('密碼不一致', '請確認兩次輸入的密碼相同');
      return;
    }
    setLoading(true);
    try {
      const data = register({ full_name: fullName, email, phone: phone || undefined, password, role });
      await login(data.token, data.user);
      goToRoleHome(data.user.role as Role);
    } catch (e: any) {
      Alert.alert('註冊失敗', e.message || '請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 60 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <PawPrint color="#fff" size={36} />
          </View>
          <Text style={styles.title}>建立帳號</Text>
          <Text style={styles.titleEn}>Create Account</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="姓名 Full Name *"
          value={fullName}
          onChangeText={setFullName}
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="手機 Phone（選填）"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="密碼 Password *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="確認密碼 Confirm Password *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Text style={styles.roleLabel}>角色 Role</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleChip, role === r.key && styles.roleChipActive]}
              onPress={() => setRole(r.key)}
            >
              <Text style={[styles.roleChipText, role === r.key && styles.roleChipTextActive]}>{r.label}</Text>
              <Text style={[styles.roleChipSub, role === r.key && styles.roleChipTextActive]}>{r.labelEn}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>建立帳號 / Register</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>已有帳號？返回登入 / Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { paddingHorizontal: 28, gap: 12 },
  header: { alignItems: 'center', marginBottom: 8, gap: 6 },
  logoBox: { backgroundColor: '#3D3635', padding: 18, borderRadius: 24, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '900', color: '#3D3635' },
  titleEn: { fontSize: 13, color: '#AAA', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    color: '#3D3635',
  },
  roleLabel: { fontSize: 13, fontWeight: '800', color: '#999', marginTop: 4 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    gap: 2,
  },
  roleChipActive: { backgroundColor: '#3D3635', borderColor: '#3D3635' },
  roleChipText: { fontSize: 14, fontWeight: '800', color: '#3D3635' },
  roleChipSub: { fontSize: 10, color: '#999', fontWeight: '600' },
  roleChipTextActive: { color: '#fff' },
  submitBtn: {
    backgroundColor: '#3D3635',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  backLink: { alignItems: 'center', paddingVertical: 8 },
  backLinkText: { color: '#AAA', fontSize: 13, fontWeight: '600' },
});
