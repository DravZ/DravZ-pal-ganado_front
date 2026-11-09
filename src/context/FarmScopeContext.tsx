import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { offlineDatabase, type CachedRecord } from '../services/offlineDatabase';
import { useAuth } from './AuthContext';

export interface ActiveFarm {
  id: string;
  name: string;
}

interface FarmScopeValue {
  farms: ActiveFarm[];
  activeFarm: ActiveFarm | null;
  setActiveFarmId: (farmId: string) => void;
  scope: { userId: string; organizationId: string; farmId: string } | null;
}

const FarmScopeContext = createContext<FarmScopeValue | null>(null);

export function FarmScopeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const cachedFarms = useLiveQuery<CachedRecord[]>(
    () => user
      ? Promise.resolve(
        offlineDatabase.records
          .where('[userId+resourceType]')
          .equals([user.id, 'farms'])
          .toArray(),
      )
      : Promise.resolve([]),
    [user?.id],
  ) ?? [];

  const farms = useMemo(() => cachedFarms
    .map((record) => ({
      id: record.recordId,
      name: String(record.payload.name ?? '').trim(),
    }))
    .filter((farm) => farm.name.length > 0)
    .sort((left, right) => left.name.localeCompare(right.name, 'es', { sensitivity: 'base' })),
  [cachedFarms]);

  const activeFarm = farms.find((farm) => farm.id === selectedFarmId) ?? farms[0] ?? null;
  const scope = useMemo(() => user && activeFarm
    ? {
      userId: user.id,
      organizationId: user.organization_id,
      farmId: activeFarm.id,
    }
    : null, [activeFarm, user?.id, user?.organization_id]);
  const value = useMemo<FarmScopeValue>(() => ({
    farms,
    activeFarm,
    setActiveFarmId: setSelectedFarmId,
    scope,
  }), [activeFarm, farms, scope]);

  return <FarmScopeContext.Provider value={value}>{children}</FarmScopeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFarmScope(): FarmScopeValue {
  const context = useContext(FarmScopeContext);
  if (!context) throw new Error('useFarmScope debe usarse dentro de FarmScopeProvider');
  return context;
}
