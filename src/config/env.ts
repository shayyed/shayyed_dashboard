/** Base URL of shayyed_engine (no trailing slash), e.g. http://localhost:3000 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/** Same API key as engine `APIKEY` — required for `/admin/auth/*`. */
export const API_KEY = import.meta.env.VITE_API_KEY || '';

export function assertApiConfig(): void {
  if (!API_BASE_URL) {
    console.warn(
      '[dashboard] VITE_API_BASE_URL is empty — set it in .env (e.g. http://localhost:3000)'
    );
  }
  if (!API_KEY) {
    console.warn('[dashboard] VITE_API_KEY is empty — admin sign-in will fail until set');
  }
}
