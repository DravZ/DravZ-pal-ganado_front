import React, { useEffect, useState } from 'react';
import styles from './CreateMedicationModal.module.css';
import { X, WifiOff } from 'lucide-react';
import { useFormExitGuard } from '../../../../../../context/FormExitGuardContext';
import { requestOnlineAdministrationWrite } from '../../../../../../services/administrationService';
import useNotification from '../../../../../../hooks/useNotification';

interface CreateMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateMedicationModal: React.FC<CreateMedicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const [name, setName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [category, setCategory] = useState('');
  const [presentation, setPresentation] = useState('');
  const [concentration, setConcentration] = useState('');
  const [route, setRoute] = useState('Intramuscular');
  const [defaultUnit, setDefaultUnit] = useState('mL');
  const [withdrawalDaysMeat, setWithdrawalDaysMeat] = useState('');
  const [withdrawalDaysMilk, setWithdrawalDaysMilk] = useState('');
  const [defaultDosage, setDefaultDosage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!name.trim()) {
      setSubmitError('El nombre del medicamento es obligatorio.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      await requestOnlineAdministrationWrite('/medications', 'POST', {
        name: name.trim(),
        active_ingredient: activeIngredient.trim() || undefined,
        category: category.trim() || undefined,
        presentation: presentation.trim() || undefined,
        concentration: concentration.trim() || undefined,
        route: route || undefined,
        default_unit: defaultUnit || undefined,
        withdrawal_days_meat: withdrawalDaysMeat === '' ? undefined : Number(withdrawalDaysMeat),
        withdrawal_days_milk: withdrawalDaysMilk === '' ? undefined : Number(withdrawalDaysMilk),
        default_dosage: defaultDosage === '' ? undefined : Number(defaultDosage),
      });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: 'success',
        title: 'Medicamento registrado',
        message: 'El medicamento se agregó al catálogo y ya está disponible para los tratamientos.',
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo registrar el medicamento.';
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
            <span className={styles.dbLabel}>MEDICATIONS · CATÁLOGO</span>
            <h2 className={styles.title}>Nuevo medicamento</h2>
            <p className={styles.subtitle}>
              Registra el producto para poder prescribirlo en los tratamientos.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className={styles.label}>Nombre</label>
              <input
                type="text"
                placeholder="Nombre comercial del medicamento"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Principio activo</label>
              <input
                type="text"
                placeholder="Ej. Oxitetraciclina"
                className={styles.input}
                value={activeIngredient}
                onChange={(e) => setActiveIngredient(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Categoría</label>
              <input
                type="text"
                placeholder="Ej. Antibiótico, Vacuna, Antiparasitario"
                className={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Vía de administración</label>
              <select
                className={styles.select}
                value={route}
                onChange={(e) => setRoute(e.target.value)}
              >
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Intravenosa">Intravenosa</option>
                <option value="Oral">Oral</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Presentación</label>
              <input
                type="text"
                placeholder="Ej. Frasco, Tableta"
                className={styles.input}
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Concentración</label>
              <input
                type="text"
                placeholder="Ej. 200 mg/mL"
                className={styles.input}
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Unidad por defecto</label>
              <select
                className={styles.select}
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value)}
              >
                <option value="mL">mL</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="Dosis">Dosis</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Dosis por defecto</label>
              <input
                type="number"
                className={styles.input}
                placeholder="Opcional"
                value={defaultDosage}
                onChange={(e) => setDefaultDosage(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Días de retiro · carne</label>
              <input
                type="number"
                className={styles.input}
                placeholder="0"
                value={withdrawalDaysMeat}
                onChange={(e) => setWithdrawalDaysMeat(e.target.value)}
                min="0"
                step="1"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Días de retiro · leche</label>
              <input
                type="number"
                className={styles.input}
                placeholder="0"
                value={withdrawalDaysMilk}
                onChange={(e) => setWithdrawalDaysMilk(e.target.value)}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className={styles.offlineBanner}>
            <WifiOff size={18} className={styles.offlineIcon} />
            <div>
              <div className={styles.offlineTitle}>Requiere conexión a internet</div>
              <div className={styles.offlineSubtitle}>
                El catálogo de medicamentos es global y solo se puede administrar con conexión.
              </div>
            </div>
          </div>

          {submitError && <p role="alert" className="text-danger">{submitError}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving || !isOnline}>
              {isSaving ? 'Guardando…' : 'Guardar medicamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMedicationModal;
