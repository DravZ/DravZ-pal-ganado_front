import React from 'react';
import styles from './HerdPerformance.module.css';

export const HerdPerformance: React.FC = () => {
  return (
    <div className={styles.performanceCard}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className={styles.sectionKicker}>RENDIMIENTO DEL HATO</div>
          <h3 className={styles.sectionTitle}>Peso promedio</h3>
        </div>
        <span className={styles.trendBadge}>+3.8%</span>
      </div>

      <div className={styles.weightDisplay}>
        468 <span className={styles.unitText}>kg</span>
      </div>

      <div className={styles.chartContainer}>
        <svg viewBox="0 0 300 70" className={styles.svgChart}>
          <path
            d="M 10,55 Q 35,45 60,38 T 110,42 T 160,25 T 210,22 T 260,18 L 290,15"
            className={styles.chartLine}
          />
          <text x="20" y="68" className={styles.monthLabel}>JAN</text>
          <text x="70" y="68" className={styles.monthLabel}>FEB</text>
          <text x="120" y="68" className={styles.monthLabel}>MAR</text>
          <text x="170" y="68" className={styles.monthLabel}>APR</text>
          <text x="220" y="68" className={styles.monthLabel}>MAY</text>
          <text x="270" y="68" className={styles.monthLabel}>JUN</text>
        </svg>
      </div>
    </div>
  );
};