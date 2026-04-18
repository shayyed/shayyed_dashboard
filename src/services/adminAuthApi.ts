import { API_BASE_URL, API_KEY } from '../config/env';

const STORAGE_ACCESS = 'shayyed_admin_access_token';
const STORAGE_REFRESH = 'shayyed_admin_refresh_token';
const STORAGE_ADMIN = 'shayyed_admin_profile';

export type AdminProfile = {
  id: string;
  email: string;
  name?: string;
  roles?: { name: string; permission: string }[];
};

type SigninSuccessBody = {
  status?: boolean;
  message?: string;
  data?: {
    admin: AdminProfile;
    accessToken: string;
    refreshToken?: string;
    expiresIn?: string;
  };
};

type ErrorBody = {
  status?: boolean;
  messageEn?: string;
  messageAr?: string;
  message?: string;
};

function getErrorMessage(json: ErrorBody, fallback: string): string {
  return json.messageAr || json.messageEn || json.message || fallback;
}

export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_ACCESS);
  } catch {
    return null;
  }
}

export function getAdminProfile(): AdminProfile | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_ADMIN);
    if (!raw) return null;
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_ACCESS);
    sessionStorage.removeItem(STORAGE_REFRESH);
    sessionStorage.removeItem(STORAGE_ADMIN);
  } catch {
    /* ignore */
  }
}

export async function signIn(email: string, password: string): Promise<{ admin: AdminProfile }> {
  if (!API_BASE_URL) {
    throw new Error('لم يُضبط عنوان الخادم (VITE_API_BASE_URL)');
  }
  if (!API_KEY) {
    throw new Error('لم يُضبط مفتاح API (VITE_API_KEY)');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/admin/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: API_KEY,
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });
  } catch {
    throw new Error(
      `تعذر الاتصال بالخادم (${API_BASE_URL}). شغّل واجهة الـ API أولاً (من مجلد shayyed_engine: npm run dev أو npm start) وتأكد أن المنفذ يطابق VITE_API_BASE_URL في ملف .env.`
    );
  }

  const json = (await res.json().catch(() => ({}))) as SigninSuccessBody & ErrorBody;

  if (!res.ok) {
    throw new Error(getErrorMessage(json, 'فشل تسجيل الدخول'));
  }

  const data = json.data;
  if (!data?.accessToken || !data.admin) {
    throw new Error('استجابة غير صالحة من الخادم');
  }

  try {
    sessionStorage.setItem(STORAGE_ACCESS, data.accessToken);
    if (data.refreshToken) sessionStorage.setItem(STORAGE_REFRESH, data.refreshToken);
    sessionStorage.setItem(STORAGE_ADMIN, JSON.stringify(data.admin));
  } catch {
    throw new Error('تعذر حفظ الجلسة في المتصفح');
  }

  return { admin: data.admin };
}

export async function signOut(): Promise<void> {
  const token = getAccessToken();
  if (token && API_BASE_URL) {
    try {
      await fetch(`${API_BASE_URL}/admin/user/signout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      /* still clear local session */
    }
  }
  clearSession();
}
