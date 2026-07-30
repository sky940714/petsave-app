import { ApiError } from '../utils/ApiError';
import * as fixtures from './fixtures';
import type { MockCase, MockUser } from './fixtures';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// 展示模式的記憶體資料庫（重新整理 App / reload 後會回復成初始 fixtures）
const db = {
  users: clone(fixtures.users),
  territories: clone(fixtures.territories),
  vehicles: clone(fixtures.vehicles),
  exceptionReasons: clone(fixtures.exceptionReasons),
  cases: clone(fixtures.cases),
  statusHistory: clone(fixtures.statusHistory),
  assignmentHistory: clone(fixtures.assignmentHistory),
  rosterEntries: clone(fixtures.rosterEntries),
  rosterPublishStatus: clone(fixtures.rosterPublishStatus),
  attendanceRecords: clone(fixtures.attendanceRecords),
  nextCaseId: fixtures.cases.length + 1,
  nextUserId: fixtures.users.length + 1,
  nextPhotoId: 1000,
  nextAttendanceId: fixtures.attendanceRecords.length + 1,
  caseNoSeq: 10,
};

const STATUS_ORDER = ['received', 'dispatched', 'acknowledged', 'in_progress', 'closed'] as const;
type Status = (typeof STATUS_ORDER)[number];

const TRANSITIONS: Record<Status, Status[]> = {
  received: ['dispatched'],
  dispatched: ['acknowledged'],
  acknowledged: ['in_progress'],
  in_progress: ['closed'],
  closed: [],
};
const EXCEPTION_CLOSE_ALLOWED_FROM: Status[] = ['received', 'dispatched', 'acknowledged', 'in_progress'];

function badRequest(message: string): never {
  throw new ApiError(message, 400);
}
function forbidden(message: string): never {
  throw new ApiError(message, 403);
}
function notFound(message: string): never {
  throw new ApiError(message, 404);
}

function parseActorId(token: string | null): number {
  if (!token || !token.startsWith('mock-')) throw new ApiError('未授權，請先登入', 401);
  return Number(token.replace('mock-', ''));
}

function requireUser(token: string | null): MockUser {
  const id = parseActorId(token);
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError('Token 無效或已過期', 401);
  return user;
}

function findCaseOrThrow(caseId: number): MockCase {
  const c = db.cases.find((x) => x.id === caseId);
  if (!c) notFound('找不到該案件');
  return c!;
}

function withJoins(c: MockCase) {
  const vehicle = db.vehicles.find((v) => v.id === c.assigned_vehicle_id);
  const staff = db.users.find((u) => u.id === c.assigned_staff_id);
  return {
    ...c,
    assigned_vehicle_no: vehicle?.vehicle_no ?? null,
    assigned_staff_name: staff?.full_name ?? null,
  };
}

// ---------- Auth ----------

export function login(email: string, password: string) {
  const user = db.users.find((u) => u.email === email && u.status === 'active');
  if (!user || user.password_hash !== password) {
    throw new ApiError('帳號或密碼錯誤', 401);
  }
  return {
    token: `mock-${user.id}`,
    user: { id: user.id, full_name: user.full_name, role: user.role, email: user.email },
  };
}

export function loginAsRole(role: MockUser['role']) {
  const user = db.users.find((u) => u.role === role && u.status === 'active');
  if (!user) throw new ApiError('找不到示範帳號', 404);
  return {
    token: `mock-${user.id}`,
    user: { id: user.id, full_name: user.full_name, role: user.role, email: user.email },
  };
}

export function me(token: string | null) {
  const user = requireUser(token);
  return { id: user.id, email: user.email, phone: user.phone, full_name: user.full_name, role: user.role, status: user.status };
}

export function listUsers(token: string | null) {
  requireUser(token);
  return db.users.map((u) => ({
    id: u.id,
    email: u.email,
    phone: u.phone,
    full_name: u.full_name,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
  }));
}

export function createUser(token: string | null, input: any) {
  requireUser(token);
  if (!input.password || !input.full_name || !input.role) badRequest('請填寫所有必填欄位');
  const id = db.nextUserId++;
  db.users.push({
    id,
    email: input.email ?? null,
    phone: input.phone ?? null,
    password_hash: input.password,
    full_name: input.full_name,
    role: input.role,
    status: 'active',
    created_at: new Date().toISOString(),
  });
  return { message: '帳號建立成功', userId: id };
}

export function updateUser(token: string | null, id: number, input: any) {
  requireUser(token);
  const user = db.users.find((u) => u.id === id);
  if (!user) notFound('找不到使用者');
  if (input.full_name !== undefined) user!.full_name = input.full_name;
  if (input.phone !== undefined) user!.phone = input.phone;
  if (input.role !== undefined) user!.role = input.role;
  if (input.status !== undefined) user!.status = input.status;
  return { message: '帳號已更新' };
}

// ---------- Territories / Vehicles ----------

export function listTerritories(token: string | null) {
  requireUser(token);
  return db.territories;
}

export function listVehicles(token: string | null) {
  requireUser(token);
  return db.vehicles.map((v) => ({
    ...v,
    active_case_count: db.cases.filter((c) => c.assigned_vehicle_id === v.id && c.status !== 'closed').length,
  }));
}

export function suggestVehicle(token: string | null, territoryId: number) {
  requireUser(token);
  const vehicle = db.vehicles.find((v) => v.territory_id === territoryId);
  if (!vehicle) notFound('該轄區尚無對應車輛');
  return vehicle;
}

// ---------- Exception reasons ----------

export function listExceptionReasons(token: string | null) {
  requireUser(token);
  return db.exceptionReasons;
}

// ---------- Cases ----------

export function createCase(token: string | null, input: any) {
  const actor = requireUser(token);
  if (!input.reporter_name || !input.reporter_phone || !input.report_address || !input.report_reason) {
    badRequest('請填寫所有必填欄位');
  }
  const id = db.nextCaseId++;
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const caseNo = `${todayStr}-${String(db.caseNoSeq++).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newCase: MockCase = {
    id,
    case_no: caseNo,
    status: 'received',
    reporter_name: input.reporter_name,
    reporter_org: input.reporter_org ?? null,
    reporter_phone: input.reporter_phone,
    report_address: input.report_address,
    report_lat: null,
    report_lng: null,
    territory_id: input.territory_id ?? null,
    report_reason: input.report_reason,
    animal_male_count: input.animal_male_count ?? 0,
    animal_female_count: input.animal_female_count ?? 0,
    animal_juvenile_count: input.animal_juvenile_count ?? 0,
    animal_adult_count: input.animal_adult_count ?? 0,
    assigned_vehicle_id: null,
    assigned_staff_id: null,
    received_at: now,
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
    created_by: actor.id,
    photos: [],
  };
  db.cases.push(newCase);
  db.statusHistory.push({
    case_id: id,
    from_status: null,
    to_status: 'received',
    changed_by: actor.id,
    changed_by_name: actor.full_name,
    changed_at: now,
  });
  return { id, case_no: caseNo };
}

export function listCases(token: string | null, filters: { status?: string; date?: string; vehicle_id?: string }) {
  const actor = requireUser(token);
  let result = db.cases;
  if (actor.role === 'field_staff') {
    result = result.filter((c) => c.assigned_staff_id === actor.id);
  }
  if (filters.status) result = result.filter((c) => c.status === filters.status);
  if (filters.date) result = result.filter((c) => c.received_at.slice(0, 10) === filters.date);
  if (filters.vehicle_id) result = result.filter((c) => c.assigned_vehicle_id === Number(filters.vehicle_id));

  return [...result]
    .sort((a, b) => (a.received_at < b.received_at ? 1 : -1))
    .map(withJoins);
}

export function getCaseDetail(token: string | null, caseId: number) {
  const actor = requireUser(token);
  const c = findCaseOrThrow(caseId);
  if (actor.role === 'field_staff' && c.assigned_staff_id !== actor.id) {
    forbidden('權限不足');
  }
  return withJoins(c);
}

export function getCaseHistory(token: string | null, caseId: number) {
  requireUser(token);
  findCaseOrThrow(caseId);
  return {
    statusHistory: db.statusHistory.filter((h) => h.case_id === caseId),
    assignmentHistory: db.assignmentHistory.filter((h) => h.case_id === caseId),
  };
}

export function dispatchCase(token: string | null, caseId: number, vehicleId: number, staffId: number) {
  const actor = requireUser(token);
  const c = findCaseOrThrow(caseId);
  if (c.status === 'closed') badRequest('案件已結案，無法指派');

  const isInitial = c.status === 'received';
  const isReassignment = !isInitial && (c.assigned_vehicle_id !== vehicleId || c.assigned_staff_id !== staffId);
  if (!isInitial && !isReassignment) badRequest('車輛與人員未變更，無需重新指派');

  const now = new Date().toISOString();
  const vehicle = db.vehicles.find((v) => v.id === vehicleId);
  const staff = db.users.find((u) => u.id === staffId);

  if (isInitial) {
    c.status = 'dispatched';
    c.dispatched_at = now;
    db.statusHistory.push({
      case_id: caseId,
      from_status: 'received',
      to_status: 'dispatched',
      changed_by: actor.id,
      changed_by_name: actor.full_name,
      changed_at: now,
    });
    db.assignmentHistory.push({
      case_id: caseId,
      vehicle_id: vehicleId,
      vehicle_no: vehicle?.vehicle_no ?? '',
      staff_id: staffId,
      staff_name: staff?.full_name ?? '',
      assigned_at: now,
      unassigned_at: null,
      reason: 'initial',
    });
  } else {
    const prior = db.assignmentHistory.find((h) => h.case_id === caseId && h.unassigned_at === null);
    if (prior) prior.unassigned_at = now;
    db.assignmentHistory.push({
      case_id: caseId,
      vehicle_id: vehicleId,
      vehicle_no: vehicle?.vehicle_no ?? '',
      staff_id: staffId,
      staff_name: staff?.full_name ?? '',
      assigned_at: now,
      unassigned_at: null,
      reason: 'support_handover',
    });
  }
  c.assigned_vehicle_id = vehicleId;
  c.assigned_staff_id = staffId;
  return { id: caseId };
}

function transitionCase(token: string | null, caseId: number, toStatus: Status) {
  const actor = requireUser(token);
  const c = findCaseOrThrow(caseId);
  if (c.assigned_staff_id !== actor.id) forbidden('您並非此案件的負責人員');
  if (!TRANSITIONS[c.status].includes(toStatus)) badRequest(`無法從「${c.status}」轉換到「${toStatus}」`);

  const now = new Date().toISOString();
  c.status = toStatus;
  if (toStatus === 'acknowledged') c.acknowledged_at = now;
  if (toStatus === 'in_progress') c.arrived_at = now;
  db.statusHistory.push({
    case_id: caseId,
    from_status: c.status,
    to_status: toStatus,
    changed_by: actor.id,
    changed_by_name: actor.full_name,
    changed_at: now,
  });
  return { id: caseId, status: toStatus };
}

export function acknowledgeCase(token: string | null, caseId: number) {
  return transitionCase(token, caseId, 'acknowledged');
}
export function startCase(token: string | null, caseId: number) {
  return transitionCase(token, caseId, 'in_progress');
}

export function checkinCase(token: string | null, caseId: number, lat: number, lng: number, address?: string) {
  const actor = requireUser(token);
  const c = findCaseOrThrow(caseId);
  if (c.assigned_staff_id !== actor.id) forbidden('您並非此案件的負責人員');
  if (c.status === 'closed') badRequest('案件已結案');
  c.checkin_lat = lat;
  c.checkin_lng = lng;
  c.checkin_address = address ?? null;
  c.checkin_at = new Date().toISOString();
  return { id: caseId };
}

export function closeStandard(token: string | null, caseId: number, resolutionNotes: string) {
  const actor = requireUser(token);
  const c = findCaseOrThrow(caseId);
  if (c.assigned_staff_id !== actor.id) forbidden('您並非此案件的負責人員');
  if (c.status !== 'in_progress') badRequest('僅「處理中」狀態的案件可標準結案');
  if (!resolutionNotes || !resolutionNotes.trim()) badRequest('請填寫處理結果描述');

  const categories = new Set(c.photos.map((p) => p.category));
  const required = ['scene', 'processing', 'triplicate_form'];
  const missing = required.filter((cat) => !categories.has(cat as any));
  if (missing.length > 0) badRequest(`尚缺以下分類照片: ${missing.join(', ')}`);

  const now = new Date().toISOString();
  c.status = 'closed';
  c.closed_at = now;
  c.close_type = 'standard';
  c.exception_reason_id = null;
  c.resolution_notes = resolutionNotes;
  db.statusHistory.push({
    case_id: caseId,
    from_status: 'in_progress',
    to_status: 'closed',
    changed_by: actor.id,
    changed_by_name: actor.full_name,
    changed_at: now,
  });
  return { id: caseId };
}

export function closeException(token: string | null, caseId: number, exceptionReasonId: number, notes?: string) {
  const actor = requireUser(token);
  const c = findCaseOrThrow(caseId);
  if (!EXCEPTION_CLOSE_ALLOWED_FROM.includes(c.status)) badRequest('此案件目前狀態無法例外結案');
  const reason = db.exceptionReasons.find((r) => r.id === exceptionReasonId);
  if (!reason) badRequest('無效的例外結案原因');

  const now = new Date().toISOString();
  const fromStatus = c.status;
  c.status = 'closed';
  c.closed_at = now;
  c.close_type = 'exception';
  c.exception_reason_id = exceptionReasonId;
  if (notes) c.resolution_notes = notes;
  db.statusHistory.push({
    case_id: caseId,
    from_status: fromStatus,
    to_status: 'closed',
    changed_by: actor.id,
    changed_by_name: actor.full_name,
    changed_at: now,
  });
  return { id: caseId };
}

export function requestSupport(token: string | null, caseId: number) {
  const actor = requireUser(token);
  const c = findCaseOrThrow(caseId);
  if (c.assigned_staff_id !== actor.id) forbidden('您並非此案件的負責人員');
  if (c.status === 'closed') badRequest('案件已結案');
  c.support_requested = true;
  c.support_requested_at = new Date().toISOString();
  return { id: caseId };
}

export function addPhoto(token: string | null, caseId: number, category: 'scene' | 'processing' | 'triplicate_form', uri: string) {
  requireUser(token);
  const c = findCaseOrThrow(caseId);
  const photo = { id: db.nextPhotoId++, category, url: uri, uploaded_at: new Date().toISOString() };
  c.photos.push(photo);
  return { message: '上傳成功', url: uri, category };
}

// ---------- Roster ----------

export function getRoster(token: string | null, date: string, shift: '小夜' | '大夜') {
  requireUser(token);
  const publishRow = db.rosterPublishStatus.find((p) => p.roster_date === date && p.shift === shift);
  const published = !!publishRow?.published_at;
  const entries = db.rosterEntries
    .filter((e) => e.roster_date === date && e.shift === shift)
    .map((e) => ({
      vehicle_id: e.vehicle_id,
      vehicle_no: db.vehicles.find((v) => v.id === e.vehicle_id)?.vehicle_no ?? '',
      staff_user_id: e.staff_user_id,
      staff_name: db.users.find((u) => u.id === e.staff_user_id)?.full_name ?? '',
    }));
  return { published, published_at: published ? publishRow!.published_at : null, entries };
}

export function upsertRoster(
  token: string | null,
  date: string,
  shift: '小夜' | '大夜',
  entries: { vehicle_id: number; staff_user_id: number }[]
) {
  requireUser(token);
  for (const entry of entries) {
    const existing = db.rosterEntries.find(
      (e) => e.roster_date === date && e.shift === shift && e.vehicle_id === entry.vehicle_id
    );
    if (existing) existing.staff_user_id = entry.staff_user_id;
    else db.rosterEntries.push({ roster_date: date, shift, vehicle_id: entry.vehicle_id, staff_user_id: entry.staff_user_id });
  }
  return { message: '班表已更新' };
}

export function publishRoster(token: string | null, date: string, shift: '小夜' | '大夜') {
  requireUser(token);
  const hasEntries = db.rosterEntries.some((e) => e.roster_date === date && e.shift === shift);
  if (!hasEntries) badRequest('班表尚未填寫，無法發布');

  const existing = db.rosterPublishStatus.find((p) => p.roster_date === date && p.shift === shift);
  if (existing) existing.published_at = new Date().toISOString();
  else db.rosterPublishStatus.push({ roster_date: date, shift, published_at: new Date().toISOString() });
  return { message: '班表已發布' };
}

// ---------- Attendance（打卡出勤）----------

export function listAttendance(token: string | null) {
  const actor = requireUser(token);
  return db.attendanceRecords
    .filter((r) => r.user_id === actor.id)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

function latestAttendanceRecord(userId: number) {
  const records = db.attendanceRecords.filter((r) => r.user_id === userId);
  if (records.length === 0) return null;
  return records.reduce((latest, r) => (r.timestamp > latest.timestamp ? r : latest));
}

export function clockIn(
  token: string | null,
  photoUrl: string,
  lat: number | null,
  lng: number | null,
  address: string | null
) {
  const actor = requireUser(token);
  const latest = latestAttendanceRecord(actor.id);
  if (latest && latest.type === 'in') badRequest('您已經打卡上班，尚未打卡下班');

  const record = {
    id: db.nextAttendanceId++,
    user_id: actor.id,
    type: 'in' as const,
    timestamp: new Date().toISOString(),
    lat,
    lng,
    address,
    photo_url: photoUrl,
  };
  db.attendanceRecords.push(record);
  return record;
}

export function clockOut(
  token: string | null,
  photoUrl: string,
  lat: number | null,
  lng: number | null,
  address: string | null
) {
  const actor = requireUser(token);
  const latest = latestAttendanceRecord(actor.id);
  if (!latest || latest.type === 'out') badRequest('您尚未打卡上班，無法打卡下班');

  const record = {
    id: db.nextAttendanceId++,
    user_id: actor.id,
    type: 'out' as const,
    timestamp: new Date().toISOString(),
    lat,
    lng,
    address,
    photo_url: photoUrl,
  };
  db.attendanceRecords.push(record);
  return record;
}
