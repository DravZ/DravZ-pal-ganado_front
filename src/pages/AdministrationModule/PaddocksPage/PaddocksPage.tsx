import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PaddocksPage.module.css';
import { Plus, Box, Beef, Syringe } from 'lucide-react';
import type { Paddock } from '../../../types/database.types';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';
import PaddockCard from './components/PaddockCard/PaddockCard';
import PaddocksTable from './components/PaddocksTable/PaddocksTable';
import PaddockDetail, { type PaddockDetailLot } from './components/PaddockDetail/PaddockDetail';
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

const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export const PaddocksPage: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaddock, setEditingPaddock] = useState<PaddockUI | null>(null);
  // El potrero enfocado vive en la URL para poder enlazarlo desde Gestión de lotes
  // (por ejemplo /admin/estructura?potrero=<id>).
  const focusedPaddockId = searchParams.get('potrero') ?? '';

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
  const { records: rawLots } = useHatoCollection<Record<string, unknown>>(
    'lots',
    '/lots',
    scope,
  );

  const paddocks = useMemo(() => rawPaddocks.map((record): PaddockUI => {
    const id = String(record.id ?? '');
    const currentAnimals = animals.filter((animal) =>
      animal.paddock_id === id
      && String(animal.status ?? 'active').toLowerCase() === 'active',
    ).length;
    const capacity = numberValue(record.capacity);
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

  const animalCountByLot = useMemo(() => {
    const counts = new Map<string, number>();
    for (const animal of animals) {
      if (String(animal.status ?? 'active').toLowerCase() !== 'active') continue;
      const lotId = text(animal.lot_id);
      if (!lotId) continue;
      counts.set(lotId, (counts.get(lotId) ?? 0) + 1);
    }
    return counts;
  }, [animals]);

  const lotsByPaddock = useMemo(() => {
    const grouped = new Map<string, PaddockDetailLot[]>();
    for (const lot of rawLots) {
      const paddockId = text(lot.current_paddock_id);
      const bucket = grouped.get(paddockId) ?? [];
      const lotId = text(lot.id);
      bucket.push({
        id: lotId,
        name: text(lot.name),
        code: text(lot.code),
        category: text(lot.lot_type),
        animalCount: animalCountByLot.get(lotId) ?? 0,
      });
      grouped.set(paddockId, bucket);
    }
    return grouped;
  }, [animalCountByLot, rawLots]);

  const focusedPaddock = paddocks.find((paddock) => paddock.id === focusedPaddockId) ?? null;

  const handleOpenPaddock = (paddock: PaddockUI) => {
    setSearchParams({ potrero: paddock.id });
  };

  const handleCloseDetail = () => {
    setSearchParams({});
  };

  const handleOpenLots = (paddockId: string) => {
    navigate(`/admin/lotes?potrero=${encodeURIComponent(paddockId)}`);
  };

  const handleOpenAnimals = (paddockId: string) => {
    navigate(`/hato/animales?potrero=${encodeURIComponent(paddockId)}`);
  };

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

      {focusedPaddock && (
        <PaddockDetail
          paddock={{
            id: focusedPaddock.id,
            name: focusedPaddock.name,
            code: text(focusedPaddock.code),
            forageType: text(focusedPaddock.forage_type),
            hectares: focusedPaddock.hectares ?? 0,
            capacity: focusedPaddock.capacity ?? 0,
            occupancy: focusedPaddock.current_animals,
            available: (focusedPaddock.capacity ?? 0) > 0
              ? Math.max(0, (focusedPaddock.capacity ?? 0) - focusedPaddock.current_animals)
              : null,
            percentage: (focusedPaddock.capacity ?? 0) > 0 ? focusedPaddock.occupancy_percentage : null,
            status: focusedPaddock.status,
          }}
          lots={lotsByPaddock.get(focusedPaddock.id) ?? []}
          onClose={handleCloseDetail}
          onOpenLots={handleOpenLots}
          onOpenAnimals={handleOpenAnimals}
        />
      )}

      {error && <p role="alert">{error}</p>}
      {isLoading ? <p>Cargando potreros guardados en este dispositivo…</p> : paddocks.length === 0 ? (
        <p>No hay potreros registrados para esta finca.</p>
      ) : viewMode === 'grid' ? (
        <div className="row g-4">
          {paddocks.map((paddock) => <div key={paddock.id} className="col-12 col-md-6"><PaddockCard paddock={paddock} onEdit={setEditingPaddock} onOpen={handleOpenPaddock} /></div>)}
        </div>
      ) : <PaddocksTable paddocks={paddocks} onEdit={setEditingPaddock} onOpen={handleOpenPaddock} />}

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
