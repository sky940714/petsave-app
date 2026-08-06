import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Navigation, X, BellRing, CircleHelp, Workflow, MapPin, SlidersHorizontal, LayoutGrid } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { usePolling } from '../../../hooks/usePolling';
import { apiFetch } from '../../../utils/api';
import { ENDPOINTS } from '../../../constants/Config';
import { Case, Vehicle } from '../../../types/case';
import CaseCard from '../../../components/CaseCard';
import RealMapView, { CaseMapPin } from '../../../components/RealMapView';
import CaseAcceptSheet from '../../../components/CaseAcceptSheet';
import OnboardingTour, { TourStep } from '../../../components/OnboardingTour';
import { STATUS_COLORS } from '../../../constants/caseStatus';

type ListFilter = 'shift' | 'all';

const STAFF_ONBOARDING_KEY = 'petsave_staff_onboarding_seen';

const STAFF_TOUR_STEPS: TourStep[] = [
  {
    Icon: Workflow,
    title: '案件生命週期',
    description:
      '每個案件會經過「受理→已派遣→已確認→處理中→已結案」五個階段。您被指派後，需要「確認接案」才會進到下一步，最後拍照回報結案。',
  },
  {
    Icon: MapPin,
    title: '案件地圖',
    description: '畫面中間的地圖會標示您目前進行中案件的位置，點右上角放大鈕可以看全螢幕地圖。',
  },
  {
    Icon: BellRing,
    title: '體驗鈕',
    description:
      '按下「體驗鈕」會模擬一筆新案件指派給您，並跳出系統通知。點那則通知就能體驗完整流程：滑動受理 → 開始處理 → 拍照結案。',
  },
  {
    Icon: SlidersHorizontal,
    title: '本班次／所有案件',
    description: '「本班次」只顯示目前最優先的一件；「所有案件」會列出所有處理中或還沒接案的案件。',
  },
  {
    Icon: LayoutGrid,
    title: '底下的分頁',
    description: '「案件」是目前這頁；「歷史」可以看已結案的案件紀錄；「自己」可以拍照打卡上下班，並查看自己的出勤紀錄。',
  },
];

// 展示用：體驗鈕會建立一筆新案件並指派給目前登入的出勤人員，模擬「收到新案件通知」的完整流程
const EXPERIENCE_REPORTS = [
  { reporter_name: '周先生', reporter_org: null, reporter_phone: '0966-777-888', report_address: '新北市樹林區中山路二段60號', territory_id: 1, report_reason: '犬隻' as const },
  { reporter_name: '林太太', reporter_org: null, reporter_phone: '0955-888-999', report_address: '新北市永和區中正路80號', territory_id: 2, report_reason: '貓隻' as const },
  { reporter_name: '1999 轉來', reporter_org: '1999', reporter_phone: '0977-666-555', report_address: '新北市泰山區明志路一段10號', territory_id: 3, report_reason: '協尋' as const },
];

export default function StaffCasesTab() {
  const router = useRouter();
  const { token, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [mapExpanded, setMapExpanded] = useState(false);
  const [filter, setFilter] = useState<ListFilter>('shift');
  const [experiencing, setExperiencing] = useState(false);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetCase, setSheetCase] = useState<Case | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STAFF_ONBOARDING_KEY).then((seen) => {
      if (!seen) setShowTour(true);
    });
  }, []);

  const handleFinishTour = () => {
    setShowTour(false);
    AsyncStorage.setItem(STAFF_ONBOARDING_KEY, 'true').catch(() => {});
  };

  const { data, reload } = usePolling<Case[]>(() => apiFetch<Case[]>(ENDPOINTS.CASES, token), [token]);
  const cases = data ?? [];
  const activeCases = cases.filter((c) => c.status !== 'closed');
  const activeCase = activeCases[0] ?? null;

  // 「本班次」只顯示目前最優先的單一案件；「所有案件」列出所有處理中/未接案的案件，已結案的一律不顯示（結案紀錄在「歷史」分頁）
  const listedCases = useMemo(
    () => (filter === 'shift' ? (activeCase ? [activeCase] : []) : activeCases),
    [filter, activeCase, activeCases]
  );

  const pins: CaseMapPin[] = activeCases
    .filter((c) => c.report_lat !== null && c.report_lng !== null)
    .map((c) => ({
      id: c.id,
      lat: c.report_lat as number,
      lng: c.report_lng as number,
      color: STATUS_COLORS[c.status],
      label: `${c.case_no}．${c.report_reason}`,
    }));

  const goToActiveCase = () => {
    if (activeCase) router.push(`/(staff)/case/${activeCase.id}`);
  };

  // 體驗鈕觸發的通知會帶 flow:'experience'，由這裡接手開啟受理下滑視窗（根層的監聽器會跳過這種通知）
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data;
      if (data?.flow !== 'experience' || !data?.caseId) return;
      try {
        const detail = await apiFetch<Case>(ENDPOINTS.CASE_DETAIL(data.caseId as number), token);
        setSheetCase(detail);
        setSheetVisible(true);
      } catch {
        // 展示用流程，失敗就靜默忽略
      }
    });
    return () => sub.remove();
  }, [token]);

  const handleStartExperience = async () => {
    if (!user) return;
    setExperiencing(true);
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }

      const pick = EXPERIENCE_REPORTS[Math.floor(Math.random() * EXPERIENCE_REPORTS.length)];
      const created = await apiFetch<{ id: number; case_no: string }>(ENDPOINTS.CASES, token, {
        method: 'POST',
        body: JSON.stringify(pick),
      });
      const vehicle = await apiFetch<Vehicle>(ENDPOINTS.VEHICLE_SUGGEST(pick.territory_id), token);
      await apiFetch(ENDPOINTS.CASE_DISPATCH(created.id), token, {
        method: 'PATCH',
        body: JSON.stringify({ vehicle_id: vehicle.id, staff_id: user.id }),
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📦 新案件指派',
          body: `${created.case_no}．${pick.report_reason}．${pick.report_address}`,
          data: { caseId: created.id, flow: 'experience' },
          sound: true,
        },
        trigger: null,
      });

      await reload();
    } catch (e: any) {
      Alert.alert('體驗啟動失敗', e.message || '請稍後再試');
    } finally {
      setExperiencing(false);
    }
  };

  const handleAcceptSheet = async () => {
    if (!sheetCase) return;
    setAccepting(true);
    try {
      await apiFetch(ENDPOINTS.CASE_ACKNOWLEDGE(sheetCase.id), token, { method: 'PATCH' });
      const caseId = sheetCase.id;
      setSheetVisible(false);
      setTimeout(() => {
        setAccepting(false);
        setSheetCase(null);
        router.push(`/(staff)/case/${caseId}`);
      }, 400);
    } catch (e: any) {
      setAccepting(false);
      Alert.alert('受理失敗', e.message || '請稍後再試');
    }
  };

  const handleCloseSheet = () => {
    setSheetVisible(false);
    setSheetCase(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headlineRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headline}>{activeCase ? '您有進行中的案件' : '目前待命中'}</Text>
          <Text style={styles.subheadline}>
            {activeCase ? `${activeCase.case_no}．${activeCase.report_reason}` : '有新案件指派時會立即通知你'}
          </Text>
        </View>
        <TouchableOpacity style={styles.helpBtn} onPress={() => setShowTour(true)}>
          <CircleHelp size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.experienceBtn} onPress={handleStartExperience} disabled={experiencing}>
        <BellRing size={16} color="#5B8C5A" />
        <Text style={styles.experienceBtnText}>
          {experiencing ? '準備通知中…' : '體驗鈕：模擬收到新案件通知'}
        </Text>
      </TouchableOpacity>

      <RealMapView pins={pins} height={280} onExpand={() => setMapExpanded(true)} />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>{filter === 'shift' ? '本班次案件' : '所有案件'}</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, filter === 'shift' && styles.toggleBtnActive]}
            onPress={() => setFilter('shift')}
          >
            <Text style={[styles.toggleText, filter === 'shift' && styles.toggleTextActive]}>本班次</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, filter === 'all' && styles.toggleBtnActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.toggleText, filter === 'all' && styles.toggleTextActive]}>所有案件</Text>
          </TouchableOpacity>
        </View>
      </View>

      {listedCases.length > 0 ? (
        listedCases.map((c) => (
          <CaseCard key={c.id} item={c} onPress={() => router.push(`/(staff)/case/${c.id}`)} />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {filter === 'shift' ? '目前沒有進行中的案件，待命中' : '目前沒有處理中或未接案的案件'}
          </Text>
        </View>
      )}

      <TouchableOpacity style={[styles.ctaBtn, !activeCase && styles.ctaBtnDisabled]} onPress={goToActiveCase} disabled={!activeCase}>
        <Navigation size={18} color="#fff" />
        <Text style={styles.ctaText}>{activeCase ? '前往處理案件' : '待命中，暫無案件'}</Text>
      </TouchableOpacity>

      <Modal visible={mapExpanded} animationType="slide">
        <View style={[styles.modalContainer, { paddingTop: insets.top + 16 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>案件分布地圖</Text>
            <TouchableOpacity onPress={() => setMapExpanded(false)}>
              <X size={24} color="#3D3635" />
            </TouchableOpacity>
          </View>
          <RealMapView pins={pins} />
        </View>
      </Modal>

      <CaseAcceptSheet
        visible={sheetVisible}
        caseData={sheetCase}
        accepting={accepting}
        onAccept={handleAcceptSheet}
        onClose={handleCloseSheet}
      />

      <OnboardingTour visible={showTour} steps={STAFF_TOUR_STEPS} onFinish={handleFinishTour} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 140, gap: 6 },
  headlineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  headline: { fontSize: 28, fontWeight: '900', color: '#3D3635' },
  subheadline: { fontSize: 14, color: '#999', marginTop: 6, marginBottom: 16, fontWeight: '600' },
  helpBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5B8C5A22',
    borderWidth: 1,
    borderColor: '#5B8C5A',
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  experienceBtnText: { fontSize: 13, fontWeight: '700', color: '#5B8C5A' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: { fontSize: 18, fontWeight: '900', color: '#3D3635' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 14,
    padding: 3,
  },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  toggleBtnActive: { backgroundColor: '#3D3635' },
  toggleText: { fontSize: 12, fontWeight: '700', color: '#999' },
  toggleTextActive: { color: '#fff' },
  emptyBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  emptyText: { color: '#999', textAlign: 'center' },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3E7CB1',
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 24,
  },
  ctaBtnDisabled: { backgroundColor: '#CCC' },
  ctaText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#3D3635' },
});
