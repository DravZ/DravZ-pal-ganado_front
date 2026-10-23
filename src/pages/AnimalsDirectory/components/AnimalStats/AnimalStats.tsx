import React from 'react';
import styles from './AnimalStats.module.css';

export const AnimalStats: React.FC = () => {
  return (
    <div className={styles.statsContainer}>
      <div className="row g-3">
        {/* Total Activos */}
        <div className={`col-6 col-md-3 ${styles.dividerCol}`}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>TOTAL ACTIVOS</span>
            <span className={styles.statValue}>1,284</span>
            <span className={styles.statSubtext}>+18 este mes</span>
          </div>
        </div>

        {/* Hembras */}
        <div className={`col-6 col-md-3 ${styles.dividerCol}`}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>HEMBRAS</span>
            <span className={styles.statValue}>786</span>
            <span className={styles.statSubtext}>61% del hato</span>
          </div>
        </div>

        {/* Machos */}
        <div className={`col-6 col-md-3 ${styles.dividerCol}`}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>MACHOS</span>
            <span className={styles.statValue}>498</span>
            <span className={styles.statSubtext}>39% del hato</span>
          </div>
        </div>

        {/* Peso Promedio */}
        <div className="col-6 col-md-3">
          <div className={styles.statItem}>
            <span className={styles.statLabel}>PESO PROMEDIO</span>
            <span className={styles.statValue}>
              468 <span className={styles.unitText}>kg</span>
            </span>
            <span className={styles.statSubtext}>Últimos 30 días</span>
          </div>
        </div>
      </div>
    </div>
  );
};