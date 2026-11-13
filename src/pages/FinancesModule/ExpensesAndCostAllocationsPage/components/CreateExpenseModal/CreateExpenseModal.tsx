import React, { useState } from 'react';
import styles from './CreateExpenseModal.module.css';
import { X, Check, WifiOff } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import { queueHatoWrite, useHatoCollection } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

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
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { records: suppliers } = useHatoCollection<Record<string, unknown>>('suppliers', '/suppliers', scope);
  const [supplierId, setSupplierId] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [category, setCategory] = useState('Sanidad');
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    if (Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
      setSubmitError('El monto debe ser mayor que cero.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'expenses', 'CREATE', {
        farm_id: scope.farmId,
        supplier_id: supplierId || undefined,
        expense_date: expenseDate,
        category,
        description: description.trim() || undefined,
        amount: Number(amount),
        status: 'PENDING',
      });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Gasto pendiente de sincronización' : 'Gasto registrado',
        message: result.lastError ?? (result.pending
          ? 'El gasto quedó guardado localmente y se sincronizará al recuperar la conexión.'
          : 'El gasto se guardó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo registrar el gasto.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar', message });
    } finally {
      setIsSaving(false);
    }
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
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={String(supplier.id)} value={String(supplier.id)}>{String(supplier.name ?? supplier.id)}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Fecha del gasto</label>
              <input
                type="date"
                className={styles.input}
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
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
                  min="0.01"
                  step="0.01"
                  required
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
                Si no hay señal, se guardará en la cola local de sincronización.
              </div>
            </div>
          </div>

          {submitError && <p role="alert" className="text-danger">{submitError}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
              <Check size={18} />
              <span>{isSaving ? 'Guardando…' : 'Guardar registro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpenseModal;