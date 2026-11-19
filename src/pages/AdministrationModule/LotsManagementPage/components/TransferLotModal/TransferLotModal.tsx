import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import styles from '../../LotsManagementPage.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import useNotification from '../../../../../hooks/useNotification';
import { queueHatoWrite } from '../../../../../services/hatoDataService';

export interface TransferPaddockOption {
  id: string;
  name: string;
  capacity: number;
  currentAnimals: number;
}

interface TransferLotModalProps {
  lot: {
    id: string;
    name: string;
    currentPaddockId: string;
    currentPaddockName: string;
    animalCount: number;
  };
  paddocks: TransferPaddockOption[];
  onClose: () => void;
  onSaved?: () => void;
}

export const TransferLotModal: React.FC<TransferLotModalProps> = ({
  lot,
  paddocks,
  onClose,
  onSaved,
}) => {
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const [destinationId, setDestinationId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destinations = paddocks.filter((paddock) => paddock.id !== lot.currentPaddockId);
  const destination = destinations.find((paddock) => paddock.id === destinationId) ?? null;
  const resultingOccupancy = destination ? destination.currentAnimals + lot.animalCount : 0;
  const exceedsCapacity = Boolean(
    destination && destination.capacity > 0 && resultingOccupancy > destination.capacity,
  );
  const destinationPercentage = destination && destination.capacity > 0
    ? Math.min(100, Math.round(resultingOccupancy / destination.capacity * 100))
    : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!scope) {
      setError('Selecciona una finca autorizada antes de trasladar el lote.');
      return;
    }
    if (!destination) {
      setError('Selecciona el potrero destino.');
      return;
    }
    if (destination.id === lot.currentPaddockId) {
      setError('El lote ya se encuentra en ese potrero.');
      return;
    }
    if (exceedsCapacity) {
      setError('El potrero destino no tiene capacidad suficiente para este lote.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const result = await queueHatoWrite(scope, 'lots', 'UPDATE', {
        farm_id: scope.farmId,
        name: lot.name,
        current_paddock_id: destination.id,
        movement_notes: notes.trim() || undefined,
      }, lot.id);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Traslado guardado para sincronizar' : 'Lote trasladado',
        message: result.pending
          ? 'El traslado quedó en la cola local y se enviará al recuperar la conexión.'
          : `El lote ${lot.name} ahora está en ${destination.name}.`,
      });
      onSaved?.();
      onClose();
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo trasladar el lote.';
      setError(message);
      showNotification({ type: 'error', title: 'No se pudo trasladar el lote', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalLabel}>LOTS · TRASLADO DE LOTE</span>
            <h2 className={styles.modalTitle}>Trasladar {lot.name}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.infoBox}>
              <div className="d-flex align-items-center gap-2 fw-bold">
                <span>{lot.currentPaddockName || 'Sin potrero'}</span>
                <ArrowRight size={16} />
                <span>{destination?.name ?? 'Selecciona destino'}</span>
              </div>
              <div className={styles.historyMeta}>
                {lot.animalCount} animales activos en el lote
              </div>
            </div>

            <div className="mt-3">
              <label className={styles.fieldLabel} htmlFor="transfer-destination">Potrero destino</label>
              <select
                id="transfer-destination"
                className={styles.select}
                value={destinationId}
                onChange={(event) => {
                  setDestinationId(event.target.value);
                  setError(null);
                }}
                required
              >
                <option value="">Selecciona un potrero</option>
                {destinations.map((paddock) => (
                  <option key={paddock.id} value={paddock.id}>{paddock.name}</option>
                ))}
              </select>
              {destinations.length === 0 && (
                <div className={styles.historyMeta}>
                  No hay otro potrero disponible en esta finca para trasladar el lote.
                </div>
              )}
            </div>

            {destination && (
              <div className={styles.infoBox + ' mt-3'}>
                <div className={styles.infoGrid}>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Capacidad máxima</span>
                    <span className={styles.metricValue}>
                      {destination.capacity > 0 ? destination.capacity : 'Sin límite'}
                    </span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Ocupación actual</span>
                    <span className={styles.metricValue}>{destination.currentAnimals}</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Ocupación resultante</span>
                    <span className={styles.metricValue}>{resultingOccupancy}</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>% ocupación</span>
                    <span className={styles.metricValue}>
                      {destinationPercentage === null ? '—' : `${destinationPercentage}%`}
                    </span>
                  </div>
                </div>
                {exceedsCapacity && (
                  <p className={styles.errorText + ' mt-2 mb-0'} role="alert">
                    El potrero destino supera su capacidad máxima de {destination.capacity} animales.
                  </p>
                )}
              </div>
            )}

            <div className="mt-3">
              <label className={styles.fieldLabel} htmlFor="transfer-notes">Observaciones</label>
              <textarea
                id="transfer-notes"
                className={styles.textarea}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Motivo del traslado, condiciones del potrero, etc. (opcional)"
              />
            </div>

            {error && <p className={styles.errorText} role="alert">{error}</p>}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSaving || !scope || !destination || exceedsCapacity}
            >
              <Check size={18} />
              <span>{isSaving ? 'Trasladando…' : 'Confirmar traslado'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferLotModal;
