import React, { useState } from 'react';
import styles from './EventsAndTreatmentsTab.module.css';
import { Syringe, Bell, Activity, Search, Beef } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

export const EventsAndTreatmentsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [now] = useState(() => Date.now());
  const { scope } = useFarmScope();
  const { records: healthRecords, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'health_records',
    '/health-records',
    scope,
  );
  const { records: treatments } = useHatoCollection<Record<string, unknown>>(
    'treatments',
    '/treatments',
    scope,
  );
  const { records: animals } = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);
  const { records: medications } = useHatoCollection<Record<string, unknown>>(
    'medications',
    '/medications',
    scope,
  );
  const activeTreatments = treatments.filter((treatment) =>
    String(treatment.status ?? '').toUpperCase() === 'ACTIVO',
  );
  const withdrawals = treatments.flatMap((treatment) => {
    const until = String(treatment.withdrawal_until ?? '');
    const untilTime = Date.parse(until);
    if (!until || !Number.isFinite(untilTime) || untilTime < now) return [];
    const animalId = String(treatment.animal_id ?? '');
    const animal = animals.find((entry) => entry.id === animalId);
    const medication = medications.find((entry) => entry.id === treatment.medication_id);
    return [{
      id: String(treatment.id),
      daysRemaining: Math.ceil((untilTime - now) / 86_400_000),
      animalTag: String(animal?.tag_number ?? animal?.identifier_tag ?? animalId),
      animalName: String(animal?.name ?? 'Sin nombre'),
      medication: String(medication?.name ?? 'Medicamento'),
      untilDate: new Date(untilTime).toLocaleDateString('es-MX'),
    }];
  });
  const events = healthRecords.map((record) => {
    const animalId = String(record.animal_id ?? '');
    const animal = animals.find((entry) => entry.id === animalId);
    const treatment = treatments.find((entry) => entry.health_event_id === record.id);
    const medication = medications.find((entry) => entry.id === treatment?.medication_id);
    const active = treatment
      && String(treatment.status ?? '').toUpperCase() === 'ACTIVO'
      && (!treatment.end_date || Date.parse(String(treatment.end_date)) >= now);
    return {
      id: String(record.id),
      animalId,
      animalTag: String(animal?.tag_number ?? animal?.identifier_tag ?? animalId),
      animalName: String(animal?.name ?? 'Sin nombre'),
      breed: String(animal?.breed ?? '—'),
      diagnosis: String(record.diagnosis ?? record.event_type ?? 'Evento sanitario'),
      symptoms: String(record.symptoms ?? ''),
      eventDate: String(record.event_date ?? ''),
      medication: treatment ? String(medication?.name ?? 'Tratamiento') : '',
      dose: treatment ? `${treatment.dose ?? ''} ${treatment.dose_unit ?? ''}`.trim() : '',
      frequency: treatment ? String(treatment.frequency ?? '') : '',
      status: active ? 'En tratamiento' : 'Completado',
    };
  }).filter((event) => (
    event.animalTag.toLowerCase().includes(searchTerm.toLowerCase())
    || event.animalName.toLowerCase().includes(searchTerm.toLowerCase())
  ));
  const eventsThisMonth = healthRecords.filter((record) => {
    const date = Date.parse(String(record.event_date ?? ''));
    const current = new Date(now);
    const eventDate = new Date(date);
    return Number.isFinite(date)
      && eventDate.getMonth() === current.getMonth()
      && eventDate.getFullYear() === current.getFullYear();
  }).length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* TARJETAS DE MÉTRICAS */}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconGreen}>
              <Syringe size={22} />
            </div>
            <div>
              <span className={styles.metricLabel}>TRATAMIENTOS ACTIVOS</span>
              <div className={styles.metricValue}>{activeTreatments.length}</div>
              <span className={styles.metricSubtext}>Según el registro local sincronizado</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconYellow}>
              <Bell size={22} />
            </div>
            <div>
              <span className={styles.metricLabel}>EN RETIRO</span>
              <div className={styles.metricValue}>{withdrawals.length}</div>
              <span className={styles.metricSubtext}>Carne o leche restringida</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconBlue}>
              <Activity size={22} />
            </div>
            <div>
              <span className={styles.metricLabel}>EVENTOS ESTE MES</span>
              <div className={styles.metricValue}>{eventsThisMonth}</div>
              <span className={styles.metricSubtextGreen}>Eventos registrados este mes</span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE PRINCIPAL: EVENTOS RECIENTES + RETIRO SANITARIO */}
      <div className="row g-4">
        {/* Tabla de Eventos Recientes */}
        <div className="col-12 col-lg-8">
          <div className={styles.cardBox}>
            <div className={styles.cardHeaderFlex}>
              <div>
                <span className={styles.dbLabel}>HEALTH_EVENTS</span>
                <h2 className={styles.cardTitle}>Eventos recientes</h2>
              </div>

              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar animal..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.tableResponsiveContainer}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th>ANIMAL</th>
                    <th>EVENTO / DIAGNÓSTICO</th>
                    <th>FECHA</th>
                    <th>TRATAMIENTO</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={styles.avatarIcon}>
                            <Beef size={18} color="#1e4b27" />
                          </div>
                          <div>
                            <div className="fw-bold">{item.animalTag}</div>
                            <div className={styles.subText}>
                              {item.animalName} · {item.breed}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold">{item.diagnosis}</div>
                        <div className={styles.subText}>{item.symptoms}</div>
                      </td>
                      <td>{item.eventDate}</td>
                      <td>
                        {item.medication && (
                          <>
                            <div className="fw-bold">{item.medication}</div>
                            <div className={styles.subText}>
                              {item.dose} · {item.frequency}
                            </div>
                          </>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            item.status === 'En tratamiento'
                              ? styles.statusActive
                              : styles.statusCompleted
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && events.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-secondary py-4">
                        {error ?? 'No hay eventos sanitarios para esta finca.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Lateral: Retiro Sanitario */}
        <div className="col-12 col-lg-4">
          <div className={styles.withdrawalCard}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className={styles.dbLabel}>RETIRO SANITARIO</span>
                <h2 className={styles.cardTitle}>Próximas liberaciones</h2>
              </div>
              <span className={styles.activePill}>{withdrawals.length} activos</span>
            </div>

            <div className="d-flex flex-column gap-3 mb-3">
              {withdrawals.map((w) => (
                <div key={w.id} className={styles.withdrawalItem}>
                  <div className={styles.daysBadge}>
                    <span className={styles.daysNumber}>{w.daysRemaining}</span>
                    <span className={styles.daysText}>días</span>
                  </div>

                  <div>
                    <div className={styles.withdrawalTitle}>
                      {w.animalTag} · {w.animalName}
                    </div>
                    <div className={styles.withdrawalSubtitle}>
                      Retiro sanitario · {w.medication}
                    </div>
                    <div className={styles.withdrawalDate}>Hasta {w.untilDate}</div>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <p className="text-secondary mb-0">No hay retiros sanitarios próximos registrados.</p>
              )}
            </div>

            {isLoading && <p role="status" className="text-secondary">Actualizando registros…</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsAndTreatmentsTab;