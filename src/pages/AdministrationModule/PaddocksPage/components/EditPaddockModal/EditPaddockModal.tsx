import React, { useRef, useState } from 'react';
import styles from '../CreatePaddockModal/CreatePaddockModal.module.css';
import { X, Check, WifiOff, Trash2 } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import useNotification from '../../../../../hooks/useNotification';
import { queueHatoWrite } from '../../../../../services/hatoDataService';
import type { PaddockUI } from '../../PaddocksPage';

interface EditPaddockModalProps {
  paddock: PaddockUI;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditPaddockModal: React.FC<EditPaddockModalProps> = ({
  paddock,
  onClose,
  onSuccess,
}) => {
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(paddock.name ?? '');
  const [code, setCode] = useState(paddock.code ?? '');
  const [hectares, setHectares] = useState(String(paddock.hectares ?? 0));
  const [capacity, setCapacity] = useState(String(paddock.capacity ?? 0));
  const [forageType, setForageType] = useState(paddock.forage_type || 'Brachiaria brizantha');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!scope) {
      setError('Selecciona una finca autorizada antes de editar el potrero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await queueHatoWrite(scope, 'paddocks', 'UPDATE', {
        name: name.trim(),
        code: code.trim() || undefined,
        hectares: Number(hectares),
        capacity: Number(capacity),
        forage_type: forageType,
      }, paddock.id);
      markCurrentFormsSaved(formElement);
      if (result.pending) {
        showNotification({
          type: 'success',
          title: 'Cambios guardados en este dispositivo',
          message: result.lastError
            ? 'Se sincronizarán cuando el backend vuelva a estar disponible.'
            : 'Se sincronizarán al recuperar la conexión.',
        });
      } else {
        showNotification({
          type: 'success',
          title: 'Potrero actualizado',
          message: 'Los cambios se guardaron correctamente en el backend.',
        });
      }
      onSuccess?.();
      onClose();
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo actualizar el potrero.';
      setError(message);
      showNotification({ type: 'error', title: 'No se pudo actualizar el potrero', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!scope) {
      setError('Selecciona una finca autorizada antes de eliminar el potrero.');
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const result = await queueHatoWrite(scope, 'paddocks', 'DELETE', {}, paddock.id);
      markCurrentFormsSaved(formRef.current ?? undefined);
      if (result.pending) {
        showNotification({
          type: 'success',
          title: 'Potrero eliminado en este dispositivo',
          message: result.lastError
            ? 'La eliminación se enviará cuando el backend vuelva a estar disponible.'
            : 'La eliminación se enviará al recuperar la conexión.',
        });
      } else {
        showNotification({
          type: 'success',
          title: 'Potrero eliminado',
          message: 'El potrero se eliminó correctamente en el backend.',
        });
      }
      onSuccess?.();
      onClose();
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo eliminar el potrero.';
      setError(message);
      showNotification({ type: 'error', title: 'No se pudo eliminar el potrero', message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.dbLabel}>PADDOCKS · EDITAR REGISTRO</span>
            <h2 className={styles.title}>Editar potrero</h2>
            <p className={styles.subtitle}>
              Actualiza el área productiva y su capacidad estimada.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.body}>
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
                  min="0"
                  step="0.01"
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
                  min="0"
                  step="1"
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
                Si no hay señal, los cambios se guardarán en la cola y se enviarán al recuperar conexión.
              </div>
            </div>
          </div>

          {confirmDelete && (
            <div className={styles.deleteWarning}>
              <Trash2 size={18} className={styles.deleteWarningIcon} />
              <div>
                <div className={styles.deleteWarningTitle}>¿Eliminar este potrero?</div>
                <div className={styles.deleteWarningSubtitle}>
                  Se quitará de la finca. Esta acción no se puede deshacer.
                </div>
              </div>
            </div>
          )}
          {error && <p role="alert">{error}</p>}

          <div className={styles.footer}>
            <div>
              {confirmDelete ? (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={handleDelete}
                    disabled={isDeleting || !scope}
                  >
                    <Trash2 size={16} />
                    <span>{isDeleting ? 'Eliminando…' : 'Sí, eliminar'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.dangerOutlineBtn}
                  onClick={() => setConfirmDelete(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </button>
              )}
            </div>
            <div className="d-flex gap-2">
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cerrar
              </button>
              <button type="submit" className={styles.saveBtn} disabled={isSubmitting || isDeleting || !scope}>
                <Check size={18} />
                <span>{isSubmitting ? 'Guardando…' : 'Guardar cambios'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaddockModal;
