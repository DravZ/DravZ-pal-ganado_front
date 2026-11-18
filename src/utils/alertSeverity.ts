/**
 * Normaliza la severidad de una alerta.
 *
 * El backend guarda `Alert.severity` como texto libre (`varchar(30)`), por lo que
 * puede llegar con o sin acentos y con sinónimos en inglés. Aquí se compara de
 * forma tolerante para no depender de un literal exacto.
 */
export type NormalizedSeverity = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

const CRITICAL_VALUES = new Set(['CRITICA', 'CRITICAL', 'URGENTE']);
const HIGH_VALUES = new Set(['ALTA', 'HIGH', 'GRAVE']);
const MEDIUM_VALUES = new Set(['MEDIA', 'MEDIUM', 'MODERADA']);
const LOW_VALUES = new Set(['BAJA', 'LOW', 'LEVE']);

export function normalizeSeverity(severity: unknown): NormalizedSeverity | null {
  if (typeof severity !== 'string') return null;
  const normalized = severity
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
  if (CRITICAL_VALUES.has(normalized)) return 'CRITICA';
  if (HIGH_VALUES.has(normalized)) return 'ALTA';
  if (MEDIUM_VALUES.has(normalized)) return 'MEDIA';
  if (LOW_VALUES.has(normalized)) return 'BAJA';
  return null;
}

export function isCriticalSeverity(severity: unknown): boolean {
  return normalizeSeverity(severity) === 'CRITICA';
}

export function isHighSeverity(severity: unknown): boolean {
  return normalizeSeverity(severity) === 'ALTA';
}

/** Severidad ALTA o CRÍTICA (lo que el tablero considera urgente). */
export function isUrgentSeverity(severity: unknown): boolean {
  const normalized = normalizeSeverity(severity);
  return normalized === 'ALTA' || normalized === 'CRITICA';
}

/** Severidades MEDIA/BAJA o cualquier valor desconocido (se agrupan como "próximas"). */
export function isUpcomingSeverity(severity: unknown): boolean {
  const normalized = normalizeSeverity(severity);
  return normalized === 'MEDIA' || normalized === 'BAJA' || normalized === null;
}

/** Etiqueta visible y consistente para la severidad. */
export function severityLabel(severity: unknown): string {
  const normalized = normalizeSeverity(severity);
  if (normalized === 'CRITICA') return 'Crítica';
  if (normalized === 'ALTA') return 'Alta';
  if (normalized === 'BAJA') return 'Baja';
  return 'Media';
}
