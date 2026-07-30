import { DEMO_PHOTO_DATA_URI } from './photoAssets';

export function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoNow(minutesAgo = 0): string {
  return new Date(Date.now() - minutesAgo * 60000).toISOString();
}

export interface MockUser {
  id: number;
  email: string | null;
  phone: string | null;
  password_hash: string; // demo 模式下當明碼密碼比對，不做真正雜湊
  full_name: string;
  role: 'dispatcher' | 'field_staff' | 'admin';
  status: 'active' | 'inactive';
  created_at: string;
}

export const users: MockUser[] = [
  { id: 1, email: 'dispatcher@petsave.test', phone: '0900-000-001', password_hash: 'demo', full_name: '王小明（值班台）', role: 'dispatcher', status: 'active', created_at: isoNow(60000) },
  { id: 2, email: 'staff1@petsave.test', phone: '0900-000-002', password_hash: 'demo', full_name: '李大華', role: 'field_staff', status: 'active', created_at: isoNow(60000) },
  { id: 3, email: 'staff2@petsave.test', phone: '0900-000-003', password_hash: 'demo', full_name: '林小美', role: 'field_staff', status: 'active', created_at: isoNow(60000) },
  { id: 4, email: 'staff3@petsave.test', phone: '0900-000-004', password_hash: 'demo', full_name: '張志偉', role: 'field_staff', status: 'active', created_at: isoNow(60000) },
  { id: 5, email: 'admin@petsave.test', phone: '0900-000-005', password_hash: 'demo', full_name: '陳老闆（管理端）', role: 'admin', status: 'active', created_at: isoNow(60000) },
];

export interface MockTerritory {
  id: number;
  name: string;
  districts: string;
  notes: string | null;
}

export const territories: MockTerritory[] = [
  { id: 1, name: '土城樹林三峽鶯歌', districts: '土城,樹林,三峽,鶯歌', notes: null },
  { id: 2, name: '板橋中和永和', districts: '板橋,中和,永和', notes: null },
  { id: 3, name: '三重蘆洲新莊泰山', districts: '三重,蘆洲,新莊,泰山', notes: null },
  { id: 4, name: '林口八里五股淡水三芝石門', districts: '林口,八里,五股,淡水,三芝,石門', notes: null },
  { id: 5, name: '新店瑞芳烏來貢寮汐止雙溪石碇平溪深坑金山坪林萬里', districts: '新店,瑞芳,烏來,貢寮,汐止,雙溪,石碇,平溪,深坑,金山,坪林,萬里', notes: null },
];

export interface MockVehicle {
  id: number;
  vehicle_no: string;
  type: 'territory' | 'roaming';
  current_status: 'standby' | 'busy' | 'offline';
  territory_id: number | null;
  territory_name: string | null;
  last_position_lat: number | null;
  last_position_lng: number | null;
  last_position_at: string | null;
}

export const vehicles: MockVehicle[] = [
  { id: 1, vehicle_no: '3807', type: 'territory', current_status: 'busy', territory_id: 1, territory_name: territories[0].name, last_position_lat: 24.972, last_position_lng: 121.443, last_position_at: isoNow(15) },
  { id: 2, vehicle_no: '3071', type: 'territory', current_status: 'standby', territory_id: 2, territory_name: territories[1].name, last_position_lat: 25.013, last_position_lng: 121.464, last_position_at: isoNow(40) },
  { id: 3, vehicle_no: '2391', type: 'territory', current_status: 'busy', territory_id: 3, territory_name: territories[2].name, last_position_lat: 25.062, last_position_lng: 121.484, last_position_at: isoNow(5) },
  { id: 4, vehicle_no: '6613', type: 'territory', current_status: 'busy', territory_id: 4, territory_name: territories[3].name, last_position_lat: 25.174, last_position_lng: 121.395, last_position_at: isoNow(20) },
  { id: 5, vehicle_no: '3806', type: 'territory', current_status: 'standby', territory_id: 5, territory_name: territories[4].name, last_position_lat: 24.978, last_position_lng: 121.539, last_position_at: isoNow(90) },
  { id: 6, vehicle_no: '機動1', type: 'roaming', current_status: 'standby', territory_id: null, territory_name: null, last_position_lat: 25.05, last_position_lng: 121.5, last_position_at: isoNow(10) },
];

export interface MockExceptionReason {
  id: number;
  code: string;
  label: string;
}

export const exceptionReasons: MockExceptionReason[] = [
  { id: 1, code: 'false_report', label: '民眾誤報' },
  { id: 2, code: 'animal_gone', label: '動物不見/離開現場' },
  { id: 3, code: 'duplicate_report', label: '重複通報' },
  { id: 4, code: 'out_of_jurisdiction', label: '非本轄區/轉派其他單位' },
  { id: 5, code: 'other', label: '其他' },
];

export interface MockCasePhoto {
  id: number;
  category: 'scene' | 'processing' | 'triplicate_form';
  url: string;
  uploaded_at: string;
}

export interface MockCase {
  id: number;
  case_no: string;
  status: 'received' | 'dispatched' | 'acknowledged' | 'in_progress' | 'closed';
  reporter_name: string;
  reporter_org: string | null;
  reporter_phone: string;
  report_address: string;
  report_lat: number | null;
  report_lng: number | null;
  territory_id: number | null;
  report_reason: '犬隻' | '貓隻' | '其他動物' | '協尋' | '其他';
  animal_male_count: number;
  animal_female_count: number;
  animal_juvenile_count: number;
  animal_adult_count: number;
  assigned_vehicle_id: number | null;
  assigned_staff_id: number | null;
  received_at: string;
  dispatched_at: string | null;
  acknowledged_at: string | null;
  arrived_at: string | null;
  closed_at: string | null;
  close_type: 'standard' | 'exception' | null;
  exception_reason_id: number | null;
  resolution_notes: string | null;
  support_requested: boolean;
  support_requested_at: string | null;
  checkin_lat: number | null;
  checkin_lng: number | null;
  checkin_address: string | null;
  checkin_at: string | null;
  created_by: number;
  photos: MockCasePhoto[];
}

export const cases: MockCase[] = [
  {
    id: 1,
    case_no: '20260728-001',
    status: 'received',
    reporter_name: '陳先生',
    reporter_org: null,
    reporter_phone: '0912-345-678',
    report_address: '新北市土城區中央路二段100號',
    report_lat: 24.9725,
    report_lng: 121.4430,
    territory_id: 1,
    report_reason: '犬隻',
    animal_male_count: 1,
    animal_female_count: 0,
    animal_juvenile_count: 0,
    animal_adult_count: 1,
    assigned_vehicle_id: null,
    assigned_staff_id: null,
    received_at: isoNow(8),
    dispatched_at: null,
    acknowledged_at: null,
    arrived_at: null,
    closed_at: null,
    close_type: null,
    exception_reason_id: null,
    resolution_notes: null,
    support_requested: false,
    support_requested_at: null,
    checkin_lat: null,
    checkin_lng: null,
    checkin_address: null,
    checkin_at: null,
    created_by: 1,
    photos: [],
  },
  {
    id: 2,
    case_no: '20260728-002',
    status: 'dispatched',
    reporter_name: '林小姐',
    reporter_org: '板橋區公所',
    reporter_phone: '0922-111-222',
    report_address: '新北市板橋區文化路一段188號',
    report_lat: 25.0130,
    report_lng: 121.4640,
    territory_id: 2,
    report_reason: '貓隻',
    animal_male_count: 0,
    animal_female_count: 2,
    animal_juvenile_count: 2,
    animal_adult_count: 0,
    assigned_vehicle_id: 2,
    assigned_staff_id: 2,
    received_at: isoNow(45),
    dispatched_at: isoNow(30),
    acknowledged_at: null,
    arrived_at: null,
    closed_at: null,
    close_type: null,
    exception_reason_id: null,
    resolution_notes: null,
    support_requested: false,
    support_requested_at: null,
    checkin_lat: null,
    checkin_lng: null,
    checkin_address: null,
    checkin_at: null,
    created_by: 1,
    photos: [],
  },
  {
    id: 3,
    case_no: '20260728-003',
    status: 'acknowledged',
    reporter_name: '1999 轉來',
    reporter_org: '1999',
    reporter_phone: '0933-222-333',
    report_address: '新北市三重區重新路三段50號',
    report_lat: 25.0620,
    report_lng: 121.4840,
    territory_id: 3,
    report_reason: '協尋',
    animal_male_count: 0,
    animal_female_count: 0,
    animal_juvenile_count: 0,
    animal_adult_count: 1,
    assigned_vehicle_id: 3,
    assigned_staff_id: 3,
    received_at: isoNow(70),
    dispatched_at: isoNow(55),
    acknowledged_at: isoNow(50),
    arrived_at: null,
    closed_at: null,
    close_type: null,
    exception_reason_id: null,
    resolution_notes: null,
    support_requested: false,
    support_requested_at: null,
    checkin_lat: null,
    checkin_lng: null,
    checkin_address: null,
    checkin_at: null,
    created_by: 1,
    photos: [],
  },
  {
    id: 4,
    case_no: '20260728-004',
    status: 'in_progress',
    reporter_name: '黃先生',
    reporter_org: null,
    reporter_phone: '0955-333-444',
    report_address: '新北市林口區中山路120號',
    report_lat: 25.0770,
    report_lng: 121.3920,
    territory_id: 4,
    report_reason: '其他動物',
    animal_male_count: 1,
    animal_female_count: 1,
    animal_juvenile_count: 0,
    animal_adult_count: 2,
    assigned_vehicle_id: 4,
    assigned_staff_id: 2,
    received_at: isoNow(120),
    dispatched_at: isoNow(100),
    acknowledged_at: isoNow(95),
    arrived_at: isoNow(80),
    closed_at: null,
    close_type: null,
    exception_reason_id: null,
    resolution_notes: null,
    support_requested: false,
    support_requested_at: null,
    checkin_lat: null,
    checkin_lng: null,
    checkin_address: null,
    checkin_at: null,
    created_by: 1,
    photos: [],
  },
  {
    id: 5,
    case_no: '20260727-012',
    status: 'closed',
    reporter_name: '許小姐',
    reporter_org: null,
    reporter_phone: '0966-444-555',
    report_address: '新北市新店區北新路一段30號',
    report_lat: 24.9780,
    report_lng: 121.5390,
    territory_id: 5,
    report_reason: '犬隻',
    animal_male_count: 1,
    animal_female_count: 0,
    animal_juvenile_count: 1,
    animal_adult_count: 0,
    assigned_vehicle_id: 5,
    assigned_staff_id: 3,
    received_at: isoNow(1600),
    dispatched_at: isoNow(1580),
    acknowledged_at: isoNow(1575),
    arrived_at: isoNow(1550),
    closed_at: isoNow(1500),
    close_type: 'standard',
    exception_reason_id: null,
    resolution_notes: '已將犬隻帶回收容所安置，現場清潔完畢，陳情人確認無誤。',
    support_requested: false,
    support_requested_at: null,
    checkin_lat: 24.978,
    checkin_lng: 121.539,
    checkin_address: '新北市新店區北新路',
    checkin_at: isoNow(1550),
    created_by: 1,
    photos: [
      { id: 1, category: 'scene', url: DEMO_PHOTO_DATA_URI.scene, uploaded_at: isoNow(1560) },
      { id: 2, category: 'processing', url: DEMO_PHOTO_DATA_URI.processing, uploaded_at: isoNow(1555) },
      { id: 3, category: 'triplicate_form', url: DEMO_PHOTO_DATA_URI.triplicate_form, uploaded_at: isoNow(1502) },
    ],
  },
  {
    id: 6,
    case_no: '20260727-009',
    status: 'closed',
    reporter_name: '匿名通報',
    reporter_org: null,
    reporter_phone: '0977-555-666',
    report_address: '新北市中和區中山路二段20號',
    report_lat: 24.9950,
    report_lng: 121.4990,
    territory_id: 2,
    report_reason: '貓隻',
    animal_male_count: 0,
    animal_female_count: 0,
    animal_juvenile_count: 0,
    animal_adult_count: 1,
    assigned_vehicle_id: null,
    assigned_staff_id: null,
    received_at: isoNow(2000),
    dispatched_at: null,
    acknowledged_at: null,
    arrived_at: null,
    closed_at: isoNow(1990),
    close_type: 'exception',
    exception_reason_id: 1,
    resolution_notes: '陳情人回報動物已自行離開，經電話確認為誤報。',
    support_requested: false,
    support_requested_at: null,
    checkin_lat: null,
    checkin_lng: null,
    checkin_address: null,
    checkin_at: null,
    created_by: 1,
    photos: [],
  },
  {
    id: 7,
    case_no: '20260726-005',
    status: 'closed',
    reporter_name: '李小姐',
    reporter_org: null,
    reporter_phone: '0911-222-333',
    report_address: '新北市土城區學府路一段25號',
    report_lat: 24.9700,
    report_lng: 121.4460,
    territory_id: 1,
    report_reason: '犬隻',
    animal_male_count: 0,
    animal_female_count: 1,
    animal_juvenile_count: 3,
    animal_adult_count: 0,
    assigned_vehicle_id: 1,
    assigned_staff_id: 2,
    received_at: isoNow(4320),
    dispatched_at: isoNow(4310),
    acknowledged_at: isoNow(4305),
    arrived_at: isoNow(4280),
    closed_at: isoNow(4230),
    close_type: 'standard',
    exception_reason_id: null,
    resolution_notes: '母犬與 3 隻幼犬已一併帶回收容所，現場無其他動物殘留。',
    support_requested: false,
    support_requested_at: null,
    checkin_lat: null,
    checkin_lng: null,
    checkin_address: null,
    checkin_at: null,
    created_by: 1,
    photos: [
      { id: 4, category: 'scene', url: DEMO_PHOTO_DATA_URI.scene, uploaded_at: isoNow(4290) },
      { id: 5, category: 'processing', url: DEMO_PHOTO_DATA_URI.processing, uploaded_at: isoNow(4285) },
      { id: 6, category: 'triplicate_form', url: DEMO_PHOTO_DATA_URI.triplicate_form, uploaded_at: isoNow(4232) },
    ],
  },
  {
    id: 8,
    case_no: '20260727-003',
    status: 'closed',
    reporter_name: '陳太太',
    reporter_org: null,
    reporter_phone: '0922-333-444',
    report_address: '新北市板橋區民生路三段40號',
    report_lat: 25.0110,
    report_lng: 121.4680,
    territory_id: 2,
    report_reason: '貓隻',
    animal_male_count: 0,
    animal_female_count: 0,
    animal_juvenile_count: 0,
    animal_adult_count: 1,
    assigned_vehicle_id: 2,
    assigned_staff_id: 2,
    received_at: isoNow(2800),
    dispatched_at: isoNow(2790),
    acknowledged_at: isoNow(2785),
    arrived_at: isoNow(2760),
    closed_at: isoNow(2740),
    close_type: 'exception',
    exception_reason_id: 2,
    resolution_notes: '到場時動物已離開現場，周邊亦未尋獲，予以結案。',
    support_requested: false,
    support_requested_at: null,
    checkin_lat: null,
    checkin_lng: null,
    checkin_address: null,
    checkin_at: null,
    created_by: 1,
    photos: [],
  },
  {
    id: 9,
    case_no: '20260728-006',
    status: 'closed',
    reporter_name: '吳先生',
    reporter_org: '警察局轉介',
    reporter_phone: '0933-444-555',
    report_address: '新北市林口區文化二路150號',
    report_lat: 25.0790,
    report_lng: 121.3950,
    territory_id: 4,
    report_reason: '其他動物',
    animal_male_count: 1,
    animal_female_count: 0,
    animal_juvenile_count: 0,
    animal_adult_count: 1,
    assigned_vehicle_id: 4,
    assigned_staff_id: 2,
    received_at: isoNow(600),
    dispatched_at: isoNow(590),
    acknowledged_at: isoNow(585),
    arrived_at: isoNow(560),
    closed_at: isoNow(520),
    close_type: 'standard',
    exception_reason_id: null,
    resolution_notes: '確認為飼主走失之寵物，已聯繫飼主到場領回，現場恢復完畢。',
    support_requested: false,
    support_requested_at: null,
    checkin_lat: null,
    checkin_lng: null,
    checkin_address: null,
    checkin_at: null,
    created_by: 1,
    photos: [
      { id: 7, category: 'scene', url: DEMO_PHOTO_DATA_URI.scene, uploaded_at: isoNow(570) },
      { id: 8, category: 'processing', url: DEMO_PHOTO_DATA_URI.processing, uploaded_at: isoNow(565) },
      { id: 9, category: 'triplicate_form', url: DEMO_PHOTO_DATA_URI.triplicate_form, uploaded_at: isoNow(522) },
    ],
  },
];

export interface MockStatusHistory {
  case_id: number;
  from_status: string | null;
  to_status: string;
  changed_by: number;
  changed_by_name: string;
  changed_at: string;
}

export interface MockAssignmentHistory {
  case_id: number;
  vehicle_id: number;
  vehicle_no: string;
  staff_id: number;
  staff_name: string;
  assigned_at: string;
  unassigned_at: string | null;
  reason: 'initial' | 'support_handover' | 'shift_change';
}

function userName(id: number) {
  return users.find((u) => u.id === id)?.full_name ?? '未知';
}
function vehicleNo(id: number) {
  return vehicles.find((v) => v.id === id)?.vehicle_no ?? '未知';
}

export const statusHistory: MockStatusHistory[] = [
  { case_id: 5, from_status: null, to_status: 'received', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(1600) },
  { case_id: 5, from_status: 'received', to_status: 'dispatched', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(1580) },
  { case_id: 5, from_status: 'dispatched', to_status: 'acknowledged', changed_by: 3, changed_by_name: userName(3), changed_at: isoNow(1575) },
  { case_id: 5, from_status: 'acknowledged', to_status: 'in_progress', changed_by: 3, changed_by_name: userName(3), changed_at: isoNow(1550) },
  { case_id: 5, from_status: 'in_progress', to_status: 'closed', changed_by: 3, changed_by_name: userName(3), changed_at: isoNow(1500) },
  { case_id: 6, from_status: null, to_status: 'received', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(2000) },
  { case_id: 6, from_status: 'received', to_status: 'closed', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(1990) },
  { case_id: 7, from_status: null, to_status: 'received', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(4320) },
  { case_id: 7, from_status: 'received', to_status: 'dispatched', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(4310) },
  { case_id: 7, from_status: 'dispatched', to_status: 'acknowledged', changed_by: 2, changed_by_name: userName(2), changed_at: isoNow(4305) },
  { case_id: 7, from_status: 'acknowledged', to_status: 'in_progress', changed_by: 2, changed_by_name: userName(2), changed_at: isoNow(4280) },
  { case_id: 7, from_status: 'in_progress', to_status: 'closed', changed_by: 2, changed_by_name: userName(2), changed_at: isoNow(4230) },
  { case_id: 8, from_status: null, to_status: 'received', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(2800) },
  { case_id: 8, from_status: 'received', to_status: 'dispatched', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(2790) },
  { case_id: 8, from_status: 'dispatched', to_status: 'acknowledged', changed_by: 2, changed_by_name: userName(2), changed_at: isoNow(2785) },
  { case_id: 8, from_status: 'acknowledged', to_status: 'in_progress', changed_by: 2, changed_by_name: userName(2), changed_at: isoNow(2760) },
  { case_id: 8, from_status: 'in_progress', to_status: 'closed', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(2740) },
  { case_id: 9, from_status: null, to_status: 'received', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(600) },
  { case_id: 9, from_status: 'received', to_status: 'dispatched', changed_by: 1, changed_by_name: userName(1), changed_at: isoNow(590) },
  { case_id: 9, from_status: 'dispatched', to_status: 'acknowledged', changed_by: 2, changed_by_name: userName(2), changed_at: isoNow(585) },
  { case_id: 9, from_status: 'acknowledged', to_status: 'in_progress', changed_by: 2, changed_by_name: userName(2), changed_at: isoNow(560) },
  { case_id: 9, from_status: 'in_progress', to_status: 'closed', changed_by: 2, changed_by_name: userName(2), changed_at: isoNow(520) },
];

export const assignmentHistory: MockAssignmentHistory[] = [
  { case_id: 2, vehicle_id: 2, vehicle_no: vehicleNo(2), staff_id: 2, staff_name: userName(2), assigned_at: isoNow(30), unassigned_at: null, reason: 'initial' },
  { case_id: 3, vehicle_id: 3, vehicle_no: vehicleNo(3), staff_id: 3, staff_name: userName(3), assigned_at: isoNow(55), unassigned_at: null, reason: 'initial' },
  { case_id: 4, vehicle_id: 4, vehicle_no: vehicleNo(4), staff_id: 2, staff_name: userName(2), assigned_at: isoNow(100), unassigned_at: null, reason: 'initial' },
  { case_id: 5, vehicle_id: 5, vehicle_no: vehicleNo(5), staff_id: 3, staff_name: userName(3), assigned_at: isoNow(1580), unassigned_at: null, reason: 'initial' },
  { case_id: 7, vehicle_id: 1, vehicle_no: vehicleNo(1), staff_id: 2, staff_name: userName(2), assigned_at: isoNow(4310), unassigned_at: null, reason: 'initial' },
  { case_id: 8, vehicle_id: 2, vehicle_no: vehicleNo(2), staff_id: 2, staff_name: userName(2), assigned_at: isoNow(2790), unassigned_at: null, reason: 'initial' },
  { case_id: 9, vehicle_id: 4, vehicle_no: vehicleNo(4), staff_id: 2, staff_name: userName(2), assigned_at: isoNow(590), unassigned_at: null, reason: 'initial' },
];

export interface MockRosterEntry {
  roster_date: string;
  shift: '小夜' | '大夜';
  vehicle_id: number;
  staff_user_id: number;
}

export const rosterEntries: MockRosterEntry[] = [
  // 明天 小夜：已排滿並發布
  { roster_date: dateOffset(1), shift: '小夜', vehicle_id: 1, staff_user_id: 2 },
  { roster_date: dateOffset(1), shift: '小夜', vehicle_id: 2, staff_user_id: 3 },
  { roster_date: dateOffset(1), shift: '小夜', vehicle_id: 3, staff_user_id: 4 },
  { roster_date: dateOffset(1), shift: '小夜', vehicle_id: 4, staff_user_id: 2 },
  { roster_date: dateOffset(1), shift: '小夜', vehicle_id: 5, staff_user_id: 3 },
  { roster_date: dateOffset(1), shift: '小夜', vehicle_id: 6, staff_user_id: 4 },
  // 明天 大夜：已填但尚未發布
  { roster_date: dateOffset(1), shift: '大夜', vehicle_id: 1, staff_user_id: 4 },
  { roster_date: dateOffset(1), shift: '大夜', vehicle_id: 2, staff_user_id: 2 },
  { roster_date: dateOffset(1), shift: '大夜', vehicle_id: 3, staff_user_id: 3 },
  // 後天：兩班皆尚未填寫
];

export interface MockRosterPublish {
  roster_date: string;
  shift: '小夜' | '大夜';
  published_at: string | null;
}

export const rosterPublishStatus: MockRosterPublish[] = [
  { roster_date: dateOffset(1), shift: '小夜', published_at: isoNow(600) },
  { roster_date: dateOffset(1), shift: '大夜', published_at: null },
];

export interface MockAttendanceRecord {
  id: number;
  user_id: number;
  type: 'in' | 'out';
  timestamp: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  photo_url: string;
}

// 出勤人員（李大華, user id 2）過去兩天的打卡紀錄示範
export const attendanceRecords: MockAttendanceRecord[] = [
  {
    id: 1,
    user_id: 2,
    type: 'in',
    timestamp: isoNow(2400),
    lat: 25.013,
    lng: 121.464,
    address: '新北市板橋區文化路一段',
    photo_url: DEMO_PHOTO_DATA_URI.scene,
  },
  {
    id: 2,
    user_id: 2,
    type: 'out',
    timestamp: isoNow(1920),
    lat: 25.013,
    lng: 121.464,
    address: '新北市板橋區文化路一段',
    photo_url: DEMO_PHOTO_DATA_URI.processing,
  },
  {
    id: 3,
    user_id: 2,
    type: 'in',
    timestamp: isoNow(960),
    lat: 25.077,
    lng: 121.392,
    address: '新北市林口區中山路',
    photo_url: DEMO_PHOTO_DATA_URI.scene,
  },
  {
    id: 4,
    user_id: 2,
    type: 'out',
    timestamp: isoNow(480),
    lat: 25.077,
    lng: 121.392,
    address: '新北市林口區中山路',
    photo_url: DEMO_PHOTO_DATA_URI.processing,
  },
];
