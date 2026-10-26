import React, { useState } from 'react';
import styles from './CreatePaddockModal.module.css';
import { X, Check, WifiOff } from 'lucide-react';
import type { Paddock, SyncQueueEntry } from '../../../../../types/database.types';

interface CreatePaddockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePaddockModal: React.FC<CreatePaddockModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('POT-05');
  const [hectares, setHectares] = useState('0');
  const [capacity, setCapacity] = useState('0');
  const [forageType, setForageType] = useState('Brachiaria brizantha');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paddockId = crypto.randomUUID();

    const paddockPayload: Paddock = {
      id: paddockId,
      farm_id: 'farm-1',
      name,
      code,
      hectares: parseFloat(hectares) || 0,
      capacity: parseFloat(capacity) || 0,
      forage_type: forageType,
      status: 'active'
    };

    const syncEntry: SyncQueueEntry<Paddock> = {
      id: crypto.randomUUID(),
      entity_name: 'paddocks',
      entity_id: paddockId,
      operation_type: 'CREATE',
      payload: paddockPayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Crear Potrero:', paddockPayload);
    console.log('[Sync Queue]:', syncEntry);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.dbLabel}>PADDOCKS · NUEVO REGISTRO</span>
            <h2 className={styles.title}>Nuevo potrero</h2>
            <p className={styles.subtitle}>
              Registra el área productiva y su capacidad estimada.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className={styles.label}>Nombre (paddocks.name)</label>
              <input
                type="text"
                placeholder="Ej. Potrero Las Palmas"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Código (paddocks.code)</label>
              <input
                type="text"
                className={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Hectáreas (paddocks.hectares)</label>
              <div className={styles.inputWithSuffix}>
                <input
                  type="number"
                  className={styles.inputBare}
                  value={hectares}
                  onChange={(e) => setHectares(e.target.value)}
                />
                <span className={styles.suffix}>ha</span>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Capacidad (paddocks.capacity)</label>
              <div className={styles.inputWithSuffix}>
                <input
                  type="number"
                  className={styles.inputBare}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
                <span className={styles.suffix}>animales</span>
              </div>
            </div>

            <div className="col-12">
              <label className={styles.label}>Tipo de forraje (paddocks.forage_type)</label>
              <select
                className={styles.select}
                value={forageType}
                onChange={(e) => setForageType(e.target.value)}
              >
                <option value="Brachiaria brizantha">Brachiaria brizantha</option>
                <option value="Pasto estrella">Pasto estrella</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Guinea">Guinea</option>
              </select>
            </div>
          </div>

          <div className={styles.offlineBanner}>
            <WifiOff size={18} className={styles.offlineIcon} />
            <div>
              <div className={styles.offlineTitle}>Disponible sin conexión</div>
              <div className={styles.offlineSubtitle}>
                Si no hay señal, se guardará en sync_queue.
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn}>
              <Check size={18} />
              <span>Guardar registro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaddockModal;