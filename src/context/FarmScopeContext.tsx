import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { offlineDatabase, type CachedRecord } from '../services/offlineDatabase';
import { refreshOrganizationFarms } from '../services/hatoDataService';
import { useAuth } from './AuthContext';

export interface ActiveFarm {
  id: string;
  name: string;
}

interface FarmScopeValue {
  farms: ActiveFarm[];
  activeFarm: ActiveFarm | null;
  farmsError: string | null;
  setActiveFarmId: (farmId: string) => void;
  scope: { userId: string; organizationId: string; farmId: string } | null;
}

const FarmScopeContext = createContext<FarmScopeValue | null>(null);

export function FarmScopeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [farmLoadState, setFarmLoadState] = useState<{
    userId: string;
    organizationId: string;
    error: string | null;
  } | null>(null);
  const userId = user?.id;
  const organizationId = user?.organization_id;

  useEffect(() => {
    if (!userId || !organizationId) return undefined;

    let active = true;
    const synchronizeFarms = async () => {
      if (!navigator.onLine) return;
      try {
        await refreshOrganizationFarms(userId, organizationId);
        if (active) setFarmLoadState({ userId, organizationId, error: null });
      } catch (error: unknown) {
        if (active) {
          setFarmLoadState({
            userId,
            organizationId,
            error: error instanceof Error ? error.message : 'No se pudieron cargar las fincas.',
          });
        }
      }
    };

    void synchronizeFarms();
    window.addEventListener('online', synchronizeFarms);
    return () => {
      active = false;
      window.removeEventListener('online', synchronizeFarms);
    };
  }, [organizationId, userId]);

  const cachedFarms = useLiveQuery<CachedRecord[]>(
    () => userId
      ? Promise.resolve(
        offlineDatabase.records
          .where('[userId+resourceType]')
          .equals([userId, 'farms'])
          .toArray(),
      )
      : Promise.resolve([]),
    [userId],
  );

  const farms = useMemo(() => (cachedFarms ?? [])
    .map((record) => ({
      id: record.recordId,
      name: String(record.payload.name ?? '').trim(),
    }))
    .filter((farm) => farm.name.length > 0)
    .sort((left, right) => left.name.localeCompare(right.name, 'es', { sensitivity: 'base' })),
  [cachedFarms]);

  const activeFarm = farms.find((farm) => farm.id === selectedFarmId) ?? farms[0] ?? null;
  const farmsError = farmLoadState
    && farmLoadState.userId === userId
    && farmLoadState.organizationId === organizationId
    ? farmLoadState.error
    : null;
  const scope = useMemo(() => userId && organizationId && activeFarm
    ? {
      userId,
      organizationId,
      farmId: activeFarm.id,
    }
    : null, [activeFarm, organizationId, userId]);
  const value = useMemo<FarmScopeValue>(() => ({
    farms,
    activeFarm,
    farmsError,
    setActiveFarmId: setSelectedFarmId,
    scope,
  }), [activeFarm, farms, farmsError, scope]);

  return <FarmScopeContext.Provider value={value}>{children}</FarmScopeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFarmScope(): FarmScopeValue {
  const context = useContext(FarmScopeContext);
  if (!context) throw new Error('useFarmScope debe usarse dentro de FarmScopeProvider');
  return context;
}
