import React, { useState } from 'react';
import styles from './RegisterFeedingModal.module.css';
import { X, CheckCircle, WifiOff, Users, User } from 'lucide-react';
import type { FeedingRecord, SyncQueueEntry } from '../../../../../types/database.types';

interface RegisterFeedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterFeedingModal: React.FC<RegisterFeedingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [targetType, setTargetType] = useState<'LOT' | 'ANIMAL'>('LOT');
  const [lotId, setLotId] = useState('lot1');
  const [animalId, setAnimalId] = useState('a1042');
  const [productId, setProductId] = useState('p1');
  const [feedingDate, setFeedingDate] = useState('2025-06-16');
  const [quantity, setQuantity] = useState('1.5');
  const [unit, setUnit] = useState('ton');
  const [totalCost, setTotalCost] = useState('477000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recordId = crypto.randomUUID();

    const feedingPayload: FeedingRecord = {
      id: recordId,
      farm_id: 'farm-1',
      lot_id: targetType === 'LOT' ? lotId : undefined,
      animal_id: targetType === 'ANIMAL' ? animalId : undefined,
      product_id: productId,
      feeding_date: new Date(feedingDate).toISOString(),
      quantity: parseFloat(quantity) || 0,
      unit,
      cost: parseFloat(totalCost) || 0 // <--- Corregido: 'cost' en lugar de 'total_cost'
    };

    const syncEntry: SyncQueueEntry<FeedingRecord> = {
      id: crypto.randomUUID(),
      entity_name: 'feeding_records',
      entity_id: recordId,
      operation_type: 'CREATE',
      payload: feedingPayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Registrar Alimentación:', feedingPayload);
    console.log('[Sync Queue]:', syncEntry);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.dbLabel}>FEEDING_RECORDS</span>
            <h2 className={styles.title}>Registrar alimentación</h2>
            <p className={styles.subtitle}>
              Registra el producto entregado, cantidad y costo.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.targetGroup}>
            <button
              type="button"
              className={`${styles.targetBtn} ${targetType === 'LOT' ? styles.targetActive : ''}`}
              onClick={() => setTargetType('LOT')}
            >
              <Users size={16} />
              <span>Lote completo</span>
            </button>
            <button
              type="button"
              className={`${styles.targetBtn} ${targetType === 'ANIMAL' ? styles.targetActive : ''}`}
              onClick={() => setTargetType('ANIMAL')}
            >
              <User size={16} />
              <span>Animal individual</span>
            </button>
          </div>

          <div className="row g-3">
            {targetType === 'LOT' ? (
              <div className="col-12">
                <label className={styles.label}>Lote (lot_id)</label>
                <select
                  className={styles.select}
                  value={lotId}
                  onChange={(e) => setLotId(e.target.value)}
                >
                  <option value="lot1">Vacas de cría · 58 animales</option>
                  <option value="lot2">Novillos levante · 63 animales</option>
                </select>
              </div>
            ) : (
              <div className="col-12">
                <label className={styles.label}>Animal (animal_id)</label>
                <select
                  className={styles.select}
                  value={animalId}
                  onChange={(e) => setAnimalId(e.target.value)}
                >
                  <option value="a1042">BR-1042 · Esperanza</option>
                  <option value="a1088">BR-1088 · Magnate</option>
                </select>
              </div>
            )}

            <div className="col-12 col-md-6">
              <label className={styles.label}>Producto (products.id)</label>
              <select
                className={styles.select}
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="p1">Maíz ensilado · 12.4 ton disponibles</option>
                <option value="p2">Sal mineralizada 8% · 40 bultos disponibles</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Fecha de alimentación</label>
              <input
                type="date"
                className={styles.input}
                value={feedingDate}
                onChange={(e) => setFeedingDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Cantidad</label>
              <input
                type="number"
                step="0.1"
                className={styles.input}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Unidad</label>
              <select
                className={styles.select}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="ton">ton</option>
                <option value="bultos">bultos</option>
                <option value="kg">kg</option>
              </select>
            </div>

            <div className="col-12">
              <label className={styles.label}>Costo total</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>$</span>
                <input
                  type="number"
                  className={styles.inputPrefixed}
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                />
              </div>
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
              <CheckCircle size={18} />
              <span>Guardar registro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterFeedingModal;