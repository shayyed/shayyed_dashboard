import { API_BASE_URL } from '../config/env';
import { clearSession, getAccessToken } from './adminAuthApi';

/** Engine `responses.manager` admin token errors — session is no longer valid. */
const ADMIN_TOKEN_ERROR_CODES = new Set([522, 523, 524]);

let reloginRedirectScheduled = false;

function scheduleRedirectToLogin(): void {
  if (typeof window === 'undefined' || reloginRedirectScheduled) return;
  reloginRedirectScheduled = true;
  clearSession();
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  window.location.replace(`${base}/login`);
}

/**
 * Authenticated JSON request to the engine admin API (Bearer from session).
 * On expired/invalid token (401 or errorCode 522–524), clears storage and redirects to `/login`.
 */
export async function adminFetchJson(path: string, init?: RequestInit): Promise<unknown> {
  if (!API_BASE_URL) {
    throw new Error('لم يُضبط عنوان الخادم (VITE_API_BASE_URL)');
  }
  const token = getAccessToken();
  if (!token) {
    throw new Error('انتهت الجلسة — أعد تسجيل الدخول');
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  let res: Response;
  try {
    res = await fetch(`${base}${p}`, {
      ...init,
      headers: {
        ...(init?.body && init.method && init.method !== 'GET'
          ? { 'Content-Type': 'application/json' }
          : {}),
        Authorization: `Bearer ${token}`,
        ...(init?.headers as Record<string, string>),
      },
    });
  } catch {
    throw new Error(`تعذر الاتصال بالخادم (${API_BASE_URL}). تأكد أن واجهة الـ API تعمل.`);
  }
  const json = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    messageAr?: string;
    messageEn?: string;
    error?: string;
    errorCode?: number;
    data?: unknown;
  };

  const code = typeof json.errorCode === 'number' ? json.errorCode : undefined;
  const sessionInvalid =
    res.status === 401 ||
    (code !== undefined && ADMIN_TOKEN_ERROR_CODES.has(code));

  if (sessionInvalid) {
    scheduleRedirectToLogin();
    throw new Error(json.messageAr || json.messageEn || 'انتهت صلاحية الجلسة');
  }

  if (!res.ok || json.status === false) {
    throw new Error(json.messageAr || json.messageEn || `خطأ ${res.status}`);
  }
  return json.data;
}
