import React from 'react';
import styles from './AnimalStats.module.css';
import type { AnimalItem } from '../AnimalTable/AnimalTable';

export const AnimalStats: React.FC<{ animals: AnimalItem[] }> = ({ animals }) => {
  const active = animals.filter((animal) => animal.status === 'Activo');
  const females = active.filter((animal) => animal.sex === 'Hembra').length;
  const males = active.length - females;
  const weights = active.map((animal) => animal.weight).filter((weight) => weight > 0);
  const averageWeight = weights.length
    ? Math.round(weights.reduce((total, weight) => total + weight, 0) / weights.length)
    : 0;

  return (
    <div className={styles.statsContainer}>
      <div className="row g-3">
        {/* Total Activos */}
        <div className={`col-6 col-md-3 ${styles.dividerCol}`}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>TOTAL ACTIVOS</span>
            <span className={styles.statValue}>{active.length.toLocaleString('es-CO')}</span>
            <span className={styles.statSubtext}>Animales activos en esta finca</span>
          </div>
        </div>

        {/* Hembras */}
        <div className={`col-6 col-md-3 ${styles.dividerCol}`}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>HEMBRAS</span>
            <span className={styles.statValue}>{females.toLocaleString('es-CO')}</span>
            <span className={styles.statSubtext}>Hembras activas</span>
          </div>
        </div>

        {/* Machos */}
        <div className={`col-6 col-md-3 ${styles.dividerCol}`}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>MACHOS</span>
            <span className={styles.statValue}>{males.toLocaleString('es-CO')}</span>
            <span className={styles.statSubtext}>Machos activos</span>
          </div>
        </div>

        {/* Peso Promedio */}
        <div className="col-6 col-md-3">
          <div className={styles.statItem}>
            <span className={styles.statLabel}>PESO PROMEDIO</span>
            <span className={styles.statValue}>
              {averageWeight.toLocaleString('es-CO')} <span className={styles.unitText}>kg</span>
            </span>
            <span className={styles.statSubtext}>Promedio de pesos registrados</span>
          </div>
        </div>
      </div>
    </div>
  );
};