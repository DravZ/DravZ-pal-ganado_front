import React, { useState } from 'react';
import styles from './CreateExpenseModal.module.css';
import { X, Check, WifiOff } from 'lucide-react';
import type { Expense, SyncQueueEntry } from '../../../../../types/database.types';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [supplierId, setSupplierId] = useState('sup-1');
  const [expenseDate, setExpenseDate] = useState('2025-06-16');
  const [category, setCategory] = useState('Sanidad');
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expenseId = crypto.randomUUID();

    const expensePayload: Expense = {
      id: expenseId,
      farm_id: 'farm-1',
      supplier_id: supplierId,
      expense_date: new Date(expenseDate).toISOString(),
      category,
      description,
      amount: parseFloat(amount) || 0,
      status: 'Pendiente'
    };

    const syncEntry: SyncQueueEntry<Expense> = {
      id: crypto.randomUUID(),
      entity_name: 'expenses',
      entity_id: expenseId,
      operation_type: 'CREATE',
      payload: expensePayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Registrar Gasto:', expensePayload);
    console.log('[Sync Queue]:', syncEntry);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.dbLabel}>EXPENSES · NUEVO REGISTRO</span>
            <h2 className={styles.title}>Registrar gasto</h2>
            <p className={styles.subtitle}>
              Registra el proveedor, concepto y monto del egreso.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className={styles.label}>Proveedor (supplier_id)</label>
              <select
                className={styles.select}
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="sup-1">Veterinaria San Martín · NIT 901.221.047</option>
                <option value="sup-2">Servicios Rurales SAS · NIT 800.992.110</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Fecha del gasto</label>
              <input
                type="date"
                className={styles.input}
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Categoría</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Sanidad">Sanidad</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Infraestructura">Infraestructura</option>
                <option value="Servicios">Servicios</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Monto</label>
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
              <label className={styles.label}>Descripción</label>
              <textarea
                rows={3}
                className={styles.textarea}
                placeholder="Describe el concepto del gasto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
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

export default CreateExpenseModal;