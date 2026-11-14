import type { AnimalIdentifierDraft } from './types';

export const IDENTIFIER_TYPES = ['Siniga', 'Arete Visual', 'Microchip', 'Tatuaje'];

/**
 * Crea un identificador vacío para el formulario de registro.
 * Solo el primer identificador se marca como "actual" por defecto.
 */
export function createIdentifierDraft(isCurrent = false): AnimalIdentifierDraft {
  return {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `identifier-${Math.random().toString(36).slice(2)}`,
    type: IDENTIFIER_TYPES[0],
    code: '',
    isOfficial: false,
    isCurrent,
  };
}

/**
 * Devuelve el identificador que debe usarse como principal:
 * el marcado como actual con código, o el primero con código.
 */
export function resolveCurrentIdentifier(
  identifiers: AnimalIdentifierDraft[],
): AnimalIdentifierDraft | undefined {
  const withCode = identifiers.filter((identifier) => identifier.code.trim() !== '');
  return withCode.find((identifier) => identifier.isCurrent) ?? withCode[0];
}
