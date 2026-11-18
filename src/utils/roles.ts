export const ADMIN_ROLE = 'Administrador';
export const WORKER_ROLE = 'Trabajador';

/** Roles asignables desde la administración de usuarios. */
export const ASSIGNABLE_ROLES = [ADMIN_ROLE, WORKER_ROLE] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/**
 * Un usuario es administrador de la organización si su rol contiene "admin".
 * Se conserva el mismo criterio que el backend
 * (`HatoAuthorizationService.isOrganizationAdmin`) para no desincronizar ambos lados.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return typeof role === 'string' && role.toLowerCase().includes('admin');
}
