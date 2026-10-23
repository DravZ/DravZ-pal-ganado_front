import React from 'react';
import styles from './HealthTabSelector.module.css';
import { Syringe, Stethoscope, Package } from 'lucide-react';
import type { HealthTabType } from '../../HealthAndTreatmentsPage';

interface HealthTabSelectorProps {
  activeTab: HealthTabType;
  onChangeTab: (tab: HealthTabType) => void;
}

export const HealthTabSelector: React.FC<HealthTabSelectorProps> = ({
  activeTab,
  onChangeTab
}) => {
  return (
    <div className={styles.tabContainer}>
      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'EVENTS' ? styles.active : ''}`}
        onClick={() => onChangeTab('EVENTS')}
      >
        <Stethoscope size={18} />
        <span>Eventos y tratamientos</span>
      </button>

      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'VACCINATION' ? styles.active : ''}`}
        onClick={() => onChangeTab('VACCINATION')}
      >
        <Syringe size={18} />
        <span>Vacunación</span>
      </button>

      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'MEDICATIONS' ? styles.active : ''}`}
        onClick={() => onChangeTab('MEDICATIONS')}
      >
        <Package size={18} />
        <span>Medicamentos</span>
      </button>
    </div>
  );
};

export default HealthTabSelector;