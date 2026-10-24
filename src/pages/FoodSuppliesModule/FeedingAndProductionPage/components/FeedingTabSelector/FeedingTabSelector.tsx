import React from 'react';
import styles from './FeedingTabSelector.module.css';
import { Package, Scale } from 'lucide-react';
import type { FeedingTabType } from '../../FeedingAndProductionPage';

interface FeedingTabSelectorProps {
  activeTab: FeedingTabType;
  onChangeTab: (tab: FeedingTabType) => void;
}

export const FeedingTabSelector: React.FC<FeedingTabSelectorProps> = ({
  activeTab,
  onChangeTab
}) => {
  return (
    <div className={styles.tabContainer}>
      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'FEEDING' ? styles.active : ''}`}
        onClick={() => onChangeTab('FEEDING')}
      >
        <Package size={18} />
        <span>Registros de alimentación</span>
      </button>

      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'PRODUCTION' ? styles.active : ''}`}
        onClick={() => onChangeTab('PRODUCTION')}
      >
        <Scale size={18} />
        <span>Producción</span>
      </button>
    </div>
  );
};

export default FeedingTabSelector;