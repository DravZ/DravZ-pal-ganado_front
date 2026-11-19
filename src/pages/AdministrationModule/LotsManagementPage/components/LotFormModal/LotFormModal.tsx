import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import styles from '../../LotsManagementPage.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import useNotification from '../../../../../hooks/useNotification';
import { queueHatoWrite } from '../../../../../services/hatoDataService';

export interface LotFormValues {
  id?: string;
  name?: string;
  code?: string;
  lotType?: string;
  purpose?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  currentPaddockId?: string;
}

interface LotFormModalProps {
  mode: 'create' | 'edit';
  lot?: LotFormValues;
  paddocks: { id: string; name: string }[];
  defaultPaddockId?: string;
  onClose: () => void;
  onSaved?: () => void;
}

const text = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

export const LotFormModal: React.FC<LotFormModalProps> = ({
  mode,
  lot,
  paddocks,
  defaultPaddockId,
  onClose,
  onSaved,
}) => {
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const [name, setName] = useState(text(lot?.name));
  const [code, setCode] = useState(text(lot?.code));
  const [lotType, setLotType] = useState(text(lot?.lotType));
  const [purpose, setPurpose] = useState(text(lot?.purpose));
  const [status, setStatus] = useState(text(lot?.status) || 'active');
  const [startDate, setStartDate] = useState(text(lot?.startDate).slice(0, 10));
  const [endDate, setEndDate] = useState(text(lot?.endDate).slice(0, 10));
  const [notes, setNotes] = useState(text(lot?.notes));
  const [paddockId, setPaddockId] = useState(
    text(lot?.currentPaddockId) || defaultPaddockId || '',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edit';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!scope) {
      setError('Selecciona una finca autorizada antes de guardar el lote.');
      return;
    }
    if (!name.trim()) {
      setError('Escribe un nombre para el lote.');
      return;
    }
    if (!paddockId) {
      setError('Selecciona el potrero del lote.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        farm_id: scope.farmId,
        name: name.trim(),
        code: code.trim() || undefined,
        lot_type: lotType.trim() || undefined,
        purpose: purpose.trim() || undefined,
        status: status || 'active',
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        notes: notes.trim() || undefined,
        current_paddock_id: paddockId,
      };
      const result = isEdit && lot?.id
        ? await queueHatoWrite(scope, 'lots', 'UPDATE', payload, lot.id)
        : await queueHatoWrite(scope, 'lots', 'CREATE', payload);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending
          ? 'Lote guardado para sincronizar'
          : isEdit ? 'Lote actualizado' : 'Lote creado',
        message: result.pending
          ? 'El lote quedó disponible localmente y se sincronizará al recuperar la conexión.'
          : 'Los datos del lote se guardaron correctamente.',
      });
      onSaved?.();
      onClose();
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo guardar el lote.';
      setError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar el lote', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalLabel}>LOTS · {isEdit ? 'EDITAR' : 'NUEVO REGISTRO'}</span>
            <h2 className={styles.modalTitle}>{isEdit ? 'Editar lote' : 'Nuevo lote'}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="lot-name">Nombre</label>
                <input
                  id="lot-name"
                  className={styles.input}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Lote de engorda 1"
                  maxLength={150}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="lot-code">Código</label>
                <input
                  id="lot-code"
                  className={styles.input}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Ej. LE-01"
                  maxLength={50}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="lot-type">Categoría</label>
                <input
                  id="lot-type"
                  className={styles.input}
                  value={lotType}
                  onChange={(event) => setLotType(event.target.value)}
                  placeholder="Ej. Engorda, leche, cría"
                  maxLength={50}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="lot-purpose">Propósito</label>
                <input
                  id="lot-purpose"
                  className={styles.input}
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  placeholder="Ej. Finalización"
                  maxLength={100}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="lot-paddock">Potrero</label>
                <select
                  id="lot-paddock"
                  className={styles.select}
                  value={paddockId}
                  onChange={(event) => setPaddockId(event.target.value)}
                  required
                >
                  <option value="">Selecciona un potrero</option>
                  {paddocks.map((paddock) => (
                    <option key={paddock.id} value={paddock.id}>{paddock.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="lot-status">Estado</label>
                <select
                  id="lot-status"
                  className={styles.select}
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="active">Activo</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="lot-start">Fecha de inicio</label>
                <input
                  id="lot-start"
                  type="date"
                  className={styles.input}
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="lot-end">Fecha de fin</label>
                <input
                  id="lot-end"
                  type="date"
                  className={styles.input}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
              <div className="col-12">
                <label className={styles.fieldLabel} htmlFor="lot-notes">Observaciones</label>
                <textarea
                  id="lot-notes"
                  className={styles.textarea}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </div>
            {error && <p className={styles.errorText} role="alert">{error}</p>}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving || !scope}>
              <Check size={18} />
              <span>{isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear lote'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LotFormModal;
