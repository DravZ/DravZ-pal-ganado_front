import React, { useState } from 'react';
import styles from './AssignCostModal.module.css';
import { X, Check, WifiOff } from 'lucide-react';
import type { CostAllocation, SyncQueueEntry } from '../../../../../types/database.types';

interface AssignCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignCostModal: React.FC<AssignCostModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [expenseId, setExpenseId] = useState('exp-3');
  const [allocationType, setAllocationType] = useState<'Lote' | 'Animal'>('Lote');
  const [targetId, setTargetId] = useState('lot-1');
  const [amount, setAmount] = useState('650000');
  const [allocationDate, setAllocationDate] = useState('2025-06-16');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allocationId = crypto.randomUUID();

    const allocationPayload: CostAllocation = {
      id: allocationId,
      farm_id: 'farm-1',
      expense_id: expenseId,
      lot_id: allocationType === 'Lote' ? targetId : undefined,
      animal_id: allocationType === 'Animal' ? targetId : undefined,
      allocation_type: allocationType,
      amount: parseFloat(amount) || 0,
      allocation_date: new Date(allocationDate).toISOString()
    };

    const syncEntry: SyncQueueEntry<CostAllocation> = {
      id: crypto.randomUUID(),
      entity_name: 'cost_allocations',
      entity_id: allocationId,
      operation_type: 'CREATE',
      payload: allocationPayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Asignar Costo:', allocationPayload);
    console.log('[Sync Queue]:', syncEntry);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.dbLabel}>COST_ALLOCATIONS</span>
            <h2 className={styles.title}>Asignar costo</h2>
            <p className={styles.subtitle}>
              Distribuye un gasto a un lote o animal específico.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className={styles.label}>Gasto (expense_id)</label>
              <select
                className={styles.select}
                value={expenseId}
                onChange={(e) => setExpenseId(e.target.value)}
              >
                <option value="exp-3">$650,000 · Honorarios veterinarios</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Tipo de asignación</label>
              <select
                className={styles.select}
                value={allocationType}
                onChange={(e) =>
                  setAllocationType(e.target.value as 'Lote' | 'Animal')
                }
              >
                <option value="Lote">Lote</option>
                <option value="Animal">Animal</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Lote o animal</label>
              <select
                className={styles.select}
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                <option value="lot-1">Vacas de cría · 58 animales</option>
                <option value="lot-2">Novillos levante · 63 animales</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Monto a asignar</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>$</span>
                <input
                  type="number"
                  className={styles.inputBare}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12">
              <label className={styles.label}>Fecha de asignación</label>
              <input
                type="date"
                className={styles.input}
                value={allocationDate}
                onChange={(e) => setAllocationDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.availableBox}>
            <div className="d-flex justify-content-between mb-1">
              <span>Disponible por asignar</span>
              <span className="fw-bold">$650,000</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: '100%' }}></div>
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

export default AssignCostModal;