import Dexie, { type Table } from 'dexie';

export interface CachedProfile {
  userId: string;
  organizationId: string;
  farmId: string | null;
  farmIds: string[];
  name: string;
  email: string;
  role: string;
  expiresAt: string;
  initialized: boolean;
}

export interface CachedRecord {
  userId: string;
  organizationId: string;
  farmId: string | null;
  resourceType: string;
  recordId: string;
  version: number | null;
  payload: Record<string, unknown>;
  updatedAt: string;
}

export interface SyncQueueOperation {
  id?: number;
  userId: string;
  organizationId: string;
  farmId: string | null;
  resourceType: string;
  recordId: string | null;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  baseVersion: number | null;
  idempotencyKey: string;
  status: 'PENDING' | 'CONFLICT';
  previousPayload?: Record<string, unknown>;
  lastError?: string;
  createdAt: string;
}

export interface SyncConflict {
  id?: number;
  userId: string;
  resourceType: string;
  recordId: string;
  localPayload: Record<string, unknown>;
  remotePayload: Record<string, unknown>;
  createdAt: string;
  resolvedAt: string | null;
}

interface SessionState {
  key: 'activeUserId';
  value: string;
}

interface SyncMetadata {
  userId: string;
  key: string;
  value: string;
}

class OfflineDatabase extends Dexie {
  profiles!: Table<CachedProfile, string>;
  records!: Table<CachedRecord, [string, string, string]>;
  syncQueue!: Table<SyncQueueOperation, number>;
  conflicts!: Table<SyncConflict, number>;
  sessionState!: Table<SessionState, string>;
  syncMetadata!: Table<SyncMetadata, [string, string]>;

  constructor() {
    super('palaganado-offline');
    this.version(1).stores({
      profiles: '&userId, organizationId',
      records: '&[userId+resourceType+recordId], userId, organizationId, farmId, [userId+resourceType]',
      syncQueue: '++id, userId, [userId+status], [userId+resourceType+recordId], &idempotencyKey, createdAt',
      conflicts: '++id, userId, [userId+resolvedAt], createdAt',
      sessionState: '&key',
      syncMetadata: '&[userId+key], userId',
    });
  }
}

export const offlineDatabase = new OfflineDatabase();

export async function getActiveProfile(): Promise<CachedProfile | undefined> {
  const active = await offlineDatabase.sessionState.get('activeUserId');
  return active ? offlineDatabase.profiles.get(active.value) : undefined;
}

export async function setActiveProfile(profile: CachedProfile): Promise<void> {
  await offlineDatabase.transaction('rw', offlineDatabase.profiles, offlineDatabase.sessionState, async () => {
    await offlineDatabase.profiles.put(profile);
    await offlineDatabase.sessionState.put({ key: 'activeUserId', value: profile.userId });
  });
}

export async function clearActiveProfile(): Promise<void> {
  await offlineDatabase.sessionState.delete('activeUserId');
}
