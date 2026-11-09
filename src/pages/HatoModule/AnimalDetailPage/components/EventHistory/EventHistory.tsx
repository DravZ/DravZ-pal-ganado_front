import React, { useState } from 'react';
import { ArrowRightLeft, Syringe, Beef } from 'lucide-react';
import styles from './EventHistory.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

export const EventHistory: React.FC<{ animalId: string }> = ({ animalId }) => {
  const [eventType, setEventType] = useState('Todos los eventos');
  const [period, setPeriod] = useState('Últimos 12 meses');
  const [now] = useState(() => Date.now());
  const { scope } = useFarmScope();
  const { records: reproductive } = useHatoCollection<Record<string, unknown>>(
    'reproductive_records',
    `/reproductive-records?animal_id=${encodeURIComponent(animalId)}`,
    scope,
  );
  const { records: treatments } = useHatoCollection<Record<string, unknown>>(
    'treatments',
    `/treatments?animal_id=${encodeURIComponent(animalId)}`,
    scope,
  );
  const { records: movements } = useHatoCollection<Record<string, unknown>>(
    'movements',
    '/movements',
    scope,
  );
  const events = [
    ...reproductive.map((record) => ({
      id: String(record.id),
      date: String(record.event_date ?? ''),
      type: 'Reproducción',
      title: String(record.event_type ?? 'Evento reproductivo'),
      details: String(record.notes ?? ''),
    })),
    ...treatments.map((record) => ({
      id: String(record.id),
      date: String(record.start_date ?? ''),
      type: 'Salud',
      title: 'Tratamiento',
      details: [record.medication_name, record.dose, record.dose_unit, record.route]
        .filter(Boolean).join(' · '),
    })),
    ...movements
      .filter((movement) => Array.isArray(movement.animals)
        && movement.animals.some((entry) =>
          typeof entry === 'object'
          && entry !== null
          && 'animal_id' in entry
          && entry.animal_id === animalId,
        ))
      .map((record) => ({
        id: String(record.id),
        date: String(record.movement_date ?? ''),
        type: 'Movimientos',
        title: String(record.movement_type ?? 'Movimiento'),
        details: String(record.reason ?? ''),
      })),
  ].sort((left, right) => right.date.localeCompare(left.date));
  const filteredEvents = events.filter((event) => {
    const time = Date.parse(event.date);
    const withinPeriod = period === 'Histórico completo'
      || (period === 'Año actual' && new Date(time).getFullYear() === new Date(now).getFullYear())
      || (period === 'Últimos 12 meses' && time >= now - 365 * 86_400_000);
    return withinPeriod && (eventType === 'Todos los eventos' || event.type === eventType);
  });

  return (
    <div>
      {/* Filtros de Eventos */}
      <div className={styles.filterCard}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label font-weight-bold fs-7 text-secondary">Tipo de evento</label>
            <select
              className={styles.selectControl}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="Todos los eventos">Todos los eventos</option>
              <option value="Movimientos">Movimientos</option>
              <option value="Salud">Salud</option>
              <option value="Reproducción">Reproducción</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label font-weight-bold fs-7 text-secondary">Periodo</label>
            <select
              className={styles.selectControl}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="Últimos 12 meses">Últimos 12 meses</option>
              <option value="Año actual">Año actual</option>
              <option value="Histórico completo">Histórico completo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista Timeline de Eventos */}
      <div className={styles.timelineCard}>
        {filteredEvents.map((event) => (
          <div className={styles.eventItem} key={`${event.type}-${event.id}`}>
            <div className={`${styles.iconSquare} ${
              event.type === 'Movimientos'
                ? styles.iconMovement
                : event.type === 'Salud' ? styles.iconHealth : styles.iconBirth
            }`}>
              {event.type === 'Movimientos'
                ? <ArrowRightLeft size={22} strokeWidth={2.2} />
                : event.type === 'Salud'
                  ? <Syringe size={22} strokeWidth={2.2} />
                  : <Beef size={22} strokeWidth={2.2} />}
            </div>
            <div className="flex-grow-1">
              <div className={styles.eventHeaderFlex}>
                <span className={styles.eventKicker}>{event.date} · {event.type.toUpperCase()}</span>
                <span className={`${styles.pillTag} ${
                  event.type === 'Movimientos'
                    ? styles.pillMovement
                    : event.type === 'Salud' ? styles.pillHealth : styles.pillReproduction
                }`}>{event.type}</span>
              </div>
              <h3 className={styles.eventTitle}>{event.title}</h3>
              {event.details && <p className={styles.eventSub}>{event.details}</p>}
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <p className="text-secondary mb-0">No hay eventos locales para los filtros seleccionados.</p>
        )}
      </div>
    </div>
  );
};