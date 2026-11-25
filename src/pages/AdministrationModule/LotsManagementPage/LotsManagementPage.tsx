import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Beef, ClipboardList, History, Pencil, Plus } from 'lucide-react';
import styles from './LotsManagementPage.module.css';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';
import LotFormModal, { type LotFormValues } from './components/LotFormModal/LotFormModal';
import TransferLotModal, {
  type TransferPaddockOption,
} from './components/TransferLotModal/TransferLotModal';
import LotHistoryModal from './components/LotHistoryModal/LotHistoryModal';

type HatoRecord = Record<string, unknown>;

const text = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const numberValue = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isActive = (record: HatoRecord): boolean =>
  text(record.status || 'active').toLowerCase() === 'active';

const formatDate = (value: unknown): string => {
  const raw = text(value);
  if (!raw) return '—';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 10);
  return parsed.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface PaddockSummary {
  id: string;
  name: string;
  code: string;
  capacity: number;
  occupancy: number;
  available: number | null;
  percentage: number | null;
}

export const LotsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedPaddockId = searchParams.get('potrero') ?? '';
  const [createOpen, setCreateOpen] = useState(false);
  const [createPaddockId, setCreatePaddockId] = useState<string | undefined>(undefined);
  const [editingLot, setEditingLot] = useState<LotFormValues | null>(null);
  const [transferLot, setTransferLot] = useState<HatoRecord | null>(null);
  const [historyLot, setHistoryLot] = useState<HatoRecord | null>(null);

  const { records: rawLots, isLoading, error } = useHatoCollection<HatoRecord>('lots', '/lots', scope);
  const { records: rawPaddocks } = useHatoCollection<HatoRecord>('paddocks', '/paddocks', scope);
  const { records: animals } = useHatoCollection<HatoRecord>('animals', '/animals', scope);

  const activeAnimals = useMemo(() => animals.filter(isActive), [animals]);

  const animalCountByLot = useMemo(() => {
    const counts = new Map<string, number>();
    for (const animal of activeAnimals) {
      const lotId = text(animal.lot_id);
      if (!lotId) continue;
      counts.set(lotId, (counts.get(lotId) ?? 0) + 1);
    }
    return counts;
  }, [activeAnimals]);

  const occupancyByPaddock = useMemo(() => {
    const counts = new Map<string, number>();
    for (const animal of activeAnimals) {
      const paddockId = text(animal.paddock_id);
      if (!paddockId) continue;
      counts.set(paddockId, (counts.get(paddockId) ?? 0) + 1);
    }
    return counts;
  }, [activeAnimals]);

  const paddockOptions = useMemo(
    () => rawPaddocks.map((paddock) => ({
      id: text(paddock.id),
      name: text(paddock.name),
    })),
    [rawPaddocks],
  );

  const paddockSummaries = useMemo<PaddockSummary[]>(
    () => rawPaddocks.map((paddock) => {
      const id = text(paddock.id);
      const capacity = numberValue(paddock.capacity);
      const occupancy = occupancyByPaddock.get(id) ?? 0;
      return {
        id,
        name: text(paddock.name),
        code: text(paddock.code),
        capacity,
        occupancy,
        available: capacity > 0 ? Math.max(0, capacity - occupancy) : null,
        percentage: capacity > 0 ? Math.min(100, Math.round(occupancy / capacity * 100)) : null,
      };
    }),
    [occupancyByPaddock, rawPaddocks],
  );

  const transferPaddockOptions = useMemo<TransferPaddockOption[]>(
    () => paddockSummaries.map((summary) => ({
      id: summary.id,
      name: summary.name,
      capacity: summary.capacity,
      currentAnimals: summary.occupancy,
    })),
    [paddockSummaries],
  );

  const lotsByPaddock = useMemo(() => {
    const grouped = new Map<string, HatoRecord[]>();
    for (const lot of rawLots) {
      const paddockId = text(lot.current_paddock_id);
      const bucket = grouped.get(paddockId) ?? [];
      bucket.push(lot);
      grouped.set(paddockId, bucket);
    }
    return grouped;
  }, [rawLots]);

  const totalAnimalsInLots = useMemo(
    () => rawLots.reduce((total, lot) => total + (animalCountByLot.get(text(lot.id)) ?? 0), 0),
    [animalCountByLot, rawLots],
  );

  const visiblePaddocks = focusedPaddockId
    ? paddockSummaries.filter((paddock) => paddock.id === focusedPaddockId)
    : paddockSummaries;

  const openCreate = (paddockId?: string) => {
    setCreatePaddockId(paddockId);
    setCreateOpen(true);
  };

  const renderLotRow = (lot: HatoRecord) => {
    const lotId = text(lot.id);
    const lotName = text(lot.name) || 'Lote sin nombre';
    const status = text(lot.status || 'active').toLowerCase();
    const animalCount = animalCountByLot.get(lotId) ?? 0;
    return (
      <tr key={lotId}>
        <td>
          <div className={styles.lotName}>{lotName}</div>
          {text(lot.code) && <div className={styles.lotCode}>{text(lot.code)}</div>}
        </td>
        <td>{text(lot.lot_type) || '—'}</td>
        <td className="fw-bold">{animalCount}</td>
        <td>
          <span className={`${styles.statusBadge} ${status === 'active' ? styles.statusActive : styles.statusInactive}`}>
            {status === 'active' ? 'Activo' : 'Archivado'}
          </span>
        </td>
        <td>{formatDate(lot.created_at)}</td>
        <td>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => navigate(`/hato/animales?lote=${encodeURIComponent(lotId)}`)}
            >
              <Beef size={14} />
              Animales
            </button>
            <button type="button" className={styles.actionBtn} onClick={() => setHistoryLot(lot)}>
              <History size={14} />
              Historial
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setTransferLot(lot)}
            >
              <ArrowLeftRight size={14} />
              Trasladar
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setEditingLot({
                id: lotId,
                name: lotName,
                code: text(lot.code),
                lotType: text(lot.lot_type),
                purpose: text(lot.purpose),
                status: text(lot.status || 'active'),
                startDate: text(lot.start_date),
                endDate: text(lot.end_date),
                notes: text(lot.notes),
                currentPaddockId: text(lot.current_paddock_id),
              })}
            >
              <Pencil size={14} />
              Editar
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>ADMINISTRACIÓN · LOTS</span>
          <h1 className={styles.pageTitle}>Gestión de lotes</h1>
          <p className={styles.pageSubtitle}>
            Organiza los lotes por potrero, revisa su ocupación y traslada lotes completos entre
            potreros de la finca.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => openCreate()}
          disabled={!scope || paddockOptions.length === 0}
        >
          <Plus size={18} />
          <span>Nuevo lote</span>
        </button>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Lotes registrados</span>
          <div className={styles.kpiValue}>{rawLots.length}</div>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Animales en lotes</span>
          <div className={styles.kpiValue}>{totalAnimalsInLots}</div>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Potreros</span>
          <div className={styles.kpiValue}>{rawPaddocks.length}</div>
        </div>
      </div>

      {focusedPaddockId && (
        <button
          type="button"
          className={styles.actionBtn + ' mb-3'}
          onClick={() => setSearchParams({})}
        >
          Ver todos los potreros
        </button>
      )}

      {error && <p className={styles.errorText} role="alert">{error}</p>}
      {isLoading && <p role="status">Cargando lotes guardados en este dispositivo…</p>}

      {!isLoading && visiblePaddocks.length === 0 && (
        <div className={styles.emptyPage}>
          <p className="mb-2">Aún no hay potreros registrados en esta finca.</p>
          <p className="mb-0">
            Crea potreros en Administración &gt; Potreros para poder organizar tus lotes.
          </p>
        </div>
      )}

      {visiblePaddocks.map((paddock) => {
        const lots = lotsByPaddock.get(paddock.id) ?? [];
        return (
          <section key={paddock.id} className={styles.paddockSection}>
            <div className={styles.paddockHeader}>
              <div>
                <h2 className={styles.paddockName}>{paddock.name || 'Potrero sin nombre'}</h2>
                {paddock.code && <span className={styles.paddockCode}>{paddock.code}</span>}
              </div>
              <div className={styles.paddockMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Ocupación</span>
                  <span className={styles.metricValue}>
                    {paddock.occupancy} / {paddock.capacity > 0 ? paddock.capacity : '∞'}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Disponible</span>
                  <span className={styles.metricValue}>
                    {paddock.available === null ? 'Sin límite' : paddock.available}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>% ocupación</span>
                  <span className={styles.metricValue}>
                    {paddock.percentage === null ? '—' : `${paddock.percentage}%`}
                  </span>
                </div>
                <div className={styles.progressBarBg} aria-hidden="true">
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${paddock.percentage ?? 0}%` }}
                  />
                </div>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => navigate(`/admin/estructura?potrero=${encodeURIComponent(paddock.id)}`)}
                >
                  <ClipboardList size={14} />
                  Ver potrero
                </button>
              </div>
            </div>

            {lots.length === 0 ? (
              <div className={styles.emptySection}>
                Este potrero todavía no tiene lotes asignados.
                <button
                  type="button"
                  className={styles.actionBtn + ' ms-2'}
                  onClick={() => openCreate(paddock.id)}
                >
                  <Plus size={14} />
                  Crear lote aquí
                </button>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Lote</th>
                      <th>Categoría</th>
                      <th>Animales</th>
                      <th>Estado</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>{lots.map(renderLotRow)}</tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      {createOpen && (
        <LotFormModal
          mode="create"
          paddocks={paddockOptions}
          defaultPaddockId={createPaddockId}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editingLot && (
        <LotFormModal
          mode="edit"
          lot={editingLot}
          paddocks={paddockOptions}
          onClose={() => setEditingLot(null)}
        />
      )}
      {transferLot && (
        <TransferLotModal
          lot={{
            id: text(transferLot.id),
            name: text(transferLot.name) || 'Lote',
            currentPaddockId: text(transferLot.current_paddock_id),
            currentPaddockName: text(transferLot.current_paddock_name),
            animalCount: animalCountByLot.get(text(transferLot.id)) ?? 0,
          }}
          paddocks={transferPaddockOptions}
          onClose={() => setTransferLot(null)}
        />
      )}
      {historyLot && (
        <LotHistoryModal
          lot={{ id: text(historyLot.id), name: text(historyLot.name) || 'Lote' }}
          onClose={() => setHistoryLot(null)}
        />
      )}
    </div>
  );
};

export default LotsManagementPage;
