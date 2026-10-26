import React, { useState } from 'react';
import styles from './ExpensesAndCostAllocationsPage.module.css';
import { Plus } from 'lucide-react';
import ExpenseTabSelector, { type ExpenseTabType } from './components/ExpenseTabSelector/ExpenseTabSelector';
import ExpensesTab from './components/ExpensesTab/ExpensesTab';
import CostAllocationsTab from './components/CostAllocationsTab/CostAllocationsTab';
import CreateExpenseModal from './components/CreateExpenseModal/CreateExpenseModal';
import AssignCostModal from './components/AssignCostModal/AssignCostModal';

export const ExpensesAndCostAllocationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExpenseTabType>('EXPENSES');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* ENCABEZADO */}
      <div className={styles.headerFlex}>
        <div>
          <span className={styles.sectionSubtitle}>FINANZAS OPERATIVAS</span>
          <h1 className={styles.sectionTitle}>Gastos y asignación de costos</h1>
          <p className={styles.sectionDescription}>
            Controla egresos y distribuye costos por lote o animal.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => {
            if (activeTab === 'EXPENSES') {
              setIsExpenseModalOpen(true);
            } else {
              setIsAssignModalOpen(true);
            }
          }}
        >
          <Plus size={18} />
          <span>{activeTab === 'EXPENSES' ? 'Registrar gasto' : 'Asignar costo'}</span>
        </button>
      </div>

      {/* SELECTOR DE PESTAÑA */}
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-5">
          <ExpenseTabSelector activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>
      </div>

      {/* TARJETAS KPI RESUMEN */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>GASTOS ESTE MES</span>
            <div className={styles.kpiValue}>$28.6 M</div>
            <span className={styles.kpiSubtextPositive}>+3.4% vs. mayo</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>COSTO POR ANIMAL</span>
            <div className={styles.kpiValue}>$22,274</div>
            <span className={styles.kpiSubtext}>1,284 animales activos</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>SIN ASIGNAR</span>
            <div className={styles.kpiValueWarning}>$2.1 M</div>
            <span className={styles.kpiSubtext}>7 gastos pendientes</span>
          </div>
        </div>
      </div>

      {/* VISTA DE PESTAÑA ACTIVA */}
      {activeTab === 'EXPENSES' ? <ExpensesTab /> : <CostAllocationsTab />}

      {/* MODALES */}
      <CreateExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <AssignCostModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
};

export default ExpensesAndCostAllocationsPage;