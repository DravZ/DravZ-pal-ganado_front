import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  offlineDatabase,
  type CachedRecord,
  type SyncQueueOperation,
} from './offlineDatabase';
import { apiFetch, apiUrl } from './apiClient';
import { requestCsrfToken } from './authService';

export type HatoResource =
  | 'animals'
  | 'weight_records'
  | 'reproductive_records'
  | 'health_records'
  | 'vaccinations'
  | 'movements'
  | 'sales_records'
  | 'treatments'
  | 'lots'
  | 'paddocks'
  | 'customers'
  | 'medications'
  | 'inventories'
  | 'animal_identifiers'
  | 'feeding_records'
  | 'production_records'
  | 'products'
  | 'purchase_records'
  | 'suppliers'
  | 'expenses'
  | 'cost_allocations'
  | 'users'
  | 'farms'
  | 'alerts'
  | 'organizations';

export interface HatoScope {
  userId: string;
  organizationId: string;
  farmId: string;
}

export interface HatoCollection<T extends Record<string, unknown>> {
  records: T[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface HatoWriteResult {
  recordId: string;
  pending: boolean;
  lastError?: string;
}

type WriteOperation = SyncQueueOperation['operation'];

const endpointByResource: Record<HatoResource, string> = {
  animals: '/animals',
  weight_records: '/weight-records',
  reproductive_records: '/reproductive-records',
  health_records: '/health-records',
  vaccinations: '/vaccinations',
  movements: '/movements',
  sales_records: '/sales-records',
  treatments: '/treatments',
  lots: '/lots',
  paddocks: '/paddocks',
  customers: '/customers',
  medications: '/medications',
  inventories: '/inventories',
  animal_identifiers: '/animal-identifiers',
  feeding_records: '/feeding-records',
  production_records: '/production-records',
  products: '/products',
  purchase_records: '/purchase-records',
  suppliers: '/suppliers',
  expenses: '/expenses',
  cost_allocations: '/cost-allocations',
  users: '/users',
  farms: '/farms',
  alerts: '/alerts',
  organizations: '/organizations',
};

const supportedOperations: Record<HatoResource, WriteOperation[]> = {
  animals: ['CREATE', 'UPDATE', 'DELETE'],
  weight_records: ['CREATE', 'UPDATE', 'DELETE'],
  reproductive_records: ['CREATE', 'UPDATE', 'DELETE'],
  health_records: ['CREATE', 'UPDATE', 'DELETE'],
  vaccinations: ['CREATE'],
  movements: ['CREATE'],
  sales_records: ['CREATE', 'UPDATE', 'DELETE'],
  treatments: ['CREATE'],
  lots: ['CREATE'],
  paddocks: ['CREATE', 'UPDATE', 'DELETE'],
  customers: [],
  medications: [],
  inventories: [],
  animal_identifiers: ['CREATE'],
  feeding_records: ['CREATE'],
  production_records: ['CREATE'],
  products: ['CREATE', 'UPDATE', 'DELETE'],
  purchase_records: ['CREATE', 'UPDATE', 'DELETE'],
  suppliers: [],
  expenses: ['CREATE'],
  cost_allocations: ['CREATE'],
  users: [],
  farms: [],
  alerts: ['UPDATE'],
  organizations: ['UPDATE'],
};

const onlineOnlyResources = new Set(['users', 'farms', 'roles', 'permissions']);
const organizationScopedResources = new Set<string>([
  'customers',
  'medications',
  'products',
  'suppliers',
  'users',
  'farms',
  'organizations',
]);
const animalScopedResources = new Set<HatoResource>([
  'weight_records',
  'reproductive_records',
  'health_records',
  'vaccinations',
  'treatments',
  'animal_identifiers',
]);
const queueProcessors = new Map<string, Promise<void>>();

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function recordFarmId(record: CachedRecord): string | null {
  const scopedFarm = record.payload.scope_farm_id;
  const directFarm = record.payload.farm_id;
  if (typeof scopedFarm === 'string') return scopedFarm;
  if (typeof directFarm === 'string') return directFarm;
  return record.farmId;
}

function recordMatchesFarm(record: CachedRecord, farmId: string): boolean {
  if (organizationScopedResources.has(record.resourceType)) return true;
  if (record.resourceType === 'animals') return record.farmId === farmId;
  const directFarm = recordFarmId(record);
  if (directFarm) return directFarm === farmId;
  const animalId = record.payload.animal_id;
  if (typeof animalId !== 'string') return false;
  return false;
}

function responseId(payload: Record<string, unknown>): string | null {
  const value = payload.id;
  return typeof value === 'string' ? value : null;
}

function normalizedIdentifier(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

async function assertLocalAnimalIdentifierAvailable(
  scope: HatoScope,
  payload: Record<string, unknown>,
  excludedAnimalId: string,
): Promise<void> {
  const identifiers = new Set([
    normalizedIdentifier(payload.tag_number ?? payload.identifier_tag),
    normalizedIdentifier(payload.identifier_code),
  ].filter(Boolean));
  if (!identifiers.size) return;

  const [animals, animalIdentifiers] = await Promise.all([
    offlineDatabase.records
      .where('[userId+resourceType]')
      .equals([scope.userId, 'animals'])
      .toArray(),
    offlineDatabase.records
      .where('[userId+resourceType]')
      .equals([scope.userId, 'animal_identifiers'])
      .toArray(),
  ]);
  const duplicateAnimal = animals.some((record) =>
    record.organizationId === scope.organizationId
    && record.recordId !== excludedAnimalId
    && identifiers.has(normalizedIdentifier(
      record.payload.tag_number ?? record.payload.identifier_tag,
    )),
  );
  const duplicateIdentifier = animalIdentifiers.some((record) =>
    record.organizationId === scope.organizationId
    && record.payload.animal_id !== excludedAnimalId
    && record.payload.animalId !== excludedAnimalId
    && identifiers.has(normalizedIdentifier(record.payload.identifier)),
  );
  if (duplicateAnimal || duplicateIdentifier) {
    throw new Error('Ese identificador ya está registrado en otro animal de la organización.');
  }
}

function normalizeAdministrationPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...payload };
  const aliases: Record<string, string> = {
    organizationId: 'organization_id',
    farmId: 'farm_id',
    farmName: 'farm_name',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    legalName: 'legal_name',
    taxId: 'tax_id',
    totalAreaHectares: 'total_area_hectares',
    areaHectares: 'area_hectares',
    forageType: 'forage_type',
    capacityAnimalUnits: 'capacity_animal_units',
    resolvedAt: 'resolved_at',
    resolvedBy: 'resolved_by',
    alertType: 'alert_type',
    detectedAt: 'detected_at',
    dueDate: 'due_date',
  };
  for (const [source, target] of Object.entries(aliases)) {
    if (normalized[target] === undefined && normalized[source] !== undefined) {
      normalized[target] = normalized[source];
    }
  }
  return normalized;
}

async function activeAnimalFarm(userId: string, animalId: string): Promise<string | null> {
  const animal = await offlineDatabase.records.get([userId, 'animals', animalId]);
  return animal?.farmId ?? null;
}

export function useHatoCollection<T extends Record<string, unknown>>(
  resource: HatoResource,
  endpoint: string,
  scope: HatoScope | null,
): HatoCollection<T> {
  const [error, setError] = useState<string | null>(null);
  const scopedAnimalIds = useLiveQuery<string[]>(
    async () => {
      if (!scope) return [];
      const animals = await offlineDatabase.records
        .where('[userId+resourceType]')
        .equals([scope.userId, 'animals'])
        .toArray();
      return animals
        .filter((animal) => animal.farmId === scope.farmId)
        .map((animal) => animal.recordId)
        .sort();
    },
    [scope?.userId, scope?.farmId],
  ) ?? [];
  const scopedAnimalIdsKey = scopedAnimalIds.join('|');
  const cached = useLiveQuery<CachedRecord[]>(
    async () => {
      if (!scope) return [];
      const records = await offlineDatabase.records
        .where('[userId+resourceType]')
        .equals([scope.userId, resource])
        .toArray();
      const inScope = await Promise.all(records.map(async (record) =>
        recordMatchesFarm(record, scope.farmId)
        || await hatoRecordFarmId(scope.userId, record) === scope.farmId
      ));
      return records.filter((_, index) => inScope[index]);
    },
    [resource, scope?.userId, scope?.farmId],
  );
  const records = (cached ?? []).map((record) => record.payload as T);

  const refresh = useCallback(async () => {
    if (!scope || !endpoint || !navigator.onLine) return;
    const url = new URL(apiUrl(endpoint), window.location.origin);
    const animalIds = scopedAnimalIdsKey ? scopedAnimalIdsKey.split('|') : [];
    if (
      animalScopedResources.has(resource)
      && !url.searchParams.has('animal_id')
      && animalIds.length === 0
    ) return;
    if (
      ['customers', 'users', 'farms'].includes(resource)
      && !url.searchParams.has('organization_id')
    ) {
      url.searchParams.set('organization_id', scope.organizationId);
    } else if (
      organizationScopedResources.has(resource)
      && !url.searchParams.has('organization_id')
    ) {
      url.searchParams.set('organization_id', scope.organizationId);
    } else if (resource === 'animals' && !url.searchParams.has('farm_id')) {
      url.searchParams.set('organization_id', scope.organizationId);
      url.searchParams.set('farm_id', scope.farmId);
    } else if (
      [
        'lots',
        'paddocks',
        'movements',
        'sales_records',
        'feeding_records',
        'production_records',
        'inventories',
        'purchase_records',
        'expenses',
        'cost_allocations',
      ].includes(resource)
      && !url.searchParams.has('farm_id')
    ) {
      url.searchParams.set('farm_id', scope.farmId);
    }
    if (resource === 'alerts' && !url.searchParams.has('farm_id')) {
      url.searchParams.set('farm_id', scope.farmId);
    }

    const urls = animalScopedResources.has(resource) && !url.searchParams.has('animal_id')
      ? animalIds.map((animalId) => {
        const animalUrl = new URL(url);
        animalUrl.searchParams.set('animal_id', animalId);
        return animalUrl.toString();
      })
      : [url.toString()];
    const body = (await Promise.all(urls.map(async (requestUrl) => {
      const response = await apiFetch(new URL(requestUrl));
      if (!response.ok) {
        throw new Error(`No se pudieron actualizar los datos (${response.status}).`);
      }
      const payload: unknown = await response.json();
      if (!Array.isArray(payload) || !payload.every(isObject)) {
        throw new Error('El servidor devolvió una respuesta de datos inválida.');
      }
      return payload;
    }))).flat();
    if (!Array.isArray(body)) {
      throw new Error('El servidor devolvió una respuesta de datos inválida.');
    }
    await mergeRemoteRecords(
      scope,
      resource,
      body,
      urls.length > 1 || !url.searchParams.has('animal_id'),
    );
  }, [endpoint, resource, scope, scopedAnimalIdsKey]);

  useEffect(() => {
    if (!scope) return;
    let active = true;
    const synchronize = async () => {
      try {
        await refresh();
        if (active) setError(null);
      } catch (cause: unknown) {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'No se pudieron actualizar los datos.');
        }
      }
    };
    void synchronize();
    return () => {
      active = false;
    };
  }, [refresh, scope]);

  return {
    records,
    isLoading: cached === undefined,
    error,
    refresh,
  };
}

export function useHatoRecord<T extends Record<string, unknown>>(
  resource: HatoResource,
  endpoint: string,
  recordId: string,
  scope: HatoScope | null,
): { record: T | null; isLoading: boolean; error: string | null } {
  const [error, setError] = useState<string | null>(null);
  const cached = useLiveQuery<CachedRecord | undefined>(
    () => scope && recordId
      ? offlineDatabase.records.get([scope.userId, resource, recordId])
      : Promise.resolve(undefined),
    [recordId, resource, scope?.userId],
  );

  useEffect(() => {
    if (!scope || !recordId || recordId.startsWith('local:') || !navigator.onLine) return;
    void apiFetch(endpoint)
      .then(async (response) => {
        if (!response.ok) throw new Error(`No se pudo actualizar el registro (${response.status}).`);
        const payload: unknown = await response.json();
        if (!isObject(payload) || responseId(payload) !== recordId) {
          throw new Error('El servidor devolvió un registro distinto al solicitado.');
        }
        await mergeRemoteRecords(scope, resource, [payload], false);
        setError(null);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el registro.');
      });
  }, [endpoint, recordId, resource, scope]);

  return {
    record: cached && scope && recordMatchesFarm(cached, scope.farmId)
      ? cached.payload as T
      : null,
    isLoading: cached === undefined,
    error,
  };
}

async function mergeRemoteRecords(
  scope: HatoScope,
  resource: HatoResource,
  payloads: Record<string, unknown>[],
  completeCollection: boolean,
): Promise<void> {
  const now = new Date().toISOString();
  const remoteRecords: CachedRecord[] = [];

  for (const payload of payloads) {
    const id = responseId(payload);
    if (!id) throw new Error(`Un registro de ${resource} no contiene identificador.`);
    const recordOrganizationId = payload.organization_id ?? payload.scope_organization_id;
    if (
      typeof recordOrganizationId === 'string'
      && recordOrganizationId !== scope.organizationId
    ) {
      throw new Error('El servidor devolvió información de otra organización.');
    }
    const animalId = typeof payload.animal_id === 'string' ? payload.animal_id : null;
    const farmId = typeof payload.farm_id === 'string'
      ? payload.farm_id
      : animalId
        ? await activeAnimalFarm(scope.userId, animalId)
        : organizationScopedResources.has(resource) ? null : scope.farmId;
    if (!organizationScopedResources.has(resource) && farmId && farmId !== scope.farmId) {
      throw new Error('El servidor devolvió información de otra finca.');
    }
    remoteRecords.push({
      userId: scope.userId,
      organizationId: scope.organizationId,
      farmId: organizationScopedResources.has(resource) ? null : farmId ?? scope.farmId,
      resourceType: resource,
      recordId: id,
      version: typeof payload.version === 'number' ? payload.version : null,
      payload,
      updatedAt: now,
    });
  }

  await offlineDatabase.transaction(
    'rw',
    offlineDatabase.records,
    offlineDatabase.syncQueue,
    async () => {
      const current = await offlineDatabase.records
        .where('[userId+resourceType]')
        .equals([scope.userId, resource])
        .toArray();
      const protectedIds = new Set(
        (await offlineDatabase.syncQueue.where('userId').equals(scope.userId).toArray())
          .filter((operation) => operation.resourceType === resource)
          .map((operation) => operation.recordId),
      );

      for (const remote of remoteRecords) {
        if (protectedIds.has(remote.recordId)) continue;
        await offlineDatabase.records.put(remote);
      }

      const receivedIds = new Set(remoteRecords.map((record) => record.recordId));
      const stale: CachedRecord[] = [];
      if (completeCollection) {
        for (const record of current) {
          if (receivedIds.has(record.recordId) || protectedIds.has(record.recordId)) continue;
          if (
            organizationScopedResources.has(resource)
            || await hatoRecordFarmId(scope.userId, record) === scope.farmId
          ) stale.push(record);
        }
      }
      if (stale.length) {
        await offlineDatabase.records.bulkDelete(stale.map((record) => [
          record.userId,
          record.resourceType,
          record.recordId,
        ] as [string, string, string]));
      }
    },
  );
}

export async function cacheAdministrationRecord(
  userId: string,
  organizationId: string,
  resource: 'users' | 'farms',
  payload: Record<string, unknown>,
): Promise<void> {
  const normalized = normalizeAdministrationPayload(payload);
  const recordOrganizationId = normalized.organization_id;
  if (typeof recordOrganizationId !== 'string' || recordOrganizationId !== organizationId) {
    throw new Error('El registro devuelto pertenece a otra organización.');
  }
  await mergeRemoteRecords(
    { userId, organizationId, farmId: '' },
    resource,
    [normalized],
    false,
  );
}

export async function refreshOrganizationFarms(
  userId: string,
  organizationId: string,
): Promise<void> {
  if (!navigator.onLine) return;

  const url = new URL(apiUrl(endpointByResource.farms), window.location.origin);
  url.searchParams.set('organization_id', organizationId);
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`No se pudieron cargar las fincas (${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isObject)) {
    throw new Error('El servidor devolvió una lista de fincas inválida.');
  }

  await mergeRemoteRecords(
    { userId, organizationId, farmId: '' },
    'farms',
    payload.map(normalizeAdministrationPayload),
    true,
  );
}

function mergeLocalPayload(
  recordId: string,
  operation: WriteOperation,
  payload: Record<string, unknown>,
  previousPayload: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (operation === 'DELETE') return previousPayload ?? {};
  return operation === 'UPDATE'
    ? { ...(previousPayload ?? {}), ...payload, id: recordId }
    : { ...payload, id: recordId };
}

export async function queueHatoWrite(
  scope: HatoScope,
  resource: HatoResource,
  operation: WriteOperation,
  payload: Record<string, unknown>,
  recordId?: string,
): Promise<HatoWriteResult> {
  if (onlineOnlyResources.has(resource)) {
    if (!navigator.onLine) throw new Error('Esta operación requiere conexión a internet.');
  }
  if (!supportedOperations[resource].includes(operation)) {
    throw new Error(`El backend no permite ${operation} para ${resource}.`);
  }
  if (operation !== 'CREATE' && !recordId) {
    throw new Error('Falta el identificador del registro que se quiere modificar.');
  }
  if (operation === 'CREATE' && resource === 'animals' && !payload.organization_id) {
    throw new Error('La organización es obligatoria para registrar el animal.');
  }

  const localId = operation === 'CREATE' ? `local:${crypto.randomUUID()}` : recordId!;
  const key = crypto.randomUUID();
  const previous = operation === 'CREATE'
    ? undefined
    : await offlineDatabase.records.get([scope.userId, resource, localId]);
  const queued: SyncQueueOperation = {
    userId: scope.userId,
    organizationId: scope.organizationId,
    farmId: scope.farmId,
    resourceType: resource,
    recordId: localId,
    operation,
    payload,
    previousPayload: previous?.payload,
    baseVersion: previous?.version ?? null,
    idempotencyKey: key,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  await offlineDatabase.transaction(
    'rw',
    offlineDatabase.records,
    offlineDatabase.syncQueue,
    async () => {
      if (resource === 'animals' && operation !== 'DELETE') {
        const nextPayload = mergeLocalPayload(localId, operation, payload, previous?.payload);
        await assertLocalAnimalIdentifierAvailable(scope, nextPayload, localId);
      }

      const duplicate = await offlineDatabase.syncQueue
        .where('idempotencyKey')
        .equals(key)
        .first();
      if (duplicate) return;
      const operationId = await offlineDatabase.syncQueue.add(queued);
      if (operation === 'DELETE') {
        await offlineDatabase.records.delete([scope.userId, resource, localId]);
        return;
      }
      const localPayload = mergeLocalPayload(localId, operation, payload, previous?.payload);
      await offlineDatabase.records.put({
        userId: scope.userId,
        organizationId: scope.organizationId,
        farmId: scope.farmId,
        resourceType: resource,
        recordId: localId,
        version: previous?.version ?? null,
        payload: localPayload,
        updatedAt: new Date().toISOString(),
      });
      queued.id = operationId;
    },
  );

  if (!navigator.onLine) return { recordId: localId, pending: true };
  let lastError: string | undefined;
  try {
    await flushPendingHatoOperations(scope.userId);
  } catch (error) {
    lastError = error instanceof Error ? error.message : 'La operación sigue pendiente de sincronización.';
  }

  const unresolved = queued.id === undefined ? undefined : await offlineDatabase.syncQueue.get(queued.id);
  if (unresolved) return { recordId: localId, pending: true, lastError };
  if (operation === 'DELETE') return { recordId: localId, pending: false };

  if (operation === 'CREATE') {
    const mapped = await offlineDatabase.syncMetadata.get([
      scope.userId,
      `idMap:${localId}`,
    ]);
    return { recordId: mapped?.value ?? localId, pending: false };
  }
  return { recordId: localId, pending: false };
}

async function resolveLocalReferences(userId: string, value: unknown): Promise<unknown> {
  if (typeof value === 'string' && value.startsWith('local:')) {
    const mapping = await offlineDatabase.syncMetadata.get([userId, `idMap:${value}`]);
    if (!mapping) throw new Error('Una operación depende de un registro que aún no se ha sincronizado.');
    return mapping.value;
  }
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => resolveLocalReferences(userId, item)));
  }
  if (isObject(value)) {
    const entries = await Promise.all(Object.entries(value).map(async ([key, item]) => [
      key,
      await resolveLocalReferences(userId, item),
    ] as const));
    return Object.fromEntries(entries);
  }
  return value;
}

async function requestQueuedOperation(
  operation: SyncQueueOperation,
  recordId: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const endpoint = endpointByResource[operation.resourceType as HatoResource];
  if (!endpoint) throw new Error(`No existe endpoint de sincronización para ${operation.resourceType}.`);
  const method = operation.operation === 'CREATE'
    ? 'POST'
    : operation.operation === 'UPDATE'
      ? ['alerts', 'organizations'].includes(operation.resourceType) ? 'PATCH' : 'PUT'
      : 'DELETE';
  const csrfToken = await requestCsrfToken();
  const response = await apiFetch(`${endpoint}${method === 'POST' ? '' : `/${recordId}`}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': csrfToken,
      'Idempotency-Key': operation.idempotencyKey,
      ...(method === 'DELETE' ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(method === 'DELETE' ? {} : { body: JSON.stringify(payload) }),
  });
  if (!response.ok) {
    const text = await response.text();
    let message = text || `La operación falló (${response.status}).`;
    try {
      const body: unknown = JSON.parse(text);
      if (isObject(body)) {
        for (const key of ['detail', 'message', 'error', 'title']) {
          if (typeof body[key] === 'string') {
            message = body[key] as string;
            break;
          }
        }
      }
    } catch {
      message = text || message;
    }
    throw Object.assign(
      new Error(message),
      { status: response.status },
    );
  }
  if (response.status === 204) return null;
  const body: unknown = await response.json();
  if (!isObject(body)) throw new Error('El servidor devolvió una respuesta de escritura inválida.');
  return body;
}

async function applyServerResult(
  operation: SyncQueueOperation,
  response: Record<string, unknown> | null,
): Promise<void> {
  const resource = operation.resourceType;
  const localId = operation.recordId;
  if (!localId) throw new Error('La operación en cola perdió su identificador local.');
  const remoteId = response ? responseId(response) : null;
  const remoteRecordId = remoteId ?? localId;

  await offlineDatabase.transaction(
    'rw',
    offlineDatabase.records,
    offlineDatabase.syncQueue,
    offlineDatabase.syncMetadata,
    async () => {
      if (operation.operation === 'DELETE') {
        await offlineDatabase.records.delete([operation.userId, resource, localId]);
      } else if (response) {
        if (remoteRecordId !== localId) {
          await offlineDatabase.records.delete([operation.userId, resource, localId]);
          await offlineDatabase.syncMetadata.put({
            userId: operation.userId,
            key: `idMap:${localId}`,
            value: remoteRecordId,
          });
        }
        await offlineDatabase.records.put({
          userId: operation.userId,
          organizationId: operation.organizationId,
          farmId: organizationScopedResources.has(resource)
            ? null
            : typeof response.farm_id === 'string' ? response.farm_id : operation.farmId,
          resourceType: resource,
          recordId: remoteRecordId,
          version: typeof response.version === 'number' ? response.version : null,
          payload: response,
          updatedAt: new Date().toISOString(),
        });
      }
      if (response) await applyConfirmedAnimalChanges(operation, response);
      if (operation.id !== undefined) await offlineDatabase.syncQueue.delete(operation.id);
    },
  );
}

async function applyConfirmedAnimalChanges(
  operation: SyncQueueOperation,
  response: Record<string, unknown>,
): Promise<void> {
  const updates = new Map<string, Record<string, unknown>>();

  if (operation.resourceType === 'movements') {
    const destinationLotId = response.destination_lot_id;
    const animals = response.animals;
    if (typeof destinationLotId === 'string' && Array.isArray(animals)) {
      for (const entry of animals) {
        if (isObject(entry) && typeof entry.animal_id === 'string') {
          updates.set(entry.animal_id, { lot_id: destinationLotId });
        }
      }
    }
  } else if (operation.resourceType === 'sales_records') {
    if (typeof response.animal_id === 'string') {
      updates.set(response.animal_id, { status: 'sold' });
    }
    if (Array.isArray(response.lines)) {
      for (const line of response.lines) {
        if (!isObject(line)) continue;
        if (typeof line.animal_id === 'string') {
          updates.set(line.animal_id, { status: 'sold' });
        } else if (typeof line.lot_id === 'string') {
          // La venta de un lote marca como vendidos a todos sus animales activos.
          const lotAnimals = await offlineDatabase.records
            .where('[userId+resourceType]')
            .equals([operation.userId, 'animals'])
            .toArray();
          for (const record of lotAnimals) {
            if (record.farmId !== operation.farmId) continue;
            if (String(record.payload.lot_id ?? '') !== line.lot_id) continue;
            if (String(record.payload.status ?? 'active') !== 'active') continue;
            updates.set(record.recordId, { status: 'sold' });
          }
        }
      }
    }
  }

  for (const [animalId, changes] of updates) {
    const pending = await offlineDatabase.syncQueue
      .where('[userId+resourceType+recordId]')
      .equals([operation.userId, 'animals', animalId])
      .first();
    if (pending) continue;
    const animal = await offlineDatabase.records.get([operation.userId, 'animals', animalId]);
    if (!animal || animal.farmId !== operation.farmId) continue;
    await offlineDatabase.records.put({
      ...animal,
      payload: { ...animal.payload, ...changes },
      updatedAt: new Date().toISOString(),
    });
  }
}

async function restoreAfterConflict(operation: SyncQueueOperation, message: string): Promise<void> {
  await offlineDatabase.transaction(
    'rw',
    offlineDatabase.records,
    offlineDatabase.syncQueue,
    async () => {
      if (operation.recordId && operation.previousPayload) {
        await offlineDatabase.records.put({
          userId: operation.userId,
          organizationId: operation.organizationId,
          farmId: operation.farmId,
          resourceType: operation.resourceType,
          recordId: operation.recordId,
          version: operation.baseVersion,
          payload: operation.previousPayload,
          updatedAt: new Date().toISOString(),
        });
      } else if (operation.recordId && operation.operation === 'CREATE') {
        await offlineDatabase.records.delete([
          operation.userId,
          operation.resourceType,
          operation.recordId,
        ]);
      }
      if (operation.id !== undefined) {
        await offlineDatabase.syncQueue.update(operation.id, { status: 'CONFLICT', lastError: message });
      }
    },
  );
}

export function flushPendingHatoOperations(userId: string): Promise<void> {
  const existingProcessor = queueProcessors.get(userId);
  if (existingProcessor) return existingProcessor;
  const processor = (async () => {
    const pending = (await offlineDatabase.syncQueue
      .where('userId')
      .equals(userId)
      .sortBy('id'))
      .filter((operation) => operation.status === 'PENDING');

    for (const operation of pending) {
      if (!navigator.onLine) break;
      if (!operation.recordId) continue;
      try {
        const resolvedId = operation.operation === 'CREATE'
          ? operation.recordId
          : await resolveLocalReferences(userId, operation.recordId) as string;
        const resolvedPayload = await resolveLocalReferences(userId, operation.payload) as Record<string, unknown>;
        const response = await requestQueuedOperation(operation, resolvedId, resolvedPayload);
        await applyServerResult(operation, response);
      } catch (error) {
        const status = isObject(error) && typeof error.status === 'number' ? error.status : null;
        if (status !== null && status >= 400 && status < 500) {
          await restoreAfterConflict(
            operation,
            error instanceof Error ? error.message : 'El servidor rechazó la operación.',
          );
        } else if (operation.id !== undefined) {
          await offlineDatabase.syncQueue.update(operation.id, {
            lastError: error instanceof Error
              ? error.message
              : 'No se pudo sincronizar; se reintentará cuando haya conexión.',
          });
        }
        throw error;
      }
    }
  })().finally(() => {
    queueProcessors.delete(userId);
  });
  queueProcessors.set(userId, processor);
  return processor;
}

export async function hatoRecordFarmId(
  userId: string,
  record: CachedRecord,
): Promise<string | null> {
  if (recordFarmId(record)) return recordFarmId(record);
  const animalId = record.payload.animal_id;
  return typeof animalId === 'string' ? activeAnimalFarm(userId, animalId) : null;
}
