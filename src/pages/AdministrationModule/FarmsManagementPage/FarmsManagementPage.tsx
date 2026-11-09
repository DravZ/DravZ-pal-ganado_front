import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../shared/ManagementPage.module.css';
import type { Farm } from '../../../types/database.types';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';
import FarmsHeader from './components/FarmsHeader/FarmsHeader';
import FarmsFilterBar from './components/FarmsFilterBar/FarmsFilterBar';
import FarmsTable from './components/FarmsTable/FarmsTable';
import FarmsLoadingState from './components/FarmsLoadingState/FarmsLoadingState';
import FarmsEmptyState from './components/FarmsEmptyState/FarmsEmptyState';
import FarmsErrorState from './components/FarmsErrorState/FarmsErrorState';

export type FarmPageState = 'LIST' | 'LOADING' | 'EMPTY' | 'ERROR';

export const FarmsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const [searchTerm, setSearchTerm] = useState('');
  const { records, isLoading, error, refresh } = useHatoCollection<Record<string, unknown>>(
    'farms',
    '/farms',
    scope,
  );
  const farmsList = useMemo(() => records.map((record): Farm => ({
    id: String(record.id ?? ''),
    organization_id: String(record.organization_id ?? scope?.organizationId ?? ''),
    name: String(record.name ?? ''),
    code: typeof record.code === 'string' ? record.code : undefined,
    state: typeof record.state === 'string' ? record.state : undefined,
    municipality: typeof record.municipality === 'string' ? record.municipality : undefined,
    locality: typeof record.locality === 'string' ? record.locality : undefined,
    address: typeof record.address === 'string' ? record.address : undefined,
    hectares: Number(record.hectares ?? record.total_area_hectares ?? 0) || undefined,
    status: String(record.status ?? 'inactive'),
    created_at: String(record.created_at ?? ''),
  })), [records, scope?.organizationId]);

  const filteredFarms = useMemo(() => farmsList.filter((farm) => {
    const query = searchTerm.toLowerCase();
    return farm.name.toLowerCase().includes(query)
      || Boolean(farm.code?.toLowerCase().includes(query))
      || Boolean(farm.municipality?.toLowerCase().includes(query));
  }), [farmsList, searchTerm]);

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <FarmsHeader onCreateFarm={() => navigate('/fincas/nueva')} />
      {error && <p role="alert">{error}. Se muestran los datos locales disponibles.</p>}
      {isLoading ? <FarmsLoadingState /> : farmsList.length === 0 ? (
        error ? <FarmsErrorState onRetry={() => void refresh()} /> : (
          <FarmsEmptyState onCreateFarm={() => navigate('/fincas/nueva')} />
        )
      ) : (
        <>
          <FarmsFilterBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <FarmsTable
            farms={filteredFarms}
            onFarmClick={(farm) => navigate(`/fincas/${farm.id}`)}
          />
        </>
      )}
    </div>
  );
};

export default FarmsManagementPage;
