import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterVaccinationPage.module.css';
import { ArrowLeft, CheckCircle, WifiOff } from 'lucide-react';

import type {
  Animal,
  Vaccination,
  SyncQueueEntry
} from '../../../types/database.types';

// Datos de prueba fuertemente tipados
const MOCK_ANIMALS: (Animal & { identifier_tag: string })[] = [
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
  },
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
    id: 'a1124',
    farm_id: 'f1',
    name: 'Canela',
    identifier_tag: 'BR-1124',
    breed: 'Braford',
    sex: 'Hembra',
    species: 'bovino',
    status: 'active',
    created_at: '2026-01-01'
  }
];

export const RegisterVaccinationPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados del formulario
  const [animalId, setAnimalId] = useState<string>(MOCK_ANIMALS[0].id);
  const [vaccineName, setVaccineName] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [veterinarian, setVeterinarian] = useState<string>('');
  const [applicationDate, setApplicationDate] = useState<string>('2025-06-16');
  const [nextDueDate, setNextDueDate] = useState<string>('2026-06-16');
  const [dose, setDose] = useState<string>('2');
  const [doseUnit, setDoseUnit] = useState<string>('mL');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!vaccineName.trim()) {
      newErrors.vaccineName = 'El nombre de la vacuna es obligatorio.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const vaccinationId = crypto.randomUUID();

    // 1. DTO de la tabla vaccinations
    const vaccinationPayload: Vaccination = {
      id: vaccinationId,
      animal_id: animalId,
      vaccine_name: vaccineName,
      manufacturer: manufacturer || undefined,
      application_date: new Date(applicationDate).toISOString(),
      next_due_date: nextDueDate ? nextDueDate : undefined,
      dose: parseFloat(dose) || 0,
      dose_unit: doseUnit,
      veterinarian_name: veterinarian || undefined
    };

    // 2. Registro para la cola de sincronización offline (sync_queue)
    const syncQueueEntry: SyncQueueEntry<Vaccination> = {
      id: crypto.randomUUID(),
      entity_name: 'vaccinations',
      entity_id: vaccinationId,
      operation_type: 'CREATE',
      payload: vaccinationPayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Registrando vacunación:', vaccinationPayload);
    console.log('[Sync Queue Payload]:', syncQueueEntry);

    navigate(-1);
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
            >
              {MOCK_ANIMALS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.identifier_tag} · {a.name}
                </option>
              ))}
            </select>
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
            />
          </div>

          {/* Dosis y Unidad */}
          <div className="col-12">
            <label className={styles.label}>Dosis</label>
            <div className={styles.doseGroup}>
              <input
                type="number"
                step="0.1"
                className={styles.doseInput}
                value={dose}
                onChange={(e) => setDose(e.target.value)}
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
          </div>
        </div>

        {/* BANNER OFFLINE */}
        <div className={styles.offlineBanner}>
          <WifiOff size={20} className={styles.offlineIcon} />
          <div>
            <div className={styles.offlineTitle}>Disponible sin conexión</div>
            <div className={styles.offlineSubtitle}>
              Si no hay señal, se guardará en sync_queue.
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
          <button type="submit" className={styles.saveBtn}>
            <CheckCircle size={18} />
            <span>Guardar registro</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterVaccinationPage;