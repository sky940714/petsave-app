import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Plus, Truck, CalendarDays, LogOut, PhoneIncoming, CircleHelp, ClipboardList, Radio } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { usePolling } from '../../hooks/usePolling';
import { apiFetch } from '../../utils/api';
import { ENDPOINTS } from '../../constants/Config';
import { deleteAccount } from '../../mock/mockStore';
import { Case, Vehicle } from '../../types/case';
import { CaseStatus, STATUS_LABELS } from '../../constants/caseStatus';
import CaseCard from '../../components/CaseCard';
import IncomingCallSimulation, { AssignResult } from '../../components/IncomingCallSimulation';
import OnboardingTour, { TourStep } from '../../components/OnboardingTour';

const FILTERS: { key: CaseStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'received', label: STATUS_LABELS.received },
  { key: 'dispatched', label: STATUS_LABELS.dispatched },
  { key: 'acknowledged', label: STATUS_LABELS.acknowledged },
  { key: 'in_progress', label: STATUS_LABELS.in_progress },
  { key: 'closed', label: STATUS_LABELS.closed },
];

const DISPATCHER_ONBOARDING_KEY = 'petsave_dispatcher_onboarding_seen';

const DISPATCHER_TOUR_STEPS: TourStep[] = [
  {
    Icon: ClipboardList,
    title: '案件總覽',
    description: '上方的標籤可以依狀態（受理/已派遣/已確認/處理中/已結案）篩選案件，點案件卡片可以進入詳情頁。',
  },
  {
    Icon: Plus,
    title: '受理新案件',
    description: '點右下角「受理新案件」，填寫陳情人資訊、地址、事由，系統會依您選的轄區自動帶出建議車號。',
  },
  {
    Icon: Radio,
    title: '指派與例外結案',
    description: '進入案件詳情頁後，可以指派/改派車輛與人員；如果是誤報或動物已離開現場，也能直接發起「例外結案」。',
  },
  {
    Icon: PhoneIncoming,
    title: '模擬民眾來電通報',
    description: '這是展示用按鈕：按下去會跑一段動畫，模擬案件從接電話到指派車號的過程，最後會發一則通知給被指派的出勤人員。',
  },
  {
    Icon: Truck,
    title: '車輛狀態',
    description: '可以看所有車輛（含機動車）目前待命或處理中的狀態。機動車沒有固定轄區，需要您人工判斷要不要派它出動。',
  },
  {
    Icon: CalendarDays,
    title: '班表管理',
    description: '編輯未來兩天、小夜/大夜班別的車輛-人員對應，填完後記得按「發布」，出勤人員才看得到班表。',
  },
];

// 展示用：模擬民眾來電通報，用來示範「值班台收到新案件時跳出通知」
const SIMULATED_REPORTS = [
  { reporter_name: '王太太', reporter_org: null, reporter_phone: '0987-111-222', report_address: '新北市板橋區府中路50號', territory_id: 2, report_reason: '犬隻' as const },
  { reporter_name: '1999 轉來', reporter_org: '1999', reporter_phone: '0987-222-333', report_address: '新北市三重區重陽路一段20號', territory_id: 3, report_reason: '貓隻' as const },
  { reporter_name: '張先生', reporter_org: null, reporter_phone: '0987-333-444', report_address: '新北市新店區中興路三段10號', territory_id: 5, report_reason: '其他動物' as const },
  { reporter_name: '里辦公室通報', reporter_org: '里辦公室', reporter_phone: '0987-444-555', report_address: '新北市土城區裕民路80號', territory_id: 1, report_reason: '協尋' as const },
];

export default function DispatcherHome() {
  const router = useRouter();
  const { token, logout } = useAuth();

  const handleLogoutMenu = () => {
    Alert.alert('帳號選項 Account', '', [
      { text: '登出 Sign Out', onPress: logout },
      {
        text: '刪除帳號 Delete Account',
        style: 'destructive',
        onPress: () =>
          Alert.alert('確認刪除帳號？', '此操作無法復原。\nThis cannot be undone.', [
            { text: '取消', style: 'cancel' },
            {
              text: '確認刪除',
              style: 'destructive',
              onPress: async () => {
                deleteAccount(token);
                await logout();
                router.replace('/login' as any);
              },
            },
          ]),
      },
      { text: '取消 Cancel', style: 'cancel' },
    ]);
  };
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all');
  const [showSimulation, setShowSimulation] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DISPATCHER_ONBOARDING_KEY).then((seen) => {
      if (!seen) setShowTour(true);
    });
  }, []);

  const handleFinishTour = () => {
    setShowTour(false);
    AsyncStorage.setItem(DISPATCHER_ONBOARDING_KEY, 'true').catch(() => {});
  };

  const { data, loading, refreshing, onRefresh } = usePolling<Case[]>(async () => {
    const url = filter === 'all' ? ENDPOINTS.CASES : `${ENDPOINTS.CASES}?status=${filter}`;
    return apiFetch<Case[]>(url, token);
  }, [token, filter]);

  const handleStartSimulation = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
    setShowSimulation(true);
  };

  // 模擬流程跑到「指派案件以及車號」那一步時，真的建立案件並指派車輛+人員
  const handleReachAssignStep = async (): Promise<AssignResult> => {
    const pick = SIMULATED_REPORTS[Math.floor(Math.random() * SIMULATED_REPORTS.length)];
    const created = await apiFetch<{ id: number; case_no: string }>(ENDPOINTS.CASES, token, {
      method: 'POST',
      body: JSON.stringify(pick),
    });
    const vehicle = await apiFetch<Vehicle>(ENDPOINTS.VEHICLE_SUGGEST(pick.territory_id), token);
    const users = await apiFetch<any[]>(ENDPOINTS.USERS, token);
    // 固定指派給展示帳號登入的那位出勤人員（第一位啟用中的 field_staff），
    // 確保用「以出勤人員身份登入」demo 一定看得到這筆案件，不受隨機分配影響
    const staff = users.find((u) => u.role === 'field_staff' && u.status === 'active');

    await apiFetch(ENDPOINTS.CASE_DISPATCH(created.id), token, {
      method: 'PATCH',
      body: JSON.stringify({ vehicle_id: vehicle.id, staff_id: staff.id }),
    });

    return {
      caseId: created.id,
      caseNo: created.case_no,
      address: pick.report_address,
      reason: pick.report_reason,
      vehicleNo: vehicle.vehicle_no,
      staffName: staff.full_name,
    };
  };

  // 動畫流程全部跑完（含打勾動畫淡出）之後，才真正跳出通知 —— 這則通知是給被指派的出勤人員看的
  const handleSimulationComplete = async (result: AssignResult) => {
    setShowSimulation(false);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📦 新案件指派',
          body: `${result.caseNo}．${result.reason}．${result.address}`,
          data: { caseId: result.caseId },
          sound: true,
        },
        trigger: null,
      });
    } catch (e: any) {
      Alert.alert('通知發送失敗', e.message || '請稍後再試');
    }
    await onRefresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(dispatcher)/vehicles')}>
          <Truck size={18} color="#3D3635" />
          <Text style={styles.navButtonText}>車輛狀態</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/(dispatcher)/roster')}>
          <CalendarDays size={18} color="#3D3635" />
          <Text style={styles.navButtonText}>班表管理</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleLogoutMenu}>
          <LogOut size={18} color="#B15B3E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setShowTour(true)}>
          <CircleHelp size={18} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.simulateBtn} onPress={handleStartSimulation}>
        <PhoneIncoming size={16} color="#3E7CB1" />
        <Text style={styles.simulateBtnText}>展示用：模擬民眾來電通報</Text>
      </TouchableOpacity>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f.key}
        style={styles.filterRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        style={styles.mainList}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <CaseCard item={item} onPress={() => router.push(`/(dispatcher)/case/${item.id}`)} />
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>目前沒有符合條件的案件</Text> : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(dispatcher)/case-new')}>
        <Plus size={24} color="#fff" />
        <Text style={styles.fabText}>受理新案件</Text>
      </TouchableOpacity>

      <IncomingCallSimulation
        visible={showSimulation}
        onReachAssignStep={handleReachAssignStep}
        onComplete={handleSimulationComplete}
      />

      <OnboardingTour visible={showTour} steps={DISPATCHER_TOUR_STEPS} onFinish={handleFinishTour} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
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
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#3E7CB122',
    borderWidth: 1,
    borderColor: '#3E7CB1',
    borderRadius: 14,
    paddingVertical: 10,
  },
  simulateBtnText: { fontSize: 13, fontWeight: '700', color: '#3E7CB1' },
  filterRow: { flexGrow: 0, marginVertical: 10 },
  filterChip: {
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: '#3D3635', borderColor: '#3D3635' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#3D3635' },
  filterTextActive: { color: '#fff' },
  mainList: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3D3635',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
