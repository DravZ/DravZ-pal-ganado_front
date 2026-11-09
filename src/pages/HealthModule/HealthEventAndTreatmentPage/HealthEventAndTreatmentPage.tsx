import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HealthEventAndTreatmentPage.module.css';
import DoseKeypad from './components/DoseKeypad/DoseKeypad';
import { ArrowLeft, Bell, CheckCircle } from 'lucide-react';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { queueHatoWrite, useHatoCollection } from '../../../services/hatoDataService';
import useNotification from '../../../hooks/useNotification';

function addDays(date: string, days: number): Date | null {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day || !Number.isFinite(days)) return null;
  const result = new Date(year, month - 1, day + days);
  return Number.isNaN(result.getTime()) ? null : result;
}

function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const HealthEventAndTreatmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const { records: rawAnimals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const { records: rawMedications } = useHatoCollection<Record<string, unknown>>(
    'medications',
    '/medications',
    scope,
  );
  const animals = rawAnimals.filter((animal) =>
    String(animal.status ?? '').toLowerCase() === 'active',
  );
  const medications = rawMedications.filter((medication) =>
    String(medication.status ?? 'active').toLowerCase() !== 'inactive',
  );
  // Estado Sección 1: Evento de Salud
  const [animalId, setAnimalId] = useState<string>('');
  const [eventType, setEventType] = useState<string>('Enfermedad');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [veterinarian, setVeterinarian] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');

  // Estado Sección 2: Tratamiento Asociado
  const [medicationId, setMedicationId] = useState<string>('');
  const [route, setRoute] = useState<string>('Intramuscular');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>('');
  const [doseUnit, setDoseUnit] = useState<string>('mL');
  const [frequency, setFrequency] = useState<string>('Cada 24 horas');
  const [doseValue, setDoseValue] = useState<string>('20');
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const selectedMedication = medications.find((medication) => medication.id === medicationId);
  const lastDoseDate = endDate || startDate;
  const meatWithdrawalDays = Number(selectedMedication?.withdrawal_days_meat ?? 0);
  const milkWithdrawalDays = Number(selectedMedication?.withdrawal_days_milk ?? 0);
  const meatWithdrawalDate = meatWithdrawalDays > 0
    ? addDays(lastDoseDate, meatWithdrawalDays)
    : null;
  const milkWithdrawalDate = milkWithdrawalDays > 0
    ? addDays(lastDoseDate, milkWithdrawalDays)
    : null;
  const withdrawalDates = [meatWithdrawalDate, milkWithdrawalDate].filter(
    (date): date is Date => date !== null,
  );
  const withdrawalUntil = withdrawalDates.length
    ? localDate(new Date(Math.max(...withdrawalDates.map((date) => date.getTime()))))
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    if (!animalId || !medicationId) {
      setSubmitError('Selecciona el animal y el medicamento.');
      return;
    }
    if (!Number.isFinite(Number(doseValue)) || Number(doseValue) <= 0) {
      setSubmitError('La dosis debe ser mayor que cero.');
      return;
    }

    setIsSaving(true);
    setSubmitError(null);
    try {
      const healthResult = await queueHatoWrite(scope, 'health_records', 'CREATE', {
        animal_id: animalId,
        medication_id: medicationId,
        event_date: eventDate,
        event_type: eventType,
        diagnosis: diagnosis.trim() || undefined,
        symptoms: symptoms.trim() || undefined,
        veterinarian_name: veterinarian.trim() || undefined,
        dosage: Number(doseValue),
        unit: doseUnit,
        withdrawal_end_date: withdrawalUntil,
      });
      const treatmentResult = await queueHatoWrite(scope, 'treatments', 'CREATE', {
        animal_id: animalId,
        health_event_id: healthResult.recordId,
        medication_id: medicationId,
        start_date: `${startDate}T00:00:00`,
        end_date: endDate ? `${endDate}T00:00:00` : undefined,
        dose: Number(doseValue),
        dose_unit: doseUnit,
        frequency,
        route,
        withdrawal_until: withdrawalUntil,
        status: 'ACTIVO',
      });
      const pending = healthResult.pending || treatmentResult.pending;
      const message = treatmentResult.lastError ?? healthResult.lastError
        ?? (pending
          ? 'El evento y el tratamiento quedaron en la cola local.'
          : 'El evento de salud y su tratamiento se guardaron correctamente.');
      showNotification({
        type: pending ? 'alert' : 'success',
        title: pending ? 'Cambios pendientes de sincronización' : 'Evento y tratamiento guardados',
        message,
      });
      navigate(-1);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo guardar el evento sanitario.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Botón Volver / NAVEGACIÓN */}
      <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        <span>Volver a Salud y tratamientos</span>
      </button>

      {/* ENCABEZADO DE PÁGINA */}
      <header className="mb-4">
        <span className={styles.sectionSubtitle}>HEALTH_EVENTS + TREATMENTS</span>
        <h1 className={styles.sectionTitle}>Evento de salud y tratamiento</h1>
        <p className={styles.sectionDescription}>
          Crea el evento clínico y adjunta la prescripción.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* COLUMNA IZQUIERDA: FORMULARIO PRINCIPAL */}
          <div className="col-12 col-lg-8">
            <div className={styles.formCard}>
              {/* BLOQUE 1: EVENTO DE SALUD */}
              <div className={styles.stepHeader}>
                <div className={styles.stepBadge}>1</div>
                <div>
                  <h2 className={styles.stepTitle}>Evento de salud</h2>
                  <p className={styles.stepSubtitle}>Animal, diagnóstico y síntomas</p>
                </div>
              </div>

              <div className="row g-3 mb-4">
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
                </div>

                <div className="col-12 col-md-6">
                  <label className={styles.label}>Tipo de evento</label>
                  <select
                    className={styles.select}
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <option value="Enfermedad">Enfermedad</option>
                    <option value="Lesión">Lesión</option>
                    <option value="Control rutinario">Control rutinario</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className={styles.label}>Fecha del evento</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>

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

                <div className="col-12">
                  <label className={styles.label}>Diagnóstico</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Diagnóstico clínico"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className={styles.label}>Síntomas</label>
                  <textarea
                    rows={3}
                    className={styles.textarea}
                    placeholder="Describe los signos observados..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>
              </div>

              <hr className={styles.divider} />

              {/* BLOQUE 2: TRATAMIENTO ASOCIADO */}
              <div className={styles.stepHeader}>
                <div className={styles.stepBadge}>2</div>
                <div>
                  <h2 className={styles.stepTitle}>Tratamiento asociado</h2>
                  <p className={styles.stepSubtitle}>Medicamento, dosis y retiro</p>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <label className={styles.label}>Medicamento</label>
                  <select
                    className={styles.select}
                    value={medicationId}
                    onChange={(e) => setMedicationId(e.target.value)}
                    required
                  >
                    <option value="">Selecciona un medicamento</option>
                    {medications.map((medication) => (
                      <option key={String(medication.id)} value={String(medication.id)}>
                        {String(medication.name ?? '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className={styles.label}>Vía</label>
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
                  <label className={styles.label}>Fecha inicio</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className={styles.label}>Fecha fin</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className={styles.label}>Unidad de dosis</label>
                  <select
                    className={styles.select}
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                  >
                    <option value="mL">mL</option>
                    <option value="mg">mg</option>
                    <option value="g">g</option>
                    <option value="Dosis">Dosis</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className={styles.label}>Frecuencia</label>
                  <select
                    className={styles.select}
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="Cada 24 horas">Cada 24 horas</option>
                    <option value="Cada 48 horas">Cada 48 horas</option>
                    <option value="Dosis única">Dosis única</option>
                  </select>
                </div>
              </div>

              {/* BANNER RETIRO SANITARIO AUTOMÁTICO */}
              <div className={styles.withdrawalBanner}>
                <Bell size={20} className={styles.bellIcon} />
                <div>
                  <span className={styles.withdrawalTitle}>RETIRO CALCULADO AUTOMÁTICAMENTE</span>
                  <div className={styles.withdrawalText}>
                    {meatWithdrawalDate || milkWithdrawalDate
                      ? [
                        meatWithdrawalDate
                          ? `Carne hasta ${meatWithdrawalDate.toLocaleDateString('es-MX')}`
                          : null,
                        milkWithdrawalDate
                          ? `Leche hasta ${milkWithdrawalDate.toLocaleDateString('es-MX')}`
                          : null,
                      ].filter(Boolean).join(' · ')
                      : 'El catálogo no tiene días de retiro configurados para este medicamento.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: TECLADO DE DOSIS Y ACCIONES */}
          <div className="col-12 col-lg-4">
            <div className={styles.stickyColumn}>
              <DoseKeypad
                value={doseValue}
                unit={doseUnit}
                onChange={setDoseValue}
              />

              {/* BOTONES DE ACCIÓN PRINCIPALES */}
              <div className="d-flex align-items-center gap-3 mt-4">
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                  <CheckCircle size={18} />
                  <span>{isSaving ? 'Guardando…' : 'Guardar evento'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {submitError && <p role="alert" className="alert alert-danger mt-3">{submitError}</p>}
      </form>
    </div>
  );
};

export default HealthEventAndTreatmentPage;