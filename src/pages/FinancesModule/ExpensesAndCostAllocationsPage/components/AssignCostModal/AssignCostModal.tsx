import React, { useState } from 'react';
import styles from './AssignCostModal.module.css';
import { X, Check, WifiOff } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import { queueHatoWrite, useHatoCollection } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

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
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { records: expenses } = useHatoCollection<Record<string, unknown>>('expenses', '/expenses', scope);
  const { records: allocations } = useHatoCollection<Record<string, unknown>>(
    'cost_allocations',
    '/cost-allocations',
    scope,
  );
  const { records: lots } = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const { records: animals } = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);
  const [expenseId, setExpenseId] = useState('');
  const [allocationType, setAllocationType] = useState<'Lote' | 'Animal'>('Lote');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [allocationDate, setAllocationDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedExpense = expenses.find((expense) => expense.id === expenseId);
  const assignedAmount = allocations
    .filter((allocation) => allocation.expense_id === expenseId)
    .reduce((sum, allocation) => sum + (Number(allocation.amount) || 0), 0);
  const availableAmount = Math.max(0, (Number(selectedExpense?.amount) || 0) - assignedAmount);
  const targets = allocationType === 'Lote' ? lots : animals;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    if (!expenseId || !targetId) {
      setSubmitError('Selecciona el gasto y el centro de costo.');
      return;
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0 || Number(amount) > availableAmount) {
      setSubmitError('El monto debe ser mayor que cero y no superar el saldo disponible del gasto.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'cost_allocations', 'CREATE', {
        farm_id: scope.farmId,
        expense_id: expenseId,
        lot_id: allocationType === 'Lote' ? targetId : undefined,
        animal_id: allocationType === 'Animal' ? targetId : undefined,
        allocation_type: allocationType,
        amount: Number(amount),
        allocation_date: allocationDate,
      });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Asignación pendiente de sincronización' : 'Costo asignado',
        message: result.lastError ?? (result.pending
          ? 'La asignación quedó guardada localmente y se sincronizará al recuperar la conexión.'
          : 'La asignación se guardó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo asignar el costo.';
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
                <option value="">Selecciona un gasto</option>
                {expenses.map((expense) => (
                  <option key={String(expense.id)} value={String(expense.id)}>
                    ${(Number(expense.amount) || 0).toLocaleString('es-MX')} · {String(expense.description ?? expense.category ?? 'Gasto')}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Tipo de asignación</label>
              <select
                className={styles.select}
                value={allocationType}
                onChange={(e) =>
                  {
                    setAllocationType(e.target.value as 'Lote' | 'Animal');
                    setTargetId('');
                  }
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
                <option value="">Selecciona un {allocationType.toLowerCase()}</option>
                {targets.map((target) => (
                  <option key={String(target.id)} value={String(target.id)}>
                    {allocationType === 'Lote'
                      ? String(target.name ?? target.id)
                      : `${String(target.identifier_tag ?? target.tag_number ?? target.id)} · ${String(target.name ?? 'Sin nombre')}`}
                  </option>
                ))}
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
                  min="0.01"
                  step="0.01"
                  required
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
                required
              />
            </div>
          </div>

          <div className={styles.availableBox}>
            <div className="d-flex justify-content-between mb-1">
              <span>Disponible por asignar</span>
              <span className="fw-bold">{availableAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
            </div>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${Number(selectedExpense?.amount) ? Math.min(availableAmount / Number(selectedExpense?.amount) * 100, 100) : 0}%` }}
              />
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

export default AssignCostModal;