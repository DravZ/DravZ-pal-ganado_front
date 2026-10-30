import React from 'react';
import styles from './AlertsHeader.module.css';

interface AlertsHeaderProps {
  pendingCount: number;
}

export const AlertsHeader: React.FC<AlertsHeaderProps> = ({ pendingCount }) => (
  <div className={styles.headerFlex}>
    <div>
      <span className={styles.subtitle}>CENTRO DE ATENCIÓN</span>
      <h1 className={styles.title}>Alertas activas</h1>
      <p className={styles.description}>
        Prioriza eventos sanitarios, operativos y productivos que requieren acción.
      </p>
    </div>

    {pendingCount > 0 && (
      <div className={styles.attentionBadge}>
        <span>{pendingCount} requieren atención</span>
      </div>
    )}
  </div>
);

export default AlertsHeader;