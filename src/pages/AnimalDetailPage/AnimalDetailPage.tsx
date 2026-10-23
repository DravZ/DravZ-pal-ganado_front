import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimalHeader } from './components/AnimalHeader/AnimalHeader';
import { DataAndGenealogy } from './components/DataAndGenealogy/DataAndGenealogy';
import { WeightHistory } from './components/WeightHistory/WeightHistory';
import { EventHistory } from './components/EventHistory/EventHistory';
import styles from './AnimalDetailPage.module.css';

type ActiveTab = 'data' | 'weights' | 'events';

export const AnimalDetailPage: React.FC = () => {
  const { id = 'BR-1042' } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ActiveTab>('data');

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Encabezado Fijo del Animal con navegación */}
      <AnimalHeader animalId={id} />

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
      {activeTab === 'data' && <DataAndGenealogy animalId={id} />}
      {activeTab === 'weights' && <WeightHistory animalId={id} />}
      {activeTab === 'events' && <EventHistory />}
    </div>
  );
};

export default AnimalDetailPage;