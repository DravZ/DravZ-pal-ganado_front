import React from 'react';
import { ArrowRight, Beef, ClipboardList, Layers, X } from 'lucide-react';
import styles from './PaddockDetail.module.css';

export interface PaddockDetailLot {
  id: string;
  name: string;
  code: string;
  category: string;
  animalCount: number;
}

interface PaddockDetailProps {
  paddock: {
    id: string;
    name: string;
    code: string;
    forageType: string;
    hectares: number;
    capacity: number;
    occupancy: number;
    available: number | null;
    percentage: number | null;
    status: string;
  };
  lots: PaddockDetailLot[];
  onClose: () => void;
  onOpenLots: (paddockId: string) => void;
  onOpenAnimals: (paddockId: string) => void;
}

export const PaddockDetail: React.FC<PaddockDetailProps> = ({
  paddock,
  lots,
  onClose,
  onOpenLots,
  onOpenAnimals,
}) => {
  const totalAnimals = lots.reduce((total, lot) => total + lot.animalCount, 0);

  return (
    <section className={styles.panel} aria-label={`Detalle del potrero ${paddock.name}`}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>POTRERO · DETALLE</span>
          <h2 className={styles.title}>{paddock.name || 'Potrero sin nombre'}</h2>
          <span className={styles.subtitle}>
            {paddock.code || 'Sin código'}
            {paddock.forageType ? ` · ${paddock.forageType}` : ''}
          </span>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar detalle">
          <X size={20} />
        </button>
      </header>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Superficie</span>
          <span className={styles.metricValue}>{paddock.hectares} ha</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Capacidad máxima</span>
          <span className={styles.metricValue}>
            {paddock.capacity > 0 ? `${paddock.capacity} animales` : 'Sin límite'}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Ocupación</span>
          <span className={styles.metricValue}>{paddock.occupancy} animales</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Disponible</span>
          <span className={styles.metricValue}>
            {paddock.available === null ? 'Sin límite' : `${paddock.available} animales`}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>% ocupación</span>
          <span className={styles.metricValue}>
            {paddock.percentage === null ? '—' : `${paddock.percentage}%`}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Lotes asignados</span>
          <span className={styles.metricValue}>{lots.length}</span>
        </div>
      </div>

      <div className={styles.progressBarBg} aria-hidden="true">
        <div
          className={styles.progressBarFill}
          style={{ width: `${paddock.percentage ?? 0}%` }}
        />
      </div>

      <div className={styles.lotsBlock}>
        <div className={styles.lotsHeader}>
          <h3 className={styles.lotsTitle}>
            <Layers size={16} /> Lotes en este potrero
          </h3>
          <span className={styles.lotsTotal}>{totalAnimals} animales activos</span>
        </div>

        {lots.length === 0 ? (
          <p className={styles.emptyText}>Este potrero todavía no tiene lotes asignados.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Categoría</th>
                  <th>Animales</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id}>
                    <td>
                      <div className={styles.lotName}>{lot.name || 'Lote sin nombre'}</div>
                      {lot.code && <div className={styles.lotCode}>{lot.code}</div>}
                    </td>
                    <td>{lot.category || '—'}</td>
                    <td className="fw-bold">{lot.animalCount}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => onOpenAnimals(lot.id)}
                      >
                        <Beef size={14} />
                        Ver animales
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => onOpenAnimals(paddock.id)}
        >
          <Beef size={16} />
          Ver animales del potrero
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => onOpenLots(paddock.id)}
        >
          <ClipboardList size={16} />
          Gestionar lotes
          <ArrowRight size={15} />
        </button>
      </footer>
    </section>
  );
};

export default PaddockDetail;
