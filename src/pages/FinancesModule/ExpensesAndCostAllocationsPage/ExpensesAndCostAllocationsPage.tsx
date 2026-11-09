import React, { useState } from 'react';
import styles from './ExpensesAndCostAllocationsPage.module.css';
import { Plus } from 'lucide-react';
import ExpenseTabSelector, { type ExpenseTabType } from './components/ExpenseTabSelector/ExpenseTabSelector';
import ExpensesTab from './components/ExpensesTab/ExpensesTab';
import CostAllocationsTab from './components/CostAllocationsTab/CostAllocationsTab';
import CreateExpenseModal from './components/CreateExpenseModal/CreateExpenseModal';
import AssignCostModal from './components/AssignCostModal/AssignCostModal';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';

const money = (value: number) => value.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

export const ExpensesAndCostAllocationsPage: React.FC = () => {
  const { scope } = useFarmScope();
  const { records: expenses } = useHatoCollection<Record<string, unknown>>('expenses', '/expenses', scope);
  const { records: allocations } = useHatoCollection<Record<string, unknown>>(
    'cost_allocations',
    '/cost-allocations',
    scope,
  );
  const { records: animals } = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);
  const [activeTab, setActiveTab] = useState<ExpenseTabType>('EXPENSES');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const expensesThisMonth = expenses.filter((expense) => String(expense.expense_date ?? '').startsWith(month));
  const expensesTotal = expensesThisMonth.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const allocationsThisMonth = allocations.filter((allocation) => String(allocation.allocation_date ?? '').startsWith(month));
  const assignedTotal = allocationsThisMonth.reduce((sum, allocation) => sum + (Number(allocation.amount) || 0), 0);
  const activeAnimals = animals.filter((animal) => String(animal.status ?? '').toLowerCase() === 'active').length;
  const unassignedTotal = Math.max(expensesTotal - assignedTotal, 0);

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
            <div className={styles.kpiValue}>{money(expensesTotal)}</div>
            <span className={styles.kpiSubtextPositive}>{expensesThisMonth.length} gastos registrados este mes</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>COSTO POR ANIMAL</span>
            <div className={styles.kpiValue}>{money(activeAnimals ? expensesTotal / activeAnimals : 0)}</div>
            <span className={styles.kpiSubtext}>{activeAnimals} animales activos en la finca</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>SIN ASIGNAR</span>
            <div className={styles.kpiValueWarning}>{money(unassignedTotal)}</div>
            <span className={styles.kpiSubtext}>{Math.max(expensesThisMonth.length - allocationsThisMonth.length, 0)} gastos pendientes de asignación</span>
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