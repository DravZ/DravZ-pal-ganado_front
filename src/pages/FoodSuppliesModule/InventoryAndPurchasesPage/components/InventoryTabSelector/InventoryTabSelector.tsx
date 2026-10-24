import React from 'react';
import styles from './InventoryTabSelector.module.css';
import { Package, ArrowLeftRight } from 'lucide-react';
import type { InventoryTabType } from '../../InventoryAndPurchasesPage';

interface InventoryTabSelectorProps {
  activeTab: InventoryTabType;
  onChangeTab: (tab: InventoryTabType) => void;
}

export const InventoryTabSelector: React.FC<InventoryTabSelectorProps> = ({
  activeTab,
  onChangeTab
}) => {
  return (
    <div className={styles.tabContainer}>
      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'PRODUCTS' ? styles.active : ''}`}
        onClick={() => onChangeTab('PRODUCTS')}
      >
        <Package size={18} />
        <span>Productos y existencias</span>
      </button>

      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'PURCHASES' ? styles.active : ''}`}
        onClick={() => onChangeTab('PURCHASES')}
      >
        <ArrowLeftRight size={18} />
        <span>Compras y entradas</span>
      </button>
    </div>
  );
};

export default InventoryTabSelector;