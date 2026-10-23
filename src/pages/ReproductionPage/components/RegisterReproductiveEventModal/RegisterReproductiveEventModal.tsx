import React, { useState } from 'react';
import { X, Check, CloudOff } from 'lucide-react';
import styles from './RegisterReproductiveEventModal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterReproductiveEventModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    femaleAnimalId: 'BR-1042',
    eventType: 'Celo',
    maleAnimalId: 'BR-0721',
    serviceType: 'Inseminación artificial',
    eventDate: '2025-06-16',
    expectedDate: '2026-03-25',
    realDate: '',
    resultStatus: 'Pendiente',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      female_animal_id: formData.femaleAnimalId,
      event_type: formData.eventType,
      male_animal_id: formData.maleAnimalId || null,
      service_type: formData.serviceType || null,
      event_date: formData.eventDate,
      expected_date: formData.expectedDate || null,
      real_date: formData.realDate || null,
      result_status: formData.resultStatus,
    };

    console.log('[Action Log]: Formulario enviado al backend ->', payload);
    if (onSuccess) onSuccess();
    onClose();
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
                >
                  <option value="BR-1042">BR-1042 · Esperanza · Nelore</option>
                  <option value="BR-1170">BR-1170 · Bonita · Nelore</option>
                  <option value="BR-0982">BR-0982 · Princesa · Nelore</option>
                  <option value="BR-1124">BR-1124 · Canela · Braford</option>
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
                  <option value="BR-0721">BR-0721 · Imperador · Nelore</option>
                  <option value="BR-0900">BR-0900 · Apolo · Angus</option>
                </select>
              </div>

              {/* Tipo de Servicio */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>Tipo de servicio</label>
                <select
                  className={styles.formControl}
                  value={formData.serviceType}
                  onChange={(e) => handleChange('serviceType', e.target.value)}
                >
                  <option value="Inseminación artificial">Inseminación artificial</option>
                  <option value="Monta directa">Monta directa</option>
                  <option value="Transferencia de embriones">Transferencia de embriones</option>
                </select>
              </div>

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
                />
              </div>

              {/* Fecha real */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>Fecha real</label>
                <input
                  type="date"
                  className={styles.formControl}
                  value={formData.realDate}
                  onChange={(e) => handleChange('realDate', e.target.value)}
                />
              </div>

              {/* Resultado */}
              <div className="col-12 col-md-6">
                <label className={styles.formLabel}>Resultado</label>
                <select
                  className={styles.formControl}
                  value={formData.resultStatus}
                  onChange={(e) => handleChange('resultStatus', e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
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
            >
              <Check size={18} strokeWidth={2.5} />
              <span>Guardar registro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};