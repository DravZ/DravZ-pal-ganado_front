import React, { useState } from 'react';
import styles from './EventsAndTreatmentsTab.module.css';
import { Syringe, Bell, Activity, Search, Beef } from 'lucide-react';
import type { HealthEvent, Treatment, Animal } from '../../../../types/database.types';

// Tipos adaptados a partir del esquema DBML usando los types globales
type HealthEventWithUI = HealthEvent & {
  animal: Animal & { identifier_tag: string };
  treatment?: Treatment & { medication_name: string };
  status: 'En tratamiento' | 'Completado';
};

type WithdrawalUI = {
  id: string;
  days_remaining: number;
  animal_tag: string;
  animal_name: string;
  type: 'Carne' | 'Leche';
  medication: string;
  until_date: string;
};

const MOCK_EVENTS: HealthEventWithUI[] = [
  {
    id: 'he-1',
    animal_id: 'a1088',
    event_type: 'Enfermedad respiratoria',
    event_date: '14 jun 2025',
    diagnosis: 'Enfermedad respiratoria',
    symptoms: 'Tos, fiebre y decaimiento',
    status: 'En tratamiento',
    animal: {
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
    treatment: {
      id: 't-1',
      animal_id: 'a1088',
      medication_id: 'm1',
      medication_name: 'Oxitetraciclina LA',
      start_date: '2025-06-14',
      dose: 20,
      dose_unit: 'mL',
      frequency: 'Cada 48 h'
    }
  },
  {
    id: 'he-2',
    animal_id: 'a1042',
    event_type: 'Control parasitario',
    event_date: '10 jun 2025',
    diagnosis: 'Control parasitario',
    symptoms: 'Tratamiento preventivo',
    status: 'Completado',
    animal: {
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
    treatment: {
      id: 't-2',
      animal_id: 'a1042',
      medication_id: 'm2',
      medication_name: 'Ivermectina 1%',
      start_date: '2025-06-10',
      dose: 10,
      dose_unit: 'mL',
      frequency: 'Dosis única'
    }
  },
  {
    id: 'he-3',
    animal_id: 'a1124',
    event_type: 'Lesión podal',
    event_date: '06 jun 2025',
    diagnosis: 'Lesión podal',
    symptoms: 'Cojera miembro posterior',
    status: 'Completado',
    animal: {
      id: 'a1124',
      farm_id: 'f1',
      name: 'Canela',
      identifier_tag: 'BR-1124',
      breed: 'Braford',
      sex: 'Hembra',
      species: 'bovino',
      status: 'active',
      created_at: '2026-01-01'
    },
    treatment: {
      id: 't-3',
      animal_id: 'a1124',
      medication_id: 'm3',
      medication_name: 'Flunixin 5%',
      start_date: '2025-06-06',
      dose: 8,
      dose_unit: 'mL',
      frequency: 'Cada 24 h'
    }
  }
];

const MOCK_WITHDRAWALS: WithdrawalUI[] = [
  {
    id: 'w1',
    days_remaining: 2,
    animal_tag: 'BR-1124',
    animal_name: 'Canela',
    type: 'Leche',
    medication: 'Flunixin 5%',
    until_date: 'Hasta 18 jun 2025'
  },
  {
    id: 'w2',
    days_remaining: 7,
    animal_tag: 'BR-1088',
    animal_name: 'Magnate',
    type: 'Carne',
    medication: 'Oxitetraciclina',
    until_date: 'Hasta 23 jun 2025'
  },
  {
    id: 'w3',
    days_remaining: 22,
    animal_tag: 'BR-1042',
    animal_name: 'Esperanza',
    type: 'Carne',
    medication: 'Ivermectina',
    until_date: 'Hasta 08 jul 2025'
  }
];

export const EventsAndTreatmentsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = MOCK_EVENTS.filter(
    (e) =>
      e.animal.identifier_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.animal.name && e.animal.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <div className={styles.metricValue}>12</div>
              <span className={styles.metricSubtext}>4 finalizan esta semana</span>
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
              <div className={styles.metricValue}>8</div>
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
              <div className={styles.metricValue}>34</div>
              <span className={styles.metricSubtextGreen}>-8% frente al mes anterior</span>
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
                  {filteredEvents.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={styles.avatarIcon}>
                            <Beef size={18} color="#1e4b27" />
                          </div>
                          <div>
                            <div className="fw-bold">{item.animal.identifier_tag}</div>
                            <div className={styles.subText}>
                              {item.animal.name} · {item.animal.breed}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold">{item.diagnosis}</div>
                        <div className={styles.subText}>{item.symptoms}</div>
                      </td>
                      <td>{item.event_date}</td>
                      <td>
                        {item.treatment && (
                          <>
                            <div className="fw-bold">{item.treatment.medication_name}</div>
                            <div className={styles.subText}>
                              {item.treatment.dose} {item.treatment.dose_unit} ·{' '}
                              {item.treatment.frequency}
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
              <span className={styles.activePill}>8 activos</span>
            </div>

            <div className="d-flex flex-column gap-3 mb-3">
              {MOCK_WITHDRAWALS.map((w) => (
                <div key={w.id} className={styles.withdrawalItem}>
                  <div className={styles.daysBadge}>
                    <span className={styles.daysNumber}>{w.days_remaining}</span>
                    <span className={styles.daysText}>días</span>
                  </div>

                  <div>
                    <div className={styles.withdrawalTitle}>
                      {w.animal_tag} · {w.animal_name}
                    </div>
                    <div className={styles.withdrawalSubtitle}>
                      {w.type} · {w.medication}
                    </div>
                    <div className={styles.withdrawalDate}>{w.until_date}</div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className={styles.secondaryBtn}>
              Ver todos los retiros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsAndTreatmentsTab;