import React from 'react';
import { Beef, Bell, Package } from 'lucide-react';
import styles from './StatCards.module.css';

export const StatCards: React.FC = () => {
  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <div className={styles.statCard}>
          <div className={`${styles.statIconBadge} ${styles.iconBadgeGreen}`}>
            <Beef size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className={styles.statValue}>1,284</div>
            <div className={styles.statLabel}>ANIMALES ACTIVOS</div>
            <div className={styles.statSubtext}>
              <span className={styles.statSubtextBold}>+18</span> este mes
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className={styles.statCard}>
          <div className={`${styles.statIconBadge} ${styles.iconBadgeYellow}`}>
            <Bell size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className={styles.statValue}>7</div>
            <div className={styles.statLabel}>ALERTAS PENDIENTES</div>
            <div className={styles.statSubtext}>
              <span className={styles.statSubtextBold}>3 urgentes</span> por revisar
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className={styles.statCard}>
          <div className={`${styles.statIconBadge} ${styles.iconBadgeRed}`}>
            <Package size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className={styles.statValue}>4</div>
            <div className={styles.statLabel}>PRODUCTOS CON STOCK BAJO</div>
            <div className={styles.statSubtext}>Por debajo del nivel mínimo</div>
          </div>
        </div>
      </div>
    </div>
  );
};