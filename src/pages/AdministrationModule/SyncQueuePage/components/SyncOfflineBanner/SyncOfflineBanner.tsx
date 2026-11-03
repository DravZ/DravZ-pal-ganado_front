import React from 'react';
import { CloudOff } from 'lucide-react';
import styles from './SyncOfflineBanner.module.css';

interface SyncOfflineBannerProps {
  metrics: {
    pending: number;
    failed: number;
    synced: number;
  };
}

export const SyncOfflineBanner: React.FC<SyncOfflineBannerProps> = ({ metrics }) => (
  <div className={styles.bannerCard}>
    <div className={styles.leftInfo}>
      <div className={styles.iconCircle}>
        <CloudOff size={22} color="#ffffff" />
      </div>
      <div>
        <h3 className={styles.bannerTitle}>Modo offline activo</h3>
        <p className={styles.bannerDescription}>
          Los cambios locales están seguros y se enviarán en orden al recuperar la conexión.
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
      <div className={styles.divider} />
      <div className={styles.metricBox}>
        <span className={styles.metricLabel}>Sincronizados</span>
        <span className={styles.metricValue}>{metrics.synced}</span>
      </div>
    </div>
  </div>
);

export default SyncOfflineBanner;