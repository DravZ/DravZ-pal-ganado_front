import React from 'react';
import styles from './AlertsFilterTabs.module.css';
import type { AlertFilterType } from '../../AlertsPage';

interface AlertsFilterTabsProps {
  activeTab: AlertFilterType;
  counts: {
    all: number;
    critical: number;
    high: number;
    upcoming: number;
  };
  onTabChange: (tab: AlertFilterType) => void;
}

export const AlertsFilterTabs: React.FC<AlertsFilterTabsProps> = ({
  activeTab,
  counts,
  onTabChange
}) => (
  <div className={styles.tabsGrid}>
    <button
      type="button"
      className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.activeTab : ''}`}
      onClick={() => onTabChange('ALL')}
    >
      <span className={styles.count}>{counts.all}</span>
      <span className={styles.label}>Todas</span>
    </button>

    <button
      type="button"
      className={`${styles.tabBtn} ${activeTab === 'CRITICAL' ? styles.activeTab : ''}`}
      onClick={() => onTabChange('CRITICAL')}
    >
      <span className={styles.count}>{counts.critical}</span>
      <span className={styles.label}>Críticas</span>
    </button>

    <button
      type="button"
      className={`${styles.tabBtn} ${activeTab === 'HIGH' ? styles.activeTab : ''}`}
      onClick={() => onTabChange('HIGH')}
    >
      <span className={styles.count}>{counts.high}</span>
      <span className={styles.label}>Alta prioridad</span>
    </button>

    <button
      type="button"
      className={`${styles.tabBtn} ${activeTab === 'UPCOMING' ? styles.activeTab : ''}`}
      onClick={() => onTabChange('UPCOMING')}
    >
      <span className={styles.count}>{counts.upcoming}</span>
      <span className={styles.label}>Próximas</span>
    </button>
  </div>
);

export default AlertsFilterTabs;