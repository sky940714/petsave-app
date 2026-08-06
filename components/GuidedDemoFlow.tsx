import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useGuidedDemo, TOTAL_STEPS } from '../context/GuidedDemoContext';
import { useAuth, Role } from '../context/AuthContext';
import { loginAsRole } from '../mock/mockStore';

interface StepDef {
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  role: Role;
  route: string;
}

const STEPS: StepDef[] = [
  {
    title: '值班台 — 案件總覽',
    titleEn: 'Dispatcher — Case List',
    desc: '值班台可依狀態篩選全部案件，點右下角「受理新案件」建立新案。',
    descEn: 'Filter cases by status. Tap "New Case" (bottom-right) to create one.',
    role: 'dispatcher',
    route: '/(dispatcher)',
  },
  {
    title: '值班台 — 模擬來電通報',
    titleEn: 'Dispatcher — Simulate Incoming Call',
    desc: '點「展示用：模擬民眾來電通報」，體驗接電話到指派車號的完整動畫流程。',
    descEn: 'Tap "Simulate Incoming Call" to walk through the full intake-to-dispatch animation.',
    role: 'dispatcher',
    route: '/(dispatcher)',
  },
  {
    title: '值班台 — 建立新案件',
    titleEn: 'Dispatcher — Create New Case',
    desc: '點右下角「受理新案件」，填寫陳情人資訊與轄區，系統自動帶出建議車號。',
    descEn: 'Tap "New Case", fill in reporter info and select a territory — the system suggests a vehicle.',
    role: 'dispatcher',
    route: '/(dispatcher)/case-new',
  },
  {
    title: '出勤人員 — 待處理案件',
    titleEn: 'Field Staff — Assigned Cases',
    desc: '出勤人員只看到自己被指派的案件，點案件卡片進入詳情並執行「確認接案」。',
    descEn: 'Field staff see only their assigned cases. Tap a card, then tap "Acknowledge".',
    role: 'field_staff',
    route: '/(staff)',
  },
  {
    title: '出勤人員 — 照片上傳與結案',
    titleEn: 'Field Staff — Photos & Case Closure',
    desc: '依序執行「開始處理」，上傳三類照片（事發地點/處理中/三聯單），填描述後標準結案。',
    descEn: 'Tap "Start", upload 3 photo types (scene / processing / form), add notes, then close.',
    role: 'field_staff',
    route: '/(staff)',
  },
  {
    title: '出勤人員 — 打卡出勤',
    titleEn: 'Field Staff — Clock In / Out',
    desc: '個人頁面可拍照打卡上下班，需要相機與定位權限，出勤紀錄顯示在下方列表。',
    descEn: 'The Profile tab lets staff clock in/out with a photo + GPS. Records appear in the list below.',
    role: 'field_staff',
    route: '/(staff)/(tabs)/profile',
  },
  {
    title: '管理端 — 案件與車輛',
    titleEn: 'Admin — Cases & Vehicles',
    desc: '管理端唯讀，可瀏覽所有案件與車輛狀態，無法發起指派或結案操作。',
    descEn: 'Admin is read-only: view all cases and vehicle status. No dispatch or closure actions.',
    role: 'admin',
    route: '/(admin)',
  },
  {
    title: '管理端 — 帳號與班表',
    titleEn: 'Admin — Accounts & Roster',
    desc: '帳號管理可新增/編輯使用者；班表總覽顯示各日期/班別的車輛-人員對應。',
    descEn: 'Manage user accounts and view the daily shift roster (vehicle-staff assignments).',
    role: 'admin',
    route: '/(admin)/roster',
  },
];

export default function GuidedDemoFlow() {
  const { isActive, currentStep, nextStep, prevStep, endGuide } = useGuidedDemo();
  const { login, logout } = useAuth();
  const router = useRouter();

  const handleEnd = async () => {
    await logout();
    router.replace('/login');
    endGuide();
  };

  useEffect(() => {
    if (!isActive) return;
    const step = STEPS[currentStep];
    const execute = async () => {
      const data = loginAsRole(step.role);
      await login(data.token, data.user);
      router.replace(step.route as any);
    };
    execute();
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOTAL_STEPS - 1;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{currentStep + 1} / {TOTAL_STEPS}  完整流程體驗 · Full Experience Demo</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleEnd} hitSlop={8}>
            <X size={16} color="#999" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.titleEn}>{step.titleEn}</Text>
        <Text style={styles.desc}>{step.desc}</Text>
        <Text style={styles.descEn}>{step.descEn}</Text>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
            onPress={prevStep}
            disabled={isFirst}
          >
            <ChevronLeft size={16} color={isFirst ? '#CCC' : '#3D3635'} />
            <Text style={[styles.navBtnText, isFirst && styles.navBtnTextDisabled]}>上一步</Text>
          </TouchableOpacity>

          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentStep && styles.dotActive]} />
            ))}
          </View>

          {isLast ? (
            <TouchableOpacity style={[styles.navBtn, styles.navBtnEnd]} onPress={handleEnd}>
              <Text style={[styles.navBtnText, { color: '#B15B3E' }]}>結束導覽</Text>
              <X size={16} color="#B15B3E" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navBtn} onPress={nextStep}>
              <Text style={styles.navBtnText}>下一步</Text>
              <ChevronRight size={16} color="#3D3635" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    marginBottom: Platform.OS === 'ios' ? 32 : 12,
    borderRadius: 24,
    padding: 18,
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepBadge: {
    backgroundColor: '#3D363514',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepBadgeText: { fontSize: 11, fontWeight: '800', color: '#3D3635' },
  closeBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: '900', color: '#3D3635' },
  titleEn: { fontSize: 12, fontWeight: '700', color: '#AAA', marginTop: -2 },
  desc: { fontSize: 13, color: '#444', lineHeight: 19, marginTop: 4 },
  descEn: { fontSize: 11, color: '#BBB', lineHeight: 16 },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#F8F9FB',
  },
  navBtnDisabled: { opacity: 0.35 },
  navBtnEnd: { borderColor: '#B15B3E33', backgroundColor: '#B15B3E0A' },
  navBtnText: { fontSize: 13, fontWeight: '700', color: '#3D3635' },
  navBtnTextDisabled: { color: '#CCC' },
  dots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0E0E0' },
  dotActive: { backgroundColor: '#3D3635', width: 14, borderRadius: 3 },
});
