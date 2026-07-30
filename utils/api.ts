import { MOCK_MODE } from '../constants/Config';
import { mockApiFetch } from '../mock/mockApi';
import { ApiError } from './ApiError';

export { ApiError };

export async function apiFetch<T = any>(
  url: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  if (MOCK_MODE) {
    return mockApiFetch<T>(url, token, options);
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(data?.message || `請求失敗 (${res.status})`, res.status);
  }
  return data as T;
}

// 上傳案件照片：展示模式直接把本機檔案 URI 存進記憶體資料，真實模式才走 multipart 上傳到後端/R2
export async function uploadCasePhoto(
  caseId: number,
  category: 'scene' | 'processing' | 'triplicate_form',
  uri: string,
  token: string | null
): Promise<{ url: string; category: string }> {
  if (MOCK_MODE) {
    const { addPhoto } = await import('../mock/mockStore');
    return addPhoto(token, caseId, category, uri);
  }

  const { ENDPOINTS } = await import('../constants/Config');
  const formData = new FormData();
  const fileName = uri.split('/').pop() || `${category}.jpg`;
  formData.append('photo', { uri, name: fileName, type: 'image/jpeg' } as any);
  formData.append('category', category);

  return apiFetch(ENDPOINTS.CASE_PHOTOS(caseId), token, { method: 'POST', body: formData });
}
