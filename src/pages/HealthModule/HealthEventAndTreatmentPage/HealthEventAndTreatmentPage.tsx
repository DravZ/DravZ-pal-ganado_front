import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HealthEventAndTreatmentPage.module.css';
import DoseKeypad from './components/DoseKeypad/DoseKeypad';
import { ArrowLeft, Bell, CheckCircle } from 'lucide-react';

import type {
  Animal,
  Medication,
  HealthEvent,
  Treatment,
  SyncQueueEntry
} from '../../../types/database.types';

// Mocks fuertemente tipados
const MOCK_ANIMALS: (Animal & { identifier_tag: string })[] = [
  {
    id: 'a1088',
    farm_id: 'f1',
    name: 'Magnate',
    identifier_tag: 'BR-1088',
    breed: 'Angus',
    sex: 'Macho',
    species: 'bovino',
    status: 'active',
    created_at: '2026-01-01'
  },
  {
    id: 'a1042',
    farm_id: 'f1',
    name: 'Esperanza',
    identifier_tag: 'BR-1042',
    breed: 'Nelore',
    sex: 'Hembra',
    species: 'bovino',
    status: 'active',
    created_at: '2026-01-01'
  }
];

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 'm1',
    name: 'Oxitetraciclina LA',
    active_ingredient: 'Oxitetraciclina',
    presentation: 'Frasco 250 mL',
    route: 'Intramuscular',
    withdrawal_days_meat: 32,
    withdrawal_days_milk: 11,
    status: 'active'
  },
  {
    id: 'm2',
    name: 'Ivermectina 1%',
    active_ingredient: 'Ivermectina',
    presentation: 'Frasco 500 mL',
    route: 'Subcutánea',
    withdrawal_days_meat: 35,
    withdrawal_days_milk: 28,
    status: 'active'
  }
];

export const HealthEventAndTreatmentPage: React.FC = () => {
  const navigate = useNavigate();

  // Estado Sección 1: Evento de Salud
  const [animalId, setAnimalId] = useState<string>(MOCK_ANIMALS[0].id);
  const [eventType, setEventType] = useState<string>('Enfermedad');
  const [eventDate, setEventDate] = useState<string>('2025-06-16');
  const [veterinarian, setVeterinarian] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');

  // Estado Sección 2: Tratamiento Asociado
  const [medicationId, setMedicationId] = useState<string>(MOCK_MEDICATIONS[0].id);
  const [route, setRoute] = useState<string>('Intramuscular');
  const [startDate, setStartDate] = useState<string>('2025-06-16');
  const [endDate, setEndDate] = useState<string>('2025-06-20');
  const [doseUnit, setDoseUnit] = useState<string>('mL');
  const [frequency, setFrequency] = useState<string>('Cada 24 horas');
  const [doseValue, setDoseValue] = useState<string>('20');

  const selectedMed = MOCK_MEDICATIONS.find((m) => m.id === medicationId) || MOCK_MEDICATIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const healthEventId = crypto.randomUUID();
    const treatmentId = crypto.randomUUID();

    // 1. DTO Health Event
    const healthEventPayload: HealthEvent = {
      id: healthEventId,
      animal_id: animalId,
      event_type: eventType,
      event_date: new Date(eventDate).toISOString(),
      diagnosis,
      symptoms,
      veterinarian_name: veterinarian
    };

    // 2. DTO Treatment
    const treatmentPayload: Treatment = {
      id: treatmentId,
      animal_id: animalId,
      health_event_id: healthEventId,
      medication_id: medicationId,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      dose: parseFloat(doseValue) || 0,
      dose_unit: doseUnit,
      frequency,
      route,
      status: 'ACTIVO'
    };

    // 3. Queue Offline Transactions
    const syncQueueEvent: SyncQueueEntry<HealthEvent> = {
      id: crypto.randomUUID(),
      entity_name: 'health_events',
      entity_id: healthEventId,
      operation_type: 'CREATE',
      payload: healthEventPayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    const syncQueueTreatment: SyncQueueEntry<Treatment> = {
      id: crypto.randomUUID(),
      entity_name: 'treatments',
      entity_id: treatmentId,
      operation_type: 'CREATE',
      payload: treatmentPayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Evento de salud registrado:', healthEventPayload);
    console.log('[Action Log]: Tratamiento registrado:', treatmentPayload);
    console.log('[Sync Queue]:', syncQueueEvent, syncQueueTreatment);

    navigate(-1);
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
                  >
                    {MOCK_ANIMALS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.identifier_tag} · {a.name} · {a.breed}
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
                  >
                    {MOCK_MEDICATIONS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
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
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className={styles.label}>Fecha fin</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
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
                    Carne hasta 18 jul 2025 · Leche hasta 27 jun 2025
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
                <button type="submit" className={styles.saveBtn}>
                  <CheckCircle size={18} />
                  <span>Guardar evento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HealthEventAndTreatmentPage;