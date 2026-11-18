import { offlineDatabase } from './offlineDatabase';
import { hatoRecordFarmId } from './hatoDataService';

/**
 * Registros de una finca ya guardados en el dispositivo, proyectados a su payload.
 * Permite derivar información (movimientos financieros, inversión) sin depender de la red.
 *
 * La coincidencia de finca usa la misma regla que `useHatoCollection` para que los datos
 * derivados correspondan exactamente con lo que muestran las listas.
 */
export async function cachedFarmRecords(
  userId: string,
  resourceType: string,
  farmId: string,
): Promise<Record<string, unknown>[]> {
  const records = await offlineDatabase.records
    .where('[userId+resourceType]')
    .equals([userId, resourceType])
    .toArray();
  const recordFarmIds = await Promise.all(
    records.map((record) => hatoRecordFarmId(userId, record)),
  );
  return records
    .filter((_, index) => recordFarmIds[index] === farmId)
    .map((record) => record.payload);
}

/** Registros de alcance de organización (sin finca) guardados en el dispositivo. */
export async function cachedOrganizationRecords(
  userId: string,
  resourceType: string,
): Promise<Record<string, unknown>[]> {
  const records = await offlineDatabase.records
    .where('[userId+resourceType]')
    .equals([userId, resourceType])
    .toArray();
  return records.map((record) => record.payload);
}
