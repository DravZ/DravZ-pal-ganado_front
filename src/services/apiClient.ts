const configuredBackendTarget = import.meta.env.VITE_BACKEND_PROXY_TARGET
  ?.trim()
  .replace(/\/+$/, '');
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiBaseUrl = (import.meta.env.PROD
  ? configuredBackendTarget
    ? `${configuredBackendTarget}/api/v1`
    : configuredApiBaseUrl || '/api/v1'
  : '/api/v1'
).replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${apiBaseUrl}/${path.replace(/^\/+/, '')}`;
}

export async function apiFetch(path: string | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  return fetch(path instanceof URL ? path : apiUrl(path), {
    ...init,
    credentials: init.credentials ?? 'include',
    headers,
  });
}
