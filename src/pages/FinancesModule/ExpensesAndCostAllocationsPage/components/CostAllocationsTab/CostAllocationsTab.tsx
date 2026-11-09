import React, { useState } from 'react';
import styles from './CostAllocationsTab.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

const colors = ['#1e4b27', '#52796f', '#d97706', '#64748b', '#a855f7', '#0891b2'];
const money = (value: number) => value.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

export const CostAllocationsTab: React.FC = () => {
  const { scope } = useFarmScope();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const { records: allocations, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'cost_allocations',
    '/cost-allocations',
    scope,
  );
  const { records: expenses } = useHatoCollection<Record<string, unknown>>('expenses', '/expenses', scope);
  const { records: lots } = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const { records: animals } = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);

  const monthOptions = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - index);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return { value, label: date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) };
  });
  const monthAllocations = allocations.filter((allocation) =>
    String(allocation.allocation_date ?? '').startsWith(selectedMonth),
  );
  const byCategory = new Map<string, number>();
  const byLot = new Map<string, { amount: number; count: number }>();

  for (const allocation of monthAllocations) {
    const expense = expenses.find((item) => item.id === allocation.expense_id);
    const category = String(expense?.category ?? 'Otros');
    byCategory.set(category, (byCategory.get(category) ?? 0) + (Number(allocation.amount) || 0));
    if (typeof allocation.lot_id === 'string') {
      const current = byLot.get(allocation.lot_id) ?? { amount: 0, count: 0 };
      current.amount += Number(allocation.amount) || 0;
      current.count += 1;
      byLot.set(allocation.lot_id, current);
    }
  }

  const categoryRows = [...byCategory.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((left, right) => right.amount - left.amount);
  const lotRows = [...byLot.entries()]
    .map(([id, value]) => ({
      id,
      name: String(lots.find((lot) => lot.id === id)?.name ?? 'Lote'),
      ...value,
    }))
    .sort((left, right) => right.amount - left.amount);
  const totalAssigned = categoryRows.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses
    .filter((expense) => String(expense.expense_date ?? '').startsWith(selectedMonth))
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const unassigned = Math.max(totalExpenses - totalAssigned, 0);
  const maxLotAmount = Math.max(...lotRows.map((lot) => lot.amount), 1);
  const monthLabel = monthOptions.find((option) => option.value === selectedMonth)?.label ?? selectedMonth;
  const donutSegments = categoryRows.map((category, index) => ({
    ...category,
    color: colors[index % colors.length],
    percentage: totalAssigned ? category.amount / totalAssigned * 100 : 0,
    offset: 25 - categoryRows
      .slice(0, index)
      .reduce((sum, previous) => sum + (totalAssigned ? previous.amount / totalAssigned * 100 : 0), 0),
  }));

  return (
    <div className="row g-4">
      {error && <div className="col-12"><p role="alert" className="text-danger">{error}</p></div>}
      <div className="col-12 col-lg-5">
        <div className={styles.cardBox}>
          <div className={styles.headerFlex}>
            <div>
              <span className={styles.dbLabel}>COSTOS ASIGNADOS</span>
              <h2 className={styles.cardTitle}>Distribución por categoría</h2>
            </div>
            <select className={styles.monthSelect} value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
              {monthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="d-flex align-items-center gap-4 mt-4 flex-wrap">
            <div className={styles.donutContainer}>
              <svg viewBox="0 0 36 36" className={styles.donutSvg}>
                {donutSegments.map((segment) => (
                  <path
                    key={segment.name}
                    className={styles.donutSegment}
                    stroke={segment.color}
                    strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                    strokeDashoffset={segment.offset}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                ))}
              </svg>
              <div className={styles.donutCenter}>
                <span className={styles.centerValue}>{money(totalAssigned)}</span>
                <span className={styles.centerLabel}>ASIGNADO</span>
              </div>
            </div>
            <div className="d-flex flex-column gap-2">
              {categoryRows.map((category, index) => (
                <div key={category.name} className="d-flex align-items-center gap-2">
                  <span className={styles.dot} style={{ backgroundColor: colors[index % colors.length] }} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{category.name}</div>
                    <div className={styles.subText}>
                      {money(category.amount)} · {totalAssigned ? `${(category.amount / totalAssigned * 100).toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                </div>
              ))}
              {categoryRows.length === 0 && <p className="text-secondary mb-0">No hay asignaciones en {monthLabel}.</p>}
            </div>
          </div>
          <div className="mt-4">
            <span className={styles.dbLabel}>GASTOS SIN ASIGNAR · {monthLabel}</span>
            <div className={styles.cardTitle}>{money(unassigned)}</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-7">
        <div className={styles.cardBox}>
          <div className="mb-3">
            <span className={styles.dbLabel}>POR CENTRO DE COSTO</span>
            <h2 className={styles.cardTitle}>Lotes con mayor costo</h2>
          </div>
          <div className="d-flex flex-column gap-4 mt-3">
            {lotRows.map((lot) => (
              <div key={lot.id}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <span className="fw-bold d-block" style={{ fontSize: '0.9rem' }}>{lot.name}</span>
                    <span className={styles.subText}>{lot.count} asignación(es)</span>
                  </div>
                  <span className="fw-bold" style={{ fontSize: '1rem', color: '#0f172a' }}>{money(lot.amount)}</span>
                </div>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${lot.amount / maxLotAmount * 100}%` }} />
                </div>
              </div>
            ))}
            {!isLoading && lotRows.length === 0 && (
              <p className="text-secondary mb-0">No hay costos asignados a lotes en {monthLabel}.</p>
            )}
            {isLoading && <p role="status" className="text-secondary mb-0">Cargando asignaciones…</p>}
          </div>
          {animals.length > 0 && (
            <p className={styles.subText}>También hay {monthAllocations.filter((allocation) => typeof allocation.animal_id === 'string').length} asignación(es) directa(s) a animales.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostAllocationsTab;
