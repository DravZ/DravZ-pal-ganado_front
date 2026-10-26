import React, { useState } from 'react';
import styles from './PaddocksPage.module.css';
import { Plus, Box, Beef, Syringe, ChevronRight, LayoutGrid, List } from 'lucide-react';
import type { Paddock } from '../../../types/database.types';
import PaddockCard from './components/PaddockCard/PaddockCard';
import PaddocksTable from './components/PaddocksTable/PaddocksTable';
import CreatePaddockModal from './components/CreatePaddockModal/CreatePaddockModal';

export type PaddockUI = Paddock & {
  current_animals: number;
  occupancy_percentage: number;
  badge_status: 'En uso' | 'Descanso';
};

const MOCK_PADDOCKS: PaddockUI[] = [
  {
    id: 'pot-1',
    farm_id: 'farm-1',
    code: 'POT-01',
    name: 'Potrero Norte',
    forage_type: 'Brachiaria brizantha',
    hectares: 48,
    capacity: 72,
    current_animals: 58,
    occupancy_percentage: 81,
    badge_status: 'En uso',
    status: 'active'
  },
  {
    id: 'pot-2',
    farm_id: 'farm-1',
    code: 'POT-02',
    name: 'La Quebrada',
    forage_type: 'Pasto estrella',
    hectares: 31.5,
    capacity: 46,
    current_animals: 41,
    occupancy_percentage: 89,
    badge_status: 'En uso',
    status: 'active'
  },
  {
    id: 'pot-3',
    farm_id: 'farm-1',
    code: 'POT-03',
    name: 'El Descanso',
    forage_type: 'Mombasa',
    hectares: 26,
    capacity: 38,
    current_animals: 0,
    occupancy_percentage: 0,
    badge_status: 'Descanso',
    status: 'active'
  },
  {
    id: 'pot-4',
    farm_id: 'farm-1',
    code: 'POT-04',
    name: 'Loma Alta',
    forage_type: 'Guinea',
    hectares: 54,
    capacity: 81,
    current_animals: 63,
    occupancy_percentage: 78,
    badge_status: 'En uso',
    status: 'active'
  }
];

export const PaddocksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Totales dinámicos
  const totalHectares = MOCK_PADDOCKS.reduce((acc, p) => acc + (p.hectares || 0), 0);
  const totalAnimals = MOCK_PADDOCKS.reduce((acc, p) => acc + p.current_animals, 0);
  const totalCapacity = MOCK_PADDOCKS.reduce((acc, p) => acc + (p.capacity || 0), 0);
  const restingCount = MOCK_PADDOCKS.filter((p) => p.badge_status === 'Descanso').length;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* ENCABEZADO */}
      <div className={styles.headerFlex}>
        <div>
          <span className={styles.sectionSubtitle}>INFRAESTRUCTURA · PADDOCKS</span>
          <h1 className={styles.sectionTitle}>Potreros</h1>
          <p className={styles.sectionDescription}>
            Administra capacidad, área y tipo de forraje de cada potrero.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          <span>Nuevo potrero</span>
        </button>
      </div>

      {/* TARJETA KPI Y SELECTOR DE VISTA */}
      <div className={styles.kpiCardContainer}>
        <div className="row g-0 align-items-center">
          <div className="col-12 col-md-3 p-3 border-end d-flex align-items-center gap-3">
            <div className={styles.kpiIcon}>
              <Box size={20} color="#1e4b27" />
            </div>
            <div>
              <span className={styles.kpiLabel}>ÁREA TOTAL</span>
              <div className={styles.kpiValue}>{totalHectares} ha</div>
            </div>
          </div>

          <div className="col-12 col-md-3 p-3 border-end d-flex align-items-center gap-3">
            <div className={styles.kpiIcon}>
              <Beef size={20} color="#1e4b27" />
            </div>
            <div>
              <span className={styles.kpiLabel}>OCUPACIÓN</span>
              <div className={styles.kpiValue}>
                {totalAnimals} / {totalCapacity}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-3 p-3 border-end d-flex align-items-center gap-3">
            <div className={styles.kpiIcon}>
              <Syringe size={20} color="#1e4b27" />
            </div>
            <div>
              <span className={styles.kpiLabel}>EN DESCANSO</span>
              <div className={styles.kpiValue}>{restingCount} potrero</div>
            </div>
          </div>

          <div className="col-12 col-md-3 p-3 d-flex justify-content-end">
            <div className={styles.viewModeSelector}>
              <button
                type="button"
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Cuadrícula
              </button>
              <button
                type="button"
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeView : ''}`}
                onClick={() => setViewMode('list')}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VISTA DE CONTENIDO */}
      {viewMode === 'grid' ? (
        <div className="row g-4">
          {MOCK_PADDOCKS.map((paddock) => (
            <div key={paddock.id} className="col-12 col-md-6">
              <PaddockCard paddock={paddock} />
            </div>
          ))}
        </div>
      ) : (
        <PaddocksTable paddocks={MOCK_PADDOCKS} />
      )}

      {/* MODAL CREAR POTRERO */}
      <CreatePaddockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PaddocksPage;