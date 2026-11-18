/**
 * Normaliza y etiqueta el estado de un usuario.
 *
 * El backend usa `active`, `inactive` y `pending_invitation`, pero también puede
 * devolver otros valores libres. Se centraliza aquí para que el listado y la
 * ficha de usuario muestren siempre las mismas etiquetas.
 */
export function normalizeUserStatus(status: unknown): string {
  return typeof status === 'string' ? status.trim().toLowerCase() : '';
}

export function isUserPending(status: unknown): boolean {
  const normalized = normalizeUserStatus(status);
  return normalized.includes('pending') || normalized.includes('invit');
}

export function isUserActive(status: unknown): boolean {
  return normalizeUserStatus(status) === 'active';
}

export function userStatusLabel(status: unknown): string {
  const normalized = normalizeUserStatus(status);
  if (isUserPending(normalized)) return 'Invitación pendiente';
  if (normalized === 'active') return 'Activo';
  if (!normalized) return 'Estado por confirmar';
  return 'Inactivo';
}
