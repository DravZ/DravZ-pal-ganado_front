import React from 'react';
import { Beef, Bell, Package } from 'lucide-react';
import styles from './StatCards.module.css';

interface StatCardsProps {
  animalCount: number;
  alertCount: number;
  urgentAlertCount: number;
  lowStockCount: number;
  farmName: string;
  isLoading: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({
  animalCount,
  alertCount,
  urgentAlertCount,
  lowStockCount,
  farmName,
  isLoading,
}) => {
  const display = (value: number) => isLoading ? '…' : value.toLocaleString('es-MX');

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <div className={styles.statCard}>
          <div className={`${styles.statIconBadge} ${styles.iconBadgeGreen}`}>
            <Beef size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className={styles.statValue}>{display(animalCount)}</div>
            <div className={styles.statLabel}>ANIMALES ACTIVOS</div>
            <div className={styles.statSubtext}>{farmName || 'Finca activa'}</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className={styles.statCard}>
          <div className={`${styles.statIconBadge} ${styles.iconBadgeYellow}`}>
            <Bell size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className={styles.statValue}>{display(alertCount)}</div>
            <div className={styles.statLabel}>ALERTAS PENDIENTES</div>
            <div className={styles.statSubtext}>
              <span className={styles.statSubtextBold}>{display(urgentAlertCount)} urgentes</span> por revisar
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
            <div className={styles.statValue}>{display(lowStockCount)}</div>
            <div className={styles.statLabel}>PRODUCTOS CON STOCK BAJO</div>
            <div className={styles.statSubtext}>Por debajo del nivel mínimo</div>
          </div>
        </div>
      </div>
    </div>
  );
};