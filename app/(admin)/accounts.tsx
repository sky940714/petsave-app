import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LogOut, Plus } from 'lucide-react-native';
import { useAuth, Role } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { ENDPOINTS } from '../../constants/Config';

interface UserRow {
  id: number;
  email: string | null;
  phone: string | null;
  full_name: string;
  role: Role;
  status: 'active' | 'inactive';
}

const ROLE_LABELS: Record<Role, string> = {
  dispatcher: '值班台',
  field_staff: '出勤人員',
  admin: '管理端',
};

export default function AccountsScreen() {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('field_staff');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const result = await apiFetch<UserRow[]>(ENDPOINTS.USERS, token);
    setUsers(result);
  }, [token]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleCreate = async () => {
    if (!fullName || !password) return Alert.alert('請輸入姓名與密碼');
    setSubmitting(true);
    try {
      await apiFetch(ENDPOINTS.USERS, token, {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName, email: email || undefined, phone: phone || undefined, password, role }),
      });
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setShowForm(false);
      await load();
    } catch (e: any) {
      Alert.alert('建立失敗', e.message || '請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (u: UserRow) => {
    try {
      await apiFetch(`${ENDPOINTS.USERS}/${u.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: u.status === 'active' ? 'inactive' : 'active' }),
      });
      await load();
    } catch (e: any) {
      Alert.alert('更新失敗', e.message || '請稍後再試');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={() => setShowForm(!showForm)}>
          <Plus size={18} color="#3D3635" />
          <Text style={styles.navButtonText}>新增帳號</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <LogOut size={20} color="#B15B3E" />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="姓名 *" value={fullName} onChangeText={setFullName} />
          <TextInput style={styles.input} placeholder="Email（選填）" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="電話（選填）" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="密碼 *" value={password} onChangeText={setPassword} secureTextEntry />
          <View style={styles.chipRow}>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <TouchableOpacity key={r} style={[styles.chip, role === r && styles.chipActive]} onPress={() => setRole(r)}>
                <Text style={[styles.chipText, role === r && styles.chipTextActive]}>{ROLE_LABELS[r]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>建立帳號</Text>}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} color="#3D3635" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.full_name}</Text>
                <Text style={styles.userMeta}>
                  {ROLE_LABELS[item.role]} · {item.email ?? item.phone ?? '無聯絡資訊'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.statusBtn, item.status === 'active' ? styles.statusActive : styles.statusInactive]}
                onPress={() => toggleStatus(item)}
              >
                <Text style={styles.statusText}>{item.status === 'active' ? '啟用中' : '已停用'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navButtonText: { fontSize: 13, fontWeight: '700', color: '#3D3635' },
  form: { paddingHorizontal: 20, gap: 10, marginBottom: 10 },
  input: {
    backgroundColor: '#F8F9FB',
    padding: 14,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#3D3635', borderColor: '#3D3635' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#3D3635' },
  chipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#3D3635', borderRadius: 16, padding: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '800' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  userName: { fontSize: 15, fontWeight: '700', color: '#3D3635' },
  userMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  statusBtn: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  statusActive: { backgroundColor: '#5B8C5A22' },
  statusInactive: { backgroundColor: '#99999922' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#3D3635' },
});
