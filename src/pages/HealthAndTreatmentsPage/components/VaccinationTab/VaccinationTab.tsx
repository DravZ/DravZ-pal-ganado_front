import React from 'react';
import styles from './VaccinationTab.module.css';

interface ScheduledVaccineUI {
  id: string;
  day: string;
  month: string;
  vaccine_name: string;
  animal_count: number;
  lot_name: string;
}

const MOCK_SCHEDULED_VACCINES: ScheduledVaccineUI[] = [
  {
    id: 'v1',
    day: '18',
    month: 'JUN',
    vaccine_name: 'Clostridial 8 vías',
    animal_count: 12,
    lot_name: 'Lote Vacas de cría'
  },
  {
    id: 'v2',
    day: '23',
    month: 'JUN',
    vaccine_name: 'Fiebre aftosa',
    animal_count: 14,
    lot_name: 'Lote Novillos'
  }
];

export const VaccinationTab: React.FC = () => {
  return (
    <div className="row g-4">
      {/* Calendario Sanitario */}
      <div className="col-12 col-lg-7">
        <div className={styles.cardBox}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className={styles.dbLabel}>CALENDARIO SANITARIO</span>
              <h2 className={styles.cardTitle}>Próximas vacunas</h2>
            </div>
            <select className={styles.monthSelect} defaultValue="JUN_2025">
              <option value="JUN_2025">Junio 2025</option>
              <option value="JUL_2025">Julio 2025</option>
            </select>
          </div>

          {/* Grid del Calendario */}
          <div className={styles.calendarGrid}>
            <div className={styles.dayHeader}>LUN</div>
            <div className={styles.dayHeader}>MAR</div>
            <div className={styles.dayHeader}>MIÉ</div>
            <div className={styles.dayHeader}>JUE</div>
            <div className={styles.dayHeader}>VIE</div>
            <div className={styles.dayHeader}>SÁB</div>
            <div className={styles.dayHeader}>DOM</div>

            {[27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
              <div key={d} className={styles.calendarCell}>{d}</div>
            ))}

            <div className={`${styles.calendarCell} ${styles.cellSelected}`}>11</div>
            <div className={styles.calendarCell}>12</div>
            <div className={styles.calendarCell}>13</div>

            <div className={`${styles.calendarCell} ${styles.cellHasDot}`}>
              14 <span className={styles.dot}></span>
            </div>

            {[15, 16, 17, 18].map((d) => (
              <div key={d} className={styles.calendarCell}>{d}</div>
            ))}

            <div className={`${styles.calendarCell} ${styles.cellHasDot}`}>
              19 <span className={styles.dot}></span>
            </div>

            {[20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((d) => (
              <div key={d} className={styles.calendarCell}>{d}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Programación Próximos 30 Días */}
      <div className="col-12 col-lg-5">
        <div className={styles.cardBox}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className={styles.dbLabel}>PRÓXIMOS 30 DÍAS</span>
              <h2 className={styles.cardTitle}>Vacunaciones programadas</h2>
            </div>
            <span className={styles.animalPill}>26 animales</span>
          </div>

          <div className="d-flex flex-column gap-3">
            {MOCK_SCHEDULED_VACCINES.map((item) => (
              <div key={item.id} className={styles.scheduledCard}>
                {/* Bloque de Fecha con Dimensiones Fijas */}
                <div className={styles.dateBlock}>
                  <span className={styles.dateDay}>{item.day}</span>
                  <span className={styles.dateMonth}>{item.month}</span>
                </div>

                {/* Información de la Vacuna */}
                <div className={styles.vaccineInfo}>
                  <div className={styles.vaccineTitle}>{item.vaccine_name}</div>
                  <div className={styles.vaccineSubtitle}>
                    {item.animal_count} animales · {item.lot_name}
                  </div>
                </div>

                {/* Botón de Acción */}
                <button type="button" className={styles.registerBtn}>
                  Registrar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationTab;