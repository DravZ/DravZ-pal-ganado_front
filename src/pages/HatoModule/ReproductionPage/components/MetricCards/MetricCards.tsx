import React from 'react';
import styles from './MetricCards.module.css';

interface ReproductiveRecord {
  id: string;
  event_date?: string;
  expected_date?: string;
  expected_birth_date?: string;
  event_type?: string;
  pregnancy_status?: string;
}

export const MetricCards: React.FC<{ records: ReproductiveRecord[] }> = ({ records }) => {
  const today = new Date();
  const upcoming = records.filter((record) => {
    const date = Date.parse(record.expected_date ?? record.expected_birth_date ?? '');
    return date >= today.getTime() && date <= today.getTime() + 30 * 86_400_000;
  });
  const pregnant = records.filter((record) =>
    ['confirmado', 'gestante', 'embarazada'].includes(
      (record.pregnancy_status ?? '').toLocaleLowerCase(),
    ),
  );
  const confirmedThisMonth = records.filter((record) => {
    const date = new Date(record.event_date ?? '');
    return record.pregnancy_status?.toLocaleLowerCase() === 'confirmado'
      && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear();
  }).length;

  return (
    <div className={`row g-3 ${styles.metricsContainer}`}>
      {/* 1. Gestaciones Activas */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className={styles.metricCard}>
          <div className={styles.metricKicker}>GESTACIONES ACTIVAS</div>
          <div className={styles.metricValue}>{pregnant.length}</div>
          <p className={styles.metricSub}>
            <strong className="text-dark">{confirmedThisMonth}</strong> confirmadas este mes
          </p>
        </div>
      </div>

      {/* 2. Partos Próximos 30 Días */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className={styles.metricCard}>
          <div className={styles.metricKicker}>PARTOS PRÓXIMOS 30 DÍAS</div>
          <div className={styles.metricValue}>{upcoming.length}</div>
          <p className={styles.metricSub}>Según fechas registradas</p>
        </div>
      </div>

      {/* 3. Tasa de Preñez */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className={styles.metricCard}>
          <div className={styles.metricKicker}>TASA DE PREÑEZ</div>
          <div className={styles.metricValue}>—</div>
          <p className={styles.metricSub}>No disponible con los datos actuales</p>
        </div>
      </div>

      {/* 4. Días Abiertos Promedio */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className={styles.metricCard}>
          <div className={styles.metricKicker}>DÍAS ABIERTOS PROMEDIO</div>
          <div className={styles.metricValue}>—</div>
          <p className={styles.metricSub}>No disponible con los datos actuales</p>
        </div>
      </div>
    </div>
  );
};