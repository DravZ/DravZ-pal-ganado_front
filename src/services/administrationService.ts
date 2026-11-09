import { apiBaseUrl, requestCsrfToken } from './authService';

type AdminMethod = 'POST' | 'PATCH';

export async function requestOnlineAdministrationWrite<T extends Record<string, unknown>>(
  path: string,
  method: AdminMethod,
  payload: Record<string, unknown>,
): Promise<T> {
  if (!navigator.onLine) {
    throw new Error('Esta operación requiere conexión a internet y no se guardó localmente.');
  }

  const csrfToken = await requestCsrfToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();

  if (!response.ok) {
    let message = responseText || `La operación falló (${response.status}).`;
    try {
      const body: unknown = JSON.parse(responseText);
      if (typeof body === 'object' && body !== null) {
        const details = body as Record<string, unknown>;
        for (const key of ['detail', 'message', 'error', 'title']) {
          if (typeof details[key] === 'string') {
            message = details[key];
            break;
          }
        }
      }
    } catch {
      message = responseText || message;
    }
    throw new Error(message);
  }

  if (!responseText) {
    throw new Error('El servidor no devolvió el registro guardado.');
  }

  const result: unknown = JSON.parse(responseText);
  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    throw new Error('El servidor devolvió una respuesta de administración inválida.');
  }
  return result as T;
}
