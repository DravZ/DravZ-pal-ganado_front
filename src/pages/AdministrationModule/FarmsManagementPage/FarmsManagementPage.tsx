import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FarmsManagementPage.module.css';
import type { Farm } from '../../../types/database.types';

// Subcomponentes
import FarmsHeader from './components/FarmsHeader/FarmsHeader';
import FarmsStateSelector from './components/FarmsStateSelector/FarmsStateSelector';
import FarmsFilterBar from './components/FarmsFilterBar/FarmsFilterBar';
import FarmsTable from './components/FarmsTable/FarmsTable';
import FarmsLoadingState from './components/FarmsLoadingState/FarmsLoadingState';
import FarmsEmptyState from './components/FarmsEmptyState/FarmsEmptyState';
import FarmsErrorState from './components/FarmsErrorState/FarmsErrorState';

export type FarmPageState = 'LIST' | 'LOADING' | 'EMPTY' | 'ERROR';

export const FarmsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<FarmPageState>('LIST');
  const [farmsList, setFarmsList] = useState<Farm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Petición / Simulación de Carga
  const fetchFarms = async () => {
    setPageState('LOADING');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockFarms: Farm[] = [
        {
          id: 'farm-1',
          organization_id: 'org-123',
          name: 'Finca Serra Verde',
          code: 'FIN-001',
          state: 'Antioquia',
          municipality: 'Puerto Berrío',
          locality: 'Vía Puerto Berrío, km 18',
          hectares: 159.5,
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: 'farm-2',
          organization_id: 'org-123',
          name: 'Finca El Porvenir',
          code: 'FIN-002',
          state: 'Córdoba',
          municipality: 'Montería',
          locality: 'Corregimiento El Retiro',
          hectares: 84.0,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ];

      setFarmsList(mockFarms);
      setPageState('LIST');
    } catch {
      setPageState('ERROR');
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  // Filtro en memoria
  const filteredFarms = useMemo(() => {
    return farmsList.filter((f) => {
      const query = searchTerm.toLowerCase();
      const matchName = f.name.toLowerCase().includes(query);
      const matchCode = f.code ? f.code.toLowerCase().includes(query) : false;
      const matchMuni = f.municipality
        ? f.municipality.toLowerCase().includes(query)
        : false;

      return matchName || matchCode || matchMuni;
    });
  }, [farmsList, searchTerm]);

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado */}
      <FarmsHeader onCreateFarm={() => navigate('/fincas/nueva')} />

      {/* Selector de Simulación de Estados */}
      <FarmsStateSelector
        currentState={pageState}
        onChangeState={(state) => {
          setPageState(state);
          if (state === 'LIST' && farmsList.length === 0) {
            fetchFarms();
          }
        }}
      />

      {/* RENDERIZADO DE ESTADOS */}
      {pageState === 'LOADING' && <FarmsLoadingState />}

      {pageState === 'ERROR' && <FarmsErrorState onRetry={fetchFarms} />}

      {pageState === 'EMPTY' && (
        <FarmsEmptyState onCreateFarm={() => navigate('/fincas/nueva')} />
      )}

      {pageState === 'LIST' && (
        <>
          <FarmsFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

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