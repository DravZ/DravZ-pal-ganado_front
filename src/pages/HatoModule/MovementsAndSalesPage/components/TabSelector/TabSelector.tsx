import React from 'react';
import styles from './TabSelector.module.css';
import { ArrowLeftRight, Scale, Users } from 'lucide-react';
import type { ActiveTab } from '../../MovementsAndSalesPage';

interface TabSelectorProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className={styles.tabContainer}>
      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'MOVEMENT' ? styles.active : ''}`}
        onClick={() => onChangeTab('MOVEMENT')}
      >
        <ArrowLeftRight size={18} />
        <span>Movimiento de ganado</span>
      </button>

      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'SALE' ? styles.active : ''}`}
        onClick={() => onChangeTab('SALE')}
      >
        <Scale size={18} />
        <span>Venta de ganado o producto</span>
      </button>

      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'CUSTOMERS' ? styles.active : ''}`}
        onClick={() => onChangeTab('CUSTOMERS')}
      >
        <Users size={18} />
        <span>Clientes</span>
      </button>
    </div>
  );
};

export default TabSelector;