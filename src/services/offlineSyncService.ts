import {
  offlineDatabase,
  type CachedProfile,
  type CachedRecord,
} from './offlineDatabase';

export interface SyncUser {
  id: string;
  organization_id: string;
  farm_id: string | null;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  user: SyncUser;
  expires_at: string;
  farm_ids: string[];
}

interface BootstrapResponse {
  user_id: string;
  organization_id: string;
  farm_ids: string[];
  cursor: number;
  tables: Record<string, Array<Record<string, unknown>>>;
}

interface ServerChange {
  sequence: number;
  resource_type: string;
  record_id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown> | null;
}

interface ChangePage {
  user_id: string;
  cursor: number;
  next_cursor: number;
  upper_bound: number;
  has_more: boolean;
  changes: ServerChange[];
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
const PAGE_SIZE = 100;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`La sincronización falló (${response.status}).`);
  return response.json() as Promise<T>;
}

function profileFromSession(session: AuthSession, initialized: boolean): CachedProfile {
  return {
    userId: session.user.id,
    organizationId: session.user.organization_id,
    farmId: session.user.farm_id,
    farmIds: session.farm_ids,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    expiresAt: session.expires_at,
    initialized,
  };
}

export async function cacheSessionProfile(session: AuthSession): Promise<CachedProfile> {
  const previous = await offlineDatabase.profiles.get(session.user.id);
  const sameOrganization = previous?.organizationId === session.user.organization_id;
  const profile = profileFromSession(session, sameOrganization && (previous?.initialized ?? false));
  await offlineDatabase.transaction(
    'rw',
    offlineDatabase.profiles,
    offlineDatabase.records,
    offlineDatabase.sessionState,
    async () => {
      if (previous) {
        const cachedRecords = await offlineDatabase.records.where('userId').equals(profile.userId).toArray();
        const isOrganizationAdmin = profile.role.toLowerCase().includes('admin');
        const obsolete = cachedRecords.filter((record) =>
          !sameOrganization
          || (record.farmId !== null && !profile.farmIds.includes(record.farmId))
          || (!isOrganizationAdmin && record.resourceType === 'users' && record.recordId !== profile.userId),
        );
        if (obsolete.length) {
          await offlineDatabase.records.bulkDelete(obsolete.map((record) => [
            record.userId,
            record.resourceType,
            record.recordId,
          ] as [string, string, string]));
        }
      }
      await offlineDatabase.profiles.put(profile);
      await offlineDatabase.sessionState.put({ key: 'activeUserId', value: profile.userId });
    },
  );
  return profile;
}

export async function initializeOrSyncOfflineData(session: AuthSession): Promise<CachedProfile> {
  let profile = await cacheSessionProfile(session);

  if (!profile.initialized) {
    const bootstrap = await fetchJson<BootstrapResponse>(`${apiBaseUrl}/sync/bootstrap`);
    if (bootstrap.user_id !== profile.userId || bootstrap.organization_id !== profile.organizationId) {
      throw new Error('El servidor devolvió datos de una cuenta distinta a la sesión actual.');
    }
    if (
      !Array.isArray(bootstrap.farm_ids)
      || bootstrap.farm_ids.some((farmId) => !session.farm_ids.includes(farmId))
      || !Number.isSafeInteger(bootstrap.cursor)
      || bootstrap.cursor < 0
    ) {
      throw new Error('El servidor devolvió un alcance de sincronización no autorizado.');
    }

    await offlineDatabase.transaction(
      'rw',
      offlineDatabase.records,
      offlineDatabase.profiles,
      offlineDatabase.syncQueue,
      offlineDatabase.syncMetadata,
      offlineDatabase.sessionState,
      async () => {
        const records: CachedRecord[] = [];
        for (const [resourceType, rows] of Object.entries(bootstrap.tables)) {
          for (const payload of rows) {
            const recordId = payload.id;
            if (typeof recordId !== 'string') continue;
            const organizationId = payload.scope_organization_id;
            const farmId = typeof payload.scope_farm_id === 'string'
              ? payload.scope_farm_id
              : typeof payload.farm_id === 'string' ? payload.farm_id : null;
            if (
              (typeof organizationId === 'string' && organizationId !== profile.organizationId)
              || (farmId !== null && !session.farm_ids.includes(farmId))
            ) {
              throw new Error('La descarga contiene registros fuera del alcance autorizado.');
            }
            const queued = await offlineDatabase.syncQueue
              .where('[userId+resourceType+recordId]')
              .equals([profile.userId, resourceType, recordId])
              .count();
            if (queued > 0) continue;

            records.push({
              userId: profile.userId,
              organizationId: bootstrap.organization_id,
              farmId,
              resourceType,
              recordId,
              version: typeof payload.version === 'number' ? payload.version : null,
              payload,
              updatedAt: new Date().toISOString(),
            });
          }
        }

        if (records.length) await offlineDatabase.records.bulkPut(records);
        profile = {
          ...profile,
          farmIds: bootstrap.farm_ids,
          initialized: true,
        };
        await offlineDatabase.profiles.put(profile);
        await offlineDatabase.syncMetadata.put({
          userId: profile.userId,
          key: 'serverCursor',
          value: String(bootstrap.cursor),
        });
        await offlineDatabase.syncMetadata.put({
          userId: profile.userId,
          key: 'initialSnapshotAt',
          value: new Date().toISOString(),
        });
        await offlineDatabase.sessionState.put({ key: 'activeUserId', value: profile.userId });
      },
    );
    return profile;
  }

  await applyIncrementalChanges(profile);
  return profile;
}

async function applyIncrementalChanges(profile: CachedProfile): Promise<void> {
  const metadataKey: [string, string] = [profile.userId, 'serverCursor'];
  const storedCursor = await offlineDatabase.syncMetadata.get(metadataKey);
  let requestCursor = Number(storedCursor?.value ?? 0);
  let upperBound: number | undefined;

  while (true) {
    const query = new URLSearchParams({
      cursor: String(requestCursor),
      limit: String(PAGE_SIZE),
    });
    if (upperBound !== undefined) query.set('upperBound', String(upperBound));

    const page = await fetchJson<ChangePage>(`${apiBaseUrl}/sync/changes?${query}`);
    if (
      page.user_id !== profile.userId
      || page.cursor !== requestCursor
      || !Number.isSafeInteger(page.upper_bound)
      || page.upper_bound < requestCursor
      || (upperBound !== undefined && page.upper_bound !== upperBound)
      || !Number.isSafeInteger(page.next_cursor)
      || page.next_cursor < requestCursor
      || page.next_cursor > page.upper_bound
      || (page.has_more && page.next_cursor <= requestCursor)
      || (!page.has_more && page.next_cursor !== page.upper_bound)
    ) {
      throw new Error('El servidor devolvió una página de sincronización inconsistente.');
    }
    upperBound ??= page.upper_bound;
    let previousSequence = requestCursor;
    for (const change of page.changes) {
      if (
        !Number.isSafeInteger(change.sequence)
        || change.sequence <= previousSequence
        || change.sequence > page.upper_bound
      ) {
        throw new Error('El servidor devolvió cambios fuera de secuencia.');
      }
      previousSequence = change.sequence;
    }
    if (page.has_more && page.next_cursor !== previousSequence) {
      throw new Error('El cursor de la página no coincide con sus cambios.');
    }

    await offlineDatabase.transaction(
      'rw',
      offlineDatabase.records,
      offlineDatabase.syncQueue,
      async () => {
        for (const change of page.changes) {
          const queued = await offlineDatabase.syncQueue
            .where('[userId+resourceType+recordId]')
            .equals([profile.userId, change.resource_type, change.record_id])
            .count();
          if (queued > 0) continue;

          const key: [string, string, string] = [
            profile.userId,
            change.resource_type,
            change.record_id,
          ];
          if (change.operation === 'DELETE' || !change.payload) {
            await offlineDatabase.records.delete(key);
            continue;
          }

          await offlineDatabase.records.put({
            userId: profile.userId,
            organizationId: profile.organizationId,
            farmId: typeof change.payload.scope_farm_id === 'string'
              ? change.payload.scope_farm_id
              : typeof change.payload.farm_id === 'string' ? change.payload.farm_id : null,
            resourceType: change.resource_type,
            recordId: change.record_id,
            version: typeof change.payload.version === 'number' ? change.payload.version : null,
            payload: change.payload,
            updatedAt: new Date().toISOString(),
          });
        }
      },
    );

    requestCursor = page.next_cursor;
    if (!page.has_more) break;
  }

  await offlineDatabase.syncMetadata.put({
    userId: profile.userId,
    key: 'serverCursor',
    value: String(requestCursor),
  });
  await offlineDatabase.syncMetadata.put({
    userId: profile.userId,
    key: 'lastSyncAt',
    value: new Date().toISOString(),
  });
}

export async function getServerCursor(userId: string): Promise<number> {
  const metadata = await offlineDatabase.syncMetadata.get([userId, 'serverCursor']);
  return Number(metadata?.value ?? 0);
}
