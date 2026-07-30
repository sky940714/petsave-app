// constants/Config.ts
const isDevelopment = __DEV__;

// 展示模式：不連接任何後端/資料庫，所有 API 呼叫改由 mock/mockApi.ts 的記憶體資料模擬。
// 要接上真正的 petsave-backend 時，把這裡改成 false。
export const MOCK_MODE = true;

// 開發時請改成你電腦的區網 IP（例如 http://192.168.1.10:3000/api），
// 手機上的 Expo Go 無法連到 localhost。正式環境請改成部署後的網址。
// 展示模式下這個網址不會被實際連線，僅用來組出 mock 端可辨識的路徑。
const API_BASE_URL = 'http://localhost:3000/api';

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  ME: `${API_BASE_URL}/auth/me`,
  USERS: `${API_BASE_URL}/auth/users`,

  CASES: `${API_BASE_URL}/cases`,
  CASE_DETAIL: (id: number | string) => `${API_BASE_URL}/cases/${id}`,
  CASE_HISTORY: (id: number | string) => `${API_BASE_URL}/cases/${id}/history`,
  CASE_DISPATCH: (id: number | string) => `${API_BASE_URL}/cases/${id}/dispatch`,
  CASE_ACKNOWLEDGE: (id: number | string) => `${API_BASE_URL}/cases/${id}/acknowledge`,
  CASE_CHECKIN: (id: number | string) => `${API_BASE_URL}/cases/${id}/checkin`,
  CASE_START: (id: number | string) => `${API_BASE_URL}/cases/${id}/start`,
  CASE_CLOSE_STANDARD: (id: number | string) => `${API_BASE_URL}/cases/${id}/close/standard`,
  CASE_CLOSE_EXCEPTION: (id: number | string) => `${API_BASE_URL}/cases/${id}/close/exception`,
  CASE_SUPPORT_REQUEST: (id: number | string) => `${API_BASE_URL}/cases/${id}/support-request`,
  CASE_PHOTOS: (id: number | string) => `${API_BASE_URL}/cases/${id}/photos`,

  VEHICLES: `${API_BASE_URL}/vehicles`,
  VEHICLE_SUGGEST: (territoryId: number | string) => `${API_BASE_URL}/vehicles/suggest?territory_id=${territoryId}`,
  TERRITORIES: `${API_BASE_URL}/territories`,

  ROSTER: (date: string, shift: string) => `${API_BASE_URL}/roster?date=${date}&shift=${encodeURIComponent(shift)}`,
  ROSTER_UPSERT: `${API_BASE_URL}/roster`,
  ROSTER_PUBLISH: `${API_BASE_URL}/roster/publish`,

  EXCEPTION_REASONS: `${API_BASE_URL}/exception-reasons`,
  PUSH_TOKENS: `${API_BASE_URL}/push-tokens`,

  ATTENDANCE_LIST: `${API_BASE_URL}/attendance`,
  ATTENDANCE_CLOCK_IN: `${API_BASE_URL}/attendance/clock-in`,
  ATTENDANCE_CLOCK_OUT: `${API_BASE_URL}/attendance/clock-out`,
};

export default {
  API_BASE_URL,
  isDevelopment,
};
