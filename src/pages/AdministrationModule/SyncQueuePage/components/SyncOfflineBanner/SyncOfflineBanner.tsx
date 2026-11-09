import React from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import styles from './SyncOfflineBanner.module.css';

interface SyncOfflineBannerProps {
  metrics: {
    pending: number;
    failed: number;
  };
  isOnline: boolean;
}

export const SyncOfflineBanner: React.FC<SyncOfflineBannerProps> = ({ metrics, isOnline }) => (
  <div className={styles.bannerCard}>
    <div className={styles.leftInfo}>
      <div className={styles.iconCircle}>
        {isOnline
          ? <Cloud size={22} color="#ffffff" />
          : <CloudOff size={22} color="#ffffff" />}
      </div>
      <div>
        <h3 className={styles.bannerTitle}>{isOnline ? 'Conexión disponible' : 'Sin conexión'}</h3>
        <p className={styles.bannerDescription}>
          {isOnline
            ? 'Las operaciones pendientes se envían en orden. Los conflictos requieren revisión.'
            : 'Los cambios locales están seguros y se enviarán al recuperar la conexión.'}
        </p>
      </div>
    </div>

    <div className={styles.metricsGroup}>
      <div className={styles.metricBox}>
        <span className={styles.metricLabel}>Pendientes</span>
        <span className={styles.metricValue}>{metrics.pending}</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.metricBox}>
        <span className={styles.metricLabel}>Fallidos</span>
        <span className={`${styles.metricValue} ${styles.valFailed}`}>
          {metrics.failed}
        </span>
      </div>
    </div>
  </div>
);

export default SyncOfflineBanner;