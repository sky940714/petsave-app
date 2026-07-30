import * as store from './mockStore';
import { ApiError } from '../utils/ApiError';

function parseBody(options: RequestInit): any {
  if (!options.body || typeof options.body !== 'string') return {};
  try {
    return JSON.parse(options.body);
  } catch {
    return {};
  }
}

// 模擬網路延遲，展示時感覺較真實
function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockApiFetch<T = any>(
  url: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  await delay();

  const parsed = new URL(url);
  const path = parsed.pathname.replace(/^\/api/, '');
  const method = (options.method || 'GET').toUpperCase();
  const query = Object.fromEntries(parsed.searchParams.entries());
  const body = parseBody(options);

  let m: RegExpMatchArray | null;

  // ---- Auth ----
  if (path === '/auth/login' && method === 'POST') {
    return store.login(body.email, body.password) as any;
  }
  if (path === '/auth/me' && method === 'GET') {
    return store.me(token) as any;
  }
  if (path === '/auth/users' && method === 'POST') {
    return store.createUser(token, body) as any;
  }
  if (path === '/auth/users' && method === 'GET') {
    return store.listUsers(token) as any;
  }
  if ((m = path.match(/^\/auth\/users\/(\d+)$/)) && method === 'PATCH') {
    return store.updateUser(token, Number(m[1]), body) as any;
  }

  // ---- Territories / Vehicles ----
  if (path === '/territories' && method === 'GET') {
    return store.listTerritories(token) as any;
  }
  if (path === '/vehicles' && method === 'GET') {
    return store.listVehicles(token) as any;
  }
  if (path === '/vehicles/suggest' && method === 'GET') {
    return store.suggestVehicle(token, Number(query.territory_id)) as any;
  }

  // ---- Exception reasons ----
  if (path === '/exception-reasons' && method === 'GET') {
    return store.listExceptionReasons(token) as any;
  }

  // ---- Cases ----
  if (path === '/cases' && method === 'POST') {
    return store.createCase(token, body) as any;
  }
  if (path === '/cases' && method === 'GET') {
    return store.listCases(token, query as any) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)$/)) && method === 'GET') {
    return store.getCaseDetail(token, Number(m[1])) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)\/history$/)) && method === 'GET') {
    return store.getCaseHistory(token, Number(m[1])) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)\/dispatch$/)) && method === 'PATCH') {
    return store.dispatchCase(token, Number(m[1]), Number(body.vehicle_id), Number(body.staff_id)) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)\/acknowledge$/)) && method === 'PATCH') {
    return store.acknowledgeCase(token, Number(m[1])) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)\/checkin$/)) && method === 'POST') {
    return store.checkinCase(token, Number(m[1]), body.lat, body.lng, body.address) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)\/start$/)) && method === 'PATCH') {
    return store.startCase(token, Number(m[1])) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)\/close\/standard$/)) && method === 'PATCH') {
    return store.closeStandard(token, Number(m[1]), body.resolution_notes) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)\/close\/exception$/)) && method === 'PATCH') {
    return store.closeException(token, Number(m[1]), Number(body.exception_reason_id), body.notes) as any;
  }
  if ((m = path.match(/^\/cases\/(\d+)\/support-request$/)) && method === 'POST') {
    return store.requestSupport(token, Number(m[1])) as any;
  }

  // ---- Roster ----
  if (path === '/roster' && method === 'GET') {
    return store.getRoster(token, query.date, query.shift as any) as any;
  }
  if (path === '/roster' && method === 'POST') {
    return store.upsertRoster(token, body.date, body.shift, body.entries) as any;
  }
  if (path === '/roster/publish' && method === 'POST') {
    return store.publishRoster(token, body.date, body.shift) as any;
  }

  // ---- Attendance ----
  if (path === '/attendance' && method === 'GET') {
    return store.listAttendance(token) as any;
  }
  if (path === '/attendance/clock-in' && method === 'POST') {
    return store.clockIn(token, body.photo_url, body.lat ?? null, body.lng ?? null, body.address ?? null) as any;
  }
  if (path === '/attendance/clock-out' && method === 'POST') {
    return store.clockOut(token, body.photo_url, body.lat ?? null, body.lng ?? null, body.address ?? null) as any;
  }

  // ---- Push tokens (展示模式不需要真的註冊) ----
  if (path === '/push-tokens' && method === 'POST') {
    return { message: 'push token 已註冊（展示模式）' } as any;
  }

  throw new ApiError(`展示模式尚未支援此請求: ${method} ${path}`, 501);
}
