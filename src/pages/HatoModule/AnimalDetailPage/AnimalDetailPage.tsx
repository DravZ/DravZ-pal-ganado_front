import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimalHeader } from './components/AnimalHeader/AnimalHeader';
import { DataAndGenealogy } from './components/DataAndGenealogy/DataAndGenealogy';
import { WeightHistory } from './components/WeightHistory/WeightHistory';
import { EventHistory } from './components/EventHistory/EventHistory';
import styles from './AnimalDetailPage.module.css';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection, useHatoRecord } from '../../../services/hatoDataService';

type ActiveTab = 'data' | 'weights' | 'events';

export const AnimalDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { scope } = useFarmScope();
  const { record: animal, isLoading, error } = useHatoRecord<Record<string, unknown>>(
    'animals',
    `/animals/${id}`,
    id,
    scope,
  );
  const { records: animals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('data');

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Encabezado Fijo del Animal con navegación */}
      {isLoading && <p role="status">Cargando expediente local…</p>}
      {error && <p role="alert">{error}</p>}
      <AnimalHeader animalId={id} animal={animal ?? {}} />

      {/* 2. Barra Superior de Pestañas (Tabs) */}
      <div className={styles.tabsCardHeader}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'data' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Datos y Genealogía
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'weights' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('weights')}
        >
          Historial de Pesos
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'events' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Historial de Eventos
        </button>
      </div>

      {/* 3. Vistas Contenedoras */}
      {activeTab === 'data' && (
        <DataAndGenealogy animalId={id} animal={animal ?? {}} animals={animals} />
      )}
      {activeTab === 'weights' && <WeightHistory animalId={id} />}
      {activeTab === 'events' && <EventHistory animalId={id} />}
    </div>
  );
};

export default AnimalDetailPage;