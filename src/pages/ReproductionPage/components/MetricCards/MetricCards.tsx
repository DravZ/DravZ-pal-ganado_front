import React from 'react';
import styles from './MetricCards.module.css';

export const MetricCards: React.FC = () => {
  return (
    <div className={`row g-3 ${styles.metricsContainer}`}>
      {/* 1. Gestaciones Activas */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className={styles.metricCard}>
          <div className={styles.metricKicker}>GESTACIONES ACTIVAS</div>
          <div className={styles.metricValue}>42</div>
          <p className={styles.metricSub}>
            <strong className="text-dark">6</strong> confirmadas este mes
          </p>
        </div>
      </div>

      {/* 2. Partos Próximos 30 Días */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className={styles.metricCard}>
          <div className={styles.metricKicker}>PARTOS PRÓXIMOS 30 DÍAS</div>
          <div className={styles.metricValue}>8</div>
          <p className={styles.metricSub}>El primero en 3 días</p>
        </div>
      </div>

      {/* 3. Tasa de Preñez */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className={styles.metricCard}>
          <div className={styles.metricKicker}>TASA DE PREÑEZ</div>
          <div className={styles.metricValue}>78%</div>
          <p className={styles.metricSub}>
            <span className="text-success font-weight-bold">+4.2%</span> vs. periodo anterior
          </p>
        </div>
      </div>

      {/* 4. Días Abiertos Promedio */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className={styles.metricCard}>
          <div className={styles.metricKicker}>DÍAS ABIERTOS PROMEDIO</div>
          <div className={styles.metricValue}>87</div>
          <p className={styles.metricSub}>Meta: menos de 90 días</p>
        </div>
      </div>
    </div>
  );
};