import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import styles from '../../LotsManagementPage.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

interface LotHistoryModalProps {
  lot: { id: string; name: string };
  onClose: () => void;
}

const text = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const formatDate = (value: unknown): string => {
  const raw = text(value);
  if (!raw) return 'Sin fecha';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const LotHistoryModal: React.FC<LotHistoryModalProps> = ({ lot, onClose }) => {
  const { scope } = useFarmScope();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'lot_movements',
    '/lot-movements',
    scope,
  );

  const movements = records
    .filter((movement) => text(movement.lot_id) === lot.id)
    .sort((a, b) => text(b.movement_date).localeCompare(text(a.movement_date)));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalLabel}>LOTS · HISTORIAL DE TRASLADOS</span>
            <h2 className={styles.modalTitle}>Historial de {lot.name}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoading && <p role="status">Cargando historial…</p>}
          {error && <p className={styles.errorText} role="alert">{error}</p>}
          {!isLoading && movements.length === 0 && (
            <p className={styles.emptySection}>Este lote todavía no tiene traslados registrados.</p>
          )}
          <div className={styles.historyList}>
            {movements.map((movement) => (
              <div key={text(movement.id)} className={styles.historyItem}>
                <div className={`${styles.historyRoute} d-flex align-items-center gap-2 flex-wrap`}>
                  <span>{text(movement.origin_paddock_name) || 'Asignación inicial'}</span>
                  <ArrowRight size={15} />
                  <span>{text(movement.destination_paddock_name) || 'Sin potrero'}</span>
                </div>
                <div className={styles.historyMeta}>
                  {formatDate(movement.movement_date)} · {Number(movement.animal_count ?? 0)} animales
                  {text(movement.moved_by_name) ? ` · ${text(movement.moved_by_name)}` : ''}
                </div>
                {text(movement.notes) && (
                  <div className={styles.historyMeta}>{text(movement.notes)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default LotHistoryModal;
