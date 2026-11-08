import type { FarmFormValues, RegistrationFormValues } from '../types/database.types';

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

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

async function getResponseMessage(response: Response): Promise<string> {
  const responseText = await response.text();
  if (!responseText) return `La solicitud falló (${response.status}).`;

  try {
    const body: unknown = JSON.parse(responseText);
    if (typeof body === 'object' && body !== null) {
      const data = body as Record<string, unknown>;
      for (const key of ['detail', 'message', 'error', 'title']) {
        if (typeof data[key] === 'string') return data[key];
      }
    }
  } catch {
    return responseText;
  }

  return `La solicitud falló (${response.status}).`;
}

async function requestCsrfToken(): Promise<string> {
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
