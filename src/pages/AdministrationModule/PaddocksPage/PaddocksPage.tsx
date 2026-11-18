import React, { useMemo, useState } from 'react';
import styles from './PaddocksPage.module.css';
import { Plus, Box, Beef, Syringe } from 'lucide-react';
import type { Paddock } from '../../../types/database.types';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';
import PaddockCard from './components/PaddockCard/PaddockCard';
import PaddocksTable from './components/PaddocksTable/PaddocksTable';
import CreatePaddockModal from './components/CreatePaddockModal/CreatePaddockModal';
import EditPaddockModal from './components/EditPaddockModal/EditPaddockModal';

export type PaddockUI = Paddock & {
  current_animals: number;
  occupancy_percentage: number;
  badge_status: 'En uso' | 'Descanso';
};

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const PaddocksPage: React.FC = () => {
  const { scope } = useFarmScope();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaddock, setEditingPaddock] = useState<PaddockUI | null>(null);
  const { records: rawPaddocks, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'paddocks',
    '/paddocks',
    scope,
  );
  const { records: animals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const paddocks = useMemo(() => rawPaddocks.map((record): PaddockUI => {
    const id = String(record.id ?? '');
    const currentAnimals = animals.filter((animal) =>
      animal.current_paddock_id === id
      && !['sold', 'deceased'].includes(String(animal.status ?? '').toLowerCase()),
    ).length;
    const capacity = numberValue(record.capacity ?? record.capacity_animal_units);
    const status = String(record.status ?? '').toLowerCase();
    return {
      id,
      farm_id: String(record.farm_id ?? scope?.farmId ?? ''),
      name: String(record.name ?? ''),
      code: typeof record.code === 'string' ? record.code : undefined,
      forage_type: typeof record.forage_type === 'string' ? record.forage_type : undefined,
      hectares: numberValue(record.hectares ?? record.area_hectares),
      capacity,
      current_animals: currentAnimals,
      occupancy_percentage: capacity > 0 ? Math.min(100, Math.round(currentAnimals / capacity * 100)) : 0,
      badge_status: status.includes('rest') || currentAnimals === 0 ? 'Descanso' : 'En uso',
      status: String(record.status ?? 'available'),
    };
  }), [animals, rawPaddocks, scope?.farmId]);

  const totalHectares = paddocks.reduce((total, paddock) => total + (paddock.hectares ?? 0), 0);
  const totalAnimals = paddocks.reduce((total, paddock) => total + paddock.current_animals, 0);
  const totalCapacity = paddocks.reduce((total, paddock) => total + (paddock.capacity ?? 0), 0);
  const restingCount = paddocks.filter((paddock) => paddock.badge_status === 'Descanso').length;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
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
          disabled={!scope}
        >
          <Plus size={18} />
          <span>Nuevo potrero</span>
        </button>
      </div>

      <div className={styles.kpiCardContainer}>
        <div className="row g-0 align-items-center">
          <div className="col-12 col-md-3 p-3 border-end d-flex align-items-center gap-3">
            <div className={styles.kpiIcon}><Box size={20} color="#1e4b27" /></div>
            <div><span className={styles.kpiLabel}>ÁREA TOTAL</span><div className={styles.kpiValue}>{totalHectares} ha</div></div>
          </div>
          <div className="col-12 col-md-3 p-3 border-end d-flex align-items-center gap-3">
            <div className={styles.kpiIcon}><Beef size={20} color="#1e4b27" /></div>
            <div><span className={styles.kpiLabel}>OCUPACIÓN</span><div className={styles.kpiValue}>{totalAnimals} / {totalCapacity}</div></div>
          </div>
          <div className="col-12 col-md-3 p-3 border-end d-flex align-items-center gap-3">
            <div className={styles.kpiIcon}><Syringe size={20} color="#1e4b27" /></div>
            <div><span className={styles.kpiLabel}>EN DESCANSO</span><div className={styles.kpiValue}>{restingCount} potreros</div></div>
          </div>
          <div className="col-12 col-md-3 p-3 d-flex justify-content-end">
            <div className={styles.viewModeSelector}>
              <button type="button" className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`} onClick={() => setViewMode('grid')}>Cuadrícula</button>
              <button type="button" className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeView : ''}`} onClick={() => setViewMode('list')}>Lista</button>
            </div>
          </div>
        </div>
      </div>

      {error && <p role="alert">{error}</p>}
      {isLoading ? <p>Cargando potreros guardados en este dispositivo…</p> : paddocks.length === 0 ? (
        <p>No hay potreros registrados para esta finca.</p>
      ) : viewMode === 'grid' ? (
        <div className="row g-4">
          {paddocks.map((paddock) => <div key={paddock.id} className="col-12 col-md-6"><PaddockCard paddock={paddock} onEdit={setEditingPaddock} /></div>)}
        </div>
      ) : <PaddocksTable paddocks={paddocks} onEdit={setEditingPaddock} />}

      <CreatePaddockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {editingPaddock && (
        <EditPaddockModal
          paddock={editingPaddock}
          onClose={() => setEditingPaddock(null)}
        />
      )}
    </div>
  );
};

export default PaddocksPage;
