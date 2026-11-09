import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { MetricCards } from './components/MetricCards/MetricCards';
import { GestationCalendar } from './components/GestationCalendar/GestationCalendar';
import { UpcomingBirths } from './components/UpcomingBirths/UpcomingBirths';
import { RegisterReproductiveEventModal } from './components/RegisterReproductiveEventModal/RegisterReproductiveEventModal';
import styles from './ReproductionPage.module.css';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { queueHatoWrite, useHatoCollection } from '../../../services/hatoDataService';
import useNotification from '../../../hooks/useNotification';
import type { ReproductiveEventFormValues } from '../../../types/database.types';

export const ReproductionPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [now] = useState(() => Date.now());
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const { records: rawAnimals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const { records: rawRecords, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'reproductive_records',
    '',
    scope,
  );
  const animals = rawAnimals.map((animal) => ({
    id: String(animal.id ?? ''),
    tag: String(animal.identifier_tag ?? animal.tag_number ?? ''),
    name: String(animal.name ?? 'Sin nombre'),
    breed: String(animal.breed ?? 'Sin raza'),
    sex: String(animal.gender ?? animal.sex ?? ''),
    status: String(animal.status ?? ''),
  }));
  const reproductiveRecords = rawRecords.map((record) => ({
    id: String(record.id ?? ''),
    event_date: typeof record.event_date === 'string' ? record.event_date : undefined,
    expected_date: typeof record.expected_date === 'string' ? record.expected_date : undefined,
    expected_birth_date: typeof record.expected_birth_date === 'string'
      ? record.expected_birth_date
      : undefined,
    event_type: typeof record.event_type === 'string' ? record.event_type : undefined,
    pregnancy_status: typeof record.pregnancy_status === 'string'
      ? record.pregnancy_status
      : undefined,
  }));
  const births = rawRecords.flatMap((record) => {
    const expectedDate = String(record.expected_date ?? record.expected_birth_date ?? '');
    const due = new Date(`${expectedDate}T00:00:00`);
    const daysRemaining = Math.ceil((due.getTime() - now) / 86_400_000);
    if (!expectedDate || !Number.isFinite(due.getTime()) || daysRemaining < 0) return [];
    const animalId = String(record.animal_id ?? record.female_animal_id ?? '');
    const animal = animals.find((entry) => entry.id === animalId);
    const sireId = String(record.sire_id ?? record.male_animal_id ?? '');
    const sire = animals.find((entry) => entry.id === sireId);
    const eventDate = new Date(String(record.event_date ?? ''));
    const gestationDays = Number.isFinite(eventDate.getTime())
      ? Math.max(1, (due.getTime() - eventDate.getTime()) / 86_400_000)
      : 283;
    return [{
      id: animalId,
      tag: animal?.tag ?? String(record.animal_tag_number ?? animalId),
      name: animal?.name ?? 'Sin nombre',
      sire: sire ? `Toro ${sire.tag}` : 'Sin padre registrado',
      daysRemaining,
      expectedDate,
      progressPercent: Math.min(100, Math.max(0, Math.round(
        (1 - daysRemaining / gestationDays) * 100,
      ))),
    }];
  }).filter((birth) => birth.id && birth.daysRemaining <= 60);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSubmit = async (values: ReproductiveEventFormValues) => {
    if (!scope) throw new Error('No hay una finca autorizada seleccionada.');
    const result = await queueHatoWrite(scope, 'reproductive_records', 'CREATE', {
      female_animal_id: values.femaleAnimalId,
      event_type: values.eventType,
      event_date: values.eventDate,
      male_animal_id: values.maleAnimalId || undefined,
      expected_date: values.expectedDate || undefined,
      pregnancy_status: values.result || undefined,
    });
    showNotification({
      type: result.pending ? 'alert' : 'success',
      title: result.pending ? 'Evento pendiente de sincronización' : 'Evento registrado',
      message: result.pending
        ? result.lastError ?? 'El evento quedó guardado en la cola local.'
        : 'El evento reproductivo se registró correctamente.',
    });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Encabezado Superior */}
      <div className={`d-flex align-items-start justify-content-between mb-4 ${styles.pageHeaderFlex}`}>
        <div>
          <div className={styles.kickerText}>MANEJO REPRODUCTIVO</div>
          <h1 className={styles.pageTitle}>Reproducción</h1>
          <p className={styles.subText}>
            Monitorea servicios, gestaciones y fechas esperadas de parto.
          </p>
        </div>

        {/* Botón Principal */}
        <button
          type="button"
          className={styles.btnPrimaryAction}
          onClick={handleOpenModal}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Registrar evento</span>
        </button>
      </div>

      {/* 1. Tarjetas de Métricas */}
      <div className="mb-4">
        <MetricCards records={reproductiveRecords} />
      </div>

      {/* 2. Grid Dividido */}
      <div className="row g-3">
        <div className="col-12 col-lg-7 col-xl-8">
          <GestationCalendar
            onOpenModal={handleOpenModal}
            events={rawRecords.map((record) => ({
              expectedDate: String(record.expected_date ?? record.expected_birth_date ?? ''),
            }))}
          />
        </div>
        <div className="col-12 col-lg-5 col-xl-4">
          <UpcomingBirths births={births} />
        </div>
      </div>

      {/* Modal Interactivo de Registro de Evento */}
      <RegisterReproductiveEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        animals={animals}
        onSubmit={handleSubmit}
      />
      {isLoading && <p role="status">Cargando eventos reproductivos locales…</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
};

export default ReproductionPage;