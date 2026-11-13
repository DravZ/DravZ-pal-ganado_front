import React, { useState } from 'react';
import { X, Check, CloudOff } from 'lucide-react';
import styles from './RegisterReproductiveEventModal.module.css';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import type { ReproductiveEventFormValues } from '../../../../../types/database.types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  animals: { id: string; tag: string; name: string; breed: string; sex: string; status: string }[];
  onSubmit: (values: ReproductiveEventFormValues) => Promise<void>;
}

export const RegisterReproductiveEventModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  animals,
  onSubmit,
}) => {
  const { markCurrentFormsSaved } = useFormExitGuard();
  const [formData, setFormData] = useState<ReproductiveEventFormValues>({
    femaleAnimalId: '',
    eventType: 'Celo',
    maleAnimalId: '',
    serviceType: '',
    eventDate: new Date().toISOString().slice(0, 10),
    expectedDate: '',
    actualDate: '',
    result: 'Pendiente',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.femaleAnimalId) {
      newErrors.femaleAnimalId = 'Selecciona una hembra.';
    }
    if (!formData.eventType) {
      newErrors.eventType = 'Selecciona el tipo de evento.';
    }
    if (!formData.eventDate) {
      newErrors.eventDate = 'La fecha del evento es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;

    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(formData);
      markCurrentFormsSaved(formElement);
      onSuccess?.();
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar el evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado Fijo */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.kickerTag}>REPRODUCTIVE_EVENTS</div>
            <h2 className={styles.modalTitle}>Registrar evento reproductivo</h2>
            <p className={styles.modalSubtitle}>
              Actualiza el ciclo y la historia reproductiva de la hembra.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario envuelto con clase flexbox .modalForm */}
        <form
          onSubmit={handleSubmit}
          id="reproductive-event-form"
          className={styles.modalForm}
        >
          {/* Cuerpo Scrollable */}
          <div className={styles.modalBody}>
            <div className="row g-3">
              {/* Hembra */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>
                  Hembra <span className={styles.fieldTag}>(female_animal_id)</span>
                </label>
                <select
                  className={`${styles.formControl} ${
                    errors.femaleAnimalId ? styles.formControlError : ''
                  }`}
                  value={formData.femaleAnimalId}
                  onChange={(e) => handleChange('femaleAnimalId', e.target.value)}
                  required
                >
                  <option value="">Selecciona una hembra</option>
                  {animals.filter((animal) =>
                    animal.status === 'active' && ['hembra', 'female'].includes(animal.sex.toLowerCase()),
                  ).map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.tag} · {animal.name} · {animal.breed}
                    </option>
                  ))}
                </select>
                {errors.femaleAnimalId && (
                  <div className={styles.errorText}>{errors.femaleAnimalId}</div>
                )}
              </div>

              {/* Tipo de Evento */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>Tipo de evento</label>
                <select
                  className={`${styles.formControl} ${
                    errors.eventType ? styles.formControlError : ''
                  }`}
                  value={formData.eventType}
                  onChange={(e) => handleChange('eventType', e.target.value)}
                >
                  <option value="Celo">Celo</option>
                  <option value="Inseminación">Inseminación</option>
                  <option value="Monta natural">Monta natural</option>
                  <option value="Diagnóstico preñez">Diagnóstico de preñez</option>
                  <option value="Parto">Parto</option>
                  <option value="Aborto">Aborto</option>
                </select>
                {errors.eventType && (
                  <div className={styles.errorText}>{errors.eventType}</div>
                )}
              </div>

              {/* Macho / Semen */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>
                  Macho / Semen <span className={styles.fieldTag}>(male_animal_id)</span>
                </label>
                <select
                  className={styles.formControl}
                  value={formData.maleAnimalId}
                  onChange={(e) => handleChange('maleAnimalId', e.target.value)}
                >
                  <option value="">Sin padre registrado</option>
                  {animals.filter((animal) =>
                    animal.status === 'active' && ['macho', 'male'].includes(animal.sex.toLowerCase()),
                  ).map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.tag} · {animal.name} · {animal.breed}
                    </option>
                  ))}
                </select>
              </div>
              {submitError && <p role="alert" className="text-danger px-3">{submitError}</p>}

              {/* Fecha del evento */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>Fecha del evento</label>
                <input
                  type="date"
                  className={`${styles.formControl} ${
                    errors.eventDate ? styles.formControlError : ''
                  }`}
                  value={formData.eventDate}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  required
                />
                {errors.eventDate && (
                  <div className={styles.errorText}>{errors.eventDate}</div>
                )}
              </div>

              {/* Fecha esperada */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>Fecha esperada</label>
                <input
                  type="date"
                  className={styles.formControl}
                  value={formData.expectedDate}
                  onChange={(e) => handleChange('expectedDate', e.target.value)}
                  min={formData.eventDate}
                />
              </div>

              {/* Resultado */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>Resultado</label>
                <select
                  className={styles.formControl}
                  value={formData.result}
                  onChange={(e) => handleChange('result', e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Fallida">Fallida</option>
                </select>
              </div>
            </div>

            {/* Banner Informativo Offline */}
            <div className={styles.offlineBanner}>
              <CloudOff size={20} className={styles.offlineIcon} />
              <div>
                <h4 className={styles.offlineTitle}>Disponible sin conexión</h4>
                <p className={styles.offlineSub}>
                  Si no hay señal, se guardará en sync_queue.
                </p>
              </div>
            </div>
          </div>

          {/* Pie de Página Fijo con Botones */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              <Check size={18} strokeWidth={2.5} />
              <span>{isSubmitting ? 'Guardando…' : 'Guardar registro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};