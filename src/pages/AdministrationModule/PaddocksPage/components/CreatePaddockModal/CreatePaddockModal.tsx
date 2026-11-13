import React, { useState } from 'react';
import styles from './CreatePaddockModal.module.css';
import { X, Check, WifiOff } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import useNotification from '../../../../../hooks/useNotification';
import { queueHatoWrite } from '../../../../../services/hatoDataService';

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
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const [name, setName] = useState('');
  const [code, setCode] = useState('POT-05');
  const [hectares, setHectares] = useState('0');
  const [capacity, setCapacity] = useState('0');
  const [forageType, setForageType] = useState('Brachiaria brizantha');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!scope) {
      setError('Selecciona una finca autorizada antes de registrar un potrero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await queueHatoWrite(scope, 'paddocks', 'CREATE', {
        farm_id: scope.farmId,
        name: name.trim(),
        code: code.trim() || undefined,
        hectares: Number(hectares),
        capacity: Number(capacity),
        forage_type: forageType,
        status: 'available',
      });
      markCurrentFormsSaved(formElement);
      if (result.pending) {
        showNotification({
          type: 'success',
          title: 'Potrero guardado en este dispositivo',
          message: result.lastError
            ? 'Se sincronizará cuando el backend vuelva a estar disponible.'
            : 'Se sincronizará al recuperar la conexión.',
        });
      } else {
        showNotification({
          type: 'success',
          title: 'Potrero registrado',
          message: 'El potrero se guardó correctamente en el backend.',
        });
      }
      onSuccess?.();
      onClose();
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo guardar el potrero.';
      setError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar el potrero', message });
    } finally {
      setIsSubmitting(false);
    }
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
                Si no hay señal, se guardará en la cola y se enviará al recuperar conexión.
              </div>
            </div>
          </div>
          {error && <p role="alert">{error}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSubmitting || !scope}>
              <Check size={18} />
              <span>{isSubmitting ? 'Guardando…' : 'Guardar registro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaddockModal;