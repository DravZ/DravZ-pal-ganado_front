import React, { useState } from 'react';
import styles from './ExpensesTab.module.css';
import { Search } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

const money = (value: number) => value.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

const amountOf = (value: unknown) => Number(value ?? 0) || 0;

export const ExpensesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { scope } = useFarmScope();
  const { records: expenses, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'expenses',
    '/expenses',
    scope,
  );
  const { records: allocations } = useHatoCollection<Record<string, unknown>>(
    'cost_allocations',
    '/cost-allocations',
    scope,
  );
  const { records: suppliers } = useHatoCollection<Record<string, unknown>>(
    'suppliers',
    '/suppliers',
    scope,
  );
  const filtered = [...expenses]
    .filter((expense) => {
      const supplier = suppliers.find((item) => item.id === expense.supplier_id);
      const query = searchTerm.toLowerCase();
      return String(expense.description ?? '').toLowerCase().includes(query)
        || String(supplier?.name ?? '').toLowerCase().includes(query)
        || String(expense.category ?? '').toLowerCase().includes(query);
    })
    .sort((left, right) => String(right.expense_date ?? '').localeCompare(String(left.expense_date ?? '')));

  return (
    <div className={styles.cardBox}>
      <div className={styles.cardHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>EXPENSES</span>
          <h2 className={styles.cardTitle}>Movimientos recientes</h2>
        </div>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar gasto..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>
      {error && <p role="alert" className="text-danger">{error}</p>}
      <div className={styles.tableResponsiveContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>DESCRIPCIÓN / PROVEEDOR</th>
              <th>FECHA</th>
              <th>CATEGORÍA</th>
              <th>ASIGNACIÓN</th>
              <th>MONTO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((expense) => {
              const allocationsForExpense = allocations.filter((allocation) =>
                allocation.expense_id === expense.id,
              );
              const allocated = allocationsForExpense.reduce(
                (sum, allocation) => sum + amountOf(allocation.amount),
                0,
              );
              const assigned = allocated >= amountOf(expense.amount) && amountOf(expense.amount) > 0;
              const supplier = suppliers.find((item) => item.id === expense.supplier_id);
              return (
                <tr key={String(expense.id)}>
                  <td>
                    <div className="fw-bold">{String(expense.description ?? 'Gasto')}</div>
                    <div className={styles.subText}>{String(supplier?.name ?? 'Proveedor no especificado')}</div>
                  </td>
                  <td>{String(expense.expense_date ?? '').slice(0, 10)}</td>
                  <td><span className={styles.categoryBadge}>{String(expense.category ?? 'Sin categoría')}</span></td>
                  <td>{assigned ? `${allocationsForExpense.length} asignación(es)` : 'Sin asignar'}</td>
                  <td className="fw-bold">{money(amountOf(expense.amount))}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${assigned ? styles.badgeAssigned : styles.badgePending}`}>
                      {assigned ? 'Asignado' : 'Pendiente'}
                    </span>
                    {String(expense.id ?? '').startsWith('local:') && (
                      <div className={styles.subText}>Pendiente de sincronización</div>
                    )}
                  </td>
                </tr>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-secondary py-4">{error ?? 'No hay gastos registrados para esta finca.'}</td></tr>
            )}
            {isLoading && <tr><td colSpan={6} role="status" className="text-center text-secondary py-4">Cargando gastos…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesTab;
