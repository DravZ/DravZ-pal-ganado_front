import React from 'react';
import styles from './ExpenseTabSelector.module.css';
import { Scale, ArrowLeftRight, TrendingUp } from 'lucide-react';

export type ExpenseTabType = 'EXPENSES' | 'COST_ALLOCATIONS' | 'INCOME';

interface ExpenseTabSelectorProps {
  activeTab: ExpenseTabType;
  onChangeTab: (tab: ExpenseTabType) => void;
}

export const ExpenseTabSelector: React.FC<ExpenseTabSelectorProps> = ({
  activeTab,
  onChangeTab
}) => {
  return (
    <div className={styles.tabContainer}>
      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'EXPENSES' ? styles.active : ''}`}
        onClick={() => onChangeTab('EXPENSES')}
      >
        <Scale size={18} />
        <span>Gastos</span>
      </button>

      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'COST_ALLOCATIONS' ? styles.active : ''}`}
        onClick={() => onChangeTab('COST_ALLOCATIONS')}
      >
        <ArrowLeftRight size={18} />
        <span>Asignación de costos</span>
      </button>

      <button
        type="button"
        className={`${styles.tabBtn} ${activeTab === 'INCOME' ? styles.active : ''}`}
        onClick={() => onChangeTab('INCOME')}
      >
        <TrendingUp size={18} />
        <span>Ingresos</span>
      </button>
    </div>
  );
};

export default ExpenseTabSelector;