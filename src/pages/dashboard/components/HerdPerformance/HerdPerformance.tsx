import React from 'react';
import styles from './HerdPerformance.module.css';

interface HerdPerformanceProps {
  averageWeight: number | null;
  weighedAnimalCount: number;
}

export const HerdPerformance: React.FC<HerdPerformanceProps> = ({
  averageWeight,
  weighedAnimalCount,
}) => {
  const displayWeight = averageWeight === null
    ? '—'
    : averageWeight.toLocaleString('es-MX', { maximumFractionDigits: 1 });

  return (
    <div className={styles.performanceCard}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className={styles.sectionKicker}>RENDIMIENTO DEL HATO</div>
          <h3 className={styles.sectionTitle}>Peso promedio</h3>
        </div>
      </div>

      <div className={styles.weightDisplay}>
        {displayWeight} <span className={styles.unitText}>kg</span>
      </div>

      <div className={styles.chartContainer}>
        <p className="mb-0 text-secondary">
          Promedio de {weighedAnimalCount} {weighedAnimalCount === 1 ? 'animal con peso registrado' : 'animales con peso registrado'}.
        </p>
      </div>
    </div>
  );
};