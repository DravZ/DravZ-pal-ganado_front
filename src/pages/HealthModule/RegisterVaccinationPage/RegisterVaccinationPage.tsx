import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './RegisterVaccinationPage.module.css';
import { ArrowLeft, CheckCircle, WifiOff } from 'lucide-react';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../context/FormExitGuardContext';
import { queueHatoWrite, useHatoCollection } from '../../../services/hatoDataService';
import useNotification from '../../../hooks/useNotification';

export const RegisterVaccinationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { records: rawAnimals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const animals = rawAnimals.filter((animal) =>
    String(animal.status ?? '').toLowerCase() === 'active',
  );
  // Estados del formulario
  const [animalId, setAnimalId] = useState<string>(searchParams.get('animalId') ?? '');
  const [vaccineName, setVaccineName] = useState<string>(searchParams.get('vaccineName') ?? '');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [veterinarian, setVeterinarian] = useState<string>('');
  const [applicationDate, setApplicationDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [dose, setDose] = useState<string>('2');
  const [doseUnit, setDoseUnit] = useState<string>('mL');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const newErrors: { [key: string]: string } = {};
    if (!scope) newErrors.scope = 'No hay una finca autorizada seleccionada.';
    if (!animalId) newErrors.animal = 'Selecciona un animal.';
    if (!vaccineName.trim()) {
      newErrors.vaccineName = 'El nombre de la vacuna es obligatorio.';
    }
    if (!Number.isFinite(Number(dose)) || Number(dose) <= 0) {
      newErrors.dose = 'La dosis debe ser mayor que cero.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    if (!scope) return;
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'vaccinations', 'CREATE', {
        animal_id: animalId,
        vaccine_name: vaccineName.trim(),
        manufacturer: manufacturer.trim() || undefined,
        application_date: `${applicationDate}T00:00:00`,
        next_due_date: nextDueDate || undefined,
        dose: Number(dose),
        dose_unit: doseUnit,
        veterinarian_name: veterinarian.trim() || undefined,
      });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Vacunación pendiente de sincronización' : 'Vacunación registrada',
        message: result.lastError ?? (result.pending
          ? 'La vacunación quedó guardada en la cola local.'
          : 'La aplicación quedó registrada correctamente.'),
      });
      navigate(-1);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo registrar la vacunación.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo registrar la vacunación', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* NAVEGACIÓN Y BOTÓN DE RETORNO */}
      <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        <span>Volver a Salud y tratamientos</span>
      </button>

      {/* ENCABEZADO PRINCIPAL */}
      <header className="mb-4">
        <span className={styles.sectionSubtitle}>VACCINATIONS · NUEVO REGISTRO</span>
        <h1 className={styles.sectionTitle}>Registrar vacunación</h1>
        <p className={styles.sectionDescription}>
          Registra la aplicación y programa la siguiente dosis.
        </p>
      </header>

      {/* TARJETA DEL FORMULARIO */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className="row g-3">
          {/* Animal */}
          <div className="col-12 col-md-6">
            <label className={styles.label}>Animal</label>
            <select
              className={styles.select}
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              required
            >
              <option value="">Selecciona un animal</option>
              {animals.map((animal) => (
                <option key={String(animal.id)} value={String(animal.id)}>
                  {String(animal.identifier_tag ?? animal.tag_number ?? animal.id)}
                  {' · '}{String(animal.name ?? 'Sin nombre')}
                </option>
              ))}
            </select>
            {errors.animal && <span className={styles.errorText}>{errors.animal}</span>}
          </div>

          {/* Nombre de la vacuna */}
          <div className="col-12 col-md-6">
            <label className={styles.label}>Nombre de la vacuna</label>
            <input
              type="text"
              className={`${styles.input} ${errors.vaccineName ? styles.inputError : ''}`}
              placeholder="Ej. Clostridial 8 vías"
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              required
            />
            {errors.vaccineName && (
              <span className={styles.errorText}>{errors.vaccineName}</span>
            )}
          </div>

          {/* Fabricante */}
          <div className="col-12 col-md-6">
            <label className={styles.label}>Fabricante</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Laboratorio fabricante"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
          </div>

          {/* Veterinario */}
          <div className="col-12 col-md-6">
            <label className={styles.label}>Veterinario</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Nombre del profesional"
              value={veterinarian}
              onChange={(e) => setVeterinarian(e.target.value)}
            />
          </div>

          {/* Fecha de aplicación */}
          <div className="col-12 col-md-6">
            <label className={styles.label}>Fecha de aplicación</label>
            <input
              type="date"
              className={styles.input}
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              required
            />
          </div>

          {/* Próxima dosis */}
          <div className="col-12 col-md-6">
            <label className={styles.label}>Próxima dosis</label>
            <input
              type="date"
              className={styles.input}
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              min={applicationDate}
            />
          </div>

          {/* Dosis y Unidad */}
          <div className="col-12">
            <label className={styles.label}>Dosis</label>
            <div className={styles.doseGroup}>
              <input
                type="number"
                className={styles.doseInput}
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                min="0.001"
                step="0.001"
                required
              />
              <select
                className={styles.doseSelect}
                value={doseUnit}
                onChange={(e) => setDoseUnit(e.target.value)}
              >
                <option value="mL">mL</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="Dosis">Dosis</option>
              </select>
            </div>
            {errors.dose && <span className={styles.errorText}>{errors.dose}</span>}
          </div>
        </div>

        {/* BANNER OFFLINE */}
        <div className={styles.offlineBanner}>
          <WifiOff size={20} className={styles.offlineIcon} />
          <div>
            <div className={styles.offlineTitle}>Disponible sin conexión</div>
            <div className={styles.offlineSubtitle}>
              Si no hay señal, se guardará localmente y aparecerá en la cola de sincronización.
            </div>
          </div>
        </div>

        {/* ACCIONES Y BOTONES */}
        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.saveBtn} disabled={isSaving}>
            <CheckCircle size={18} />
            <span>{isSaving ? 'Guardando…' : 'Guardar registro'}</span>
          </button>
        </div>
        {(errors.scope || submitError) && (
          <p role="alert" className="text-danger mt-3">{submitError ?? errors.scope}</p>
        )}
      </form>
    </div>
  );
};

export default RegisterVaccinationPage;