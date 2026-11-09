import type { FarmFormValues, RegistrationFormValues } from '../types/database.types';
import type { AuthSession } from './offlineSyncService';

interface RegistrationPayload {
  user_name: string;
  user_phone: string;
  user_email: string;
  user_pass: string;
  org_name: string;
  org_legal_name: string;
  org_tax_id: string;
  org_phone: string;
  org_email: string;
  farm: {
    name: string;
    code: string;
    state: string;
    municipality: string;
    locality: string;
    address: string;
    hectares: number;
  };
}

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

async function getResponseMessage(response: Response): Promise<string> {
  const responseText = await response.text();
  if (!responseText) return `La solicitud falló (${response.status}).`;

  try {
    const body: unknown = JSON.parse(responseText);
    if (typeof body === 'object' && body !== null) {
      const data = body as Record<string, unknown>;
      for (const key of ['detail', 'message', 'error', 'title']) {
        if (typeof data[key] === 'string') return data[key];
        if (typeof data[key] === 'object' && data[key] !== null) {
          const nested = data[key] as Record<string, unknown>;
          if (typeof nested.message === 'string') return nested.message;
        }
      }
    }
  } catch {
    return responseText;
  }

  return `La solicitud falló (${response.status}).`;
}

export async function requestCsrfToken(): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/auth/csrf`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(await getResponseMessage(response));
  }

  const body: unknown = await response.json();
  if (
    typeof body !== 'object'
    || body === null
    || !('token' in body)
    || typeof body.token !== 'string'
    || !body.token
  ) {
    throw new Error('El servidor no devolvió un token de seguridad válido.');
  }

  return body.token;
}

async function requestSession<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(await getResponseMessage(response));
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function loginAccount(email: string, password: string): Promise<AuthSession> {
  if (!navigator.onLine) throw new Error('El inicio de sesión requiere conexión a internet.');
  const csrfToken = await requestCsrfToken();
  return requestSession<AuthSession>('/auth/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

export function getCurrentSession(): Promise<AuthSession> {
  return requestSession<AuthSession>('/auth/session');
}

export async function renewCurrentSession(): Promise<AuthSession> {
  if (!navigator.onLine) throw new Error('Conéctate a internet para renovar tu sesión.');
  const csrfToken = await requestCsrfToken();
  return requestSession<AuthSession>('/auth/session/renew', {
    method: 'POST',
    headers: { 'X-XSRF-TOKEN': csrfToken },
  });
}

export async function closeCurrentSession(): Promise<void> {
  if (!navigator.onLine) throw new Error('Conéctate a internet para cerrar la sesión de forma segura.');
  const csrfToken = await requestCsrfToken();
  await requestSession<void>('/auth/session', {
    method: 'DELETE',
    headers: { 'X-XSRF-TOKEN': csrfToken },
  });
}

export async function registerAccount(
  userAndOrganization: RegistrationFormValues,
  farm: FarmFormValues,
): Promise<void> {
  const hectares = Number(farm.hectares);
  if (!Number.isFinite(hectares)) {
    throw new Error('Indica una superficie válida para la finca.');
  }

  const payload: RegistrationPayload = {
    user_name: userAndOrganization.userName.trim(),
    user_phone: userAndOrganization.userPhone.trim(),
    user_email: userAndOrganization.userEmail.trim(),
    user_pass: userAndOrganization.userPass,
    org_name: userAndOrganization.orgName.trim(),
    org_legal_name: userAndOrganization.orgLegalName.trim(),
    org_tax_id: userAndOrganization.orgTaxId.trim(),
    org_phone: userAndOrganization.orgPhone.trim(),
    org_email: userAndOrganization.orgEmail.trim(),
    farm: {
      name: farm.name.trim(),
      code: farm.code.trim(),
      state: farm.state.trim(),
      municipality: farm.municipality.trim(),
      locality: farm.locality.trim(),
      address: farm.address.trim(),
      hectares,
    },
  };

  const csrfToken = await requestCsrfToken();
  const response = await fetch(`${apiBaseUrl}/registrations`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getResponseMessage(response));
  }
}
