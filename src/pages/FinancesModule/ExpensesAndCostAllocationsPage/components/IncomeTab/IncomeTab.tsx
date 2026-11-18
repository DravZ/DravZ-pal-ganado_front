import React, { useState } from 'react';
import styles from './IncomeTab.module.css';
import { Search } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';
import { useDerivedFinanceMovements } from '../../../../../services/financeDerivations';

const money = (value: number) => value.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

const amountOf = (value: unknown) => Number(value ?? 0) || 0;

const ORIGIN_LABELS: Record<string, string> = {
  SALE: 'Venta',
  PRODUCTION: 'Producción',
};

const originLabel = (referenceType: unknown): string =>
  ORIGIN_LABELS[String(referenceType ?? '').toUpperCase()] ?? 'Otro';

export const IncomeTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { scope } = useFarmScope();
  const { records: financialRecords, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'financial_records',
    '/financial-records',
    scope,
  );
  const { incomes: derivedIncomes } = useDerivedFinanceMovements(scope);
  const filtered = [...financialRecords, ...derivedIncomes]
    .filter((record) => String(record.transaction_type ?? '').toUpperCase() === 'INCOME')
    .filter((record) => {
      const query = searchTerm.toLowerCase();
      return String(record.description ?? '').toLowerCase().includes(query)
        || String(record.category ?? '').toLowerCase().includes(query)
        || originLabel(record.reference_type).toLowerCase().includes(query);
    })
    .sort((left, right) => String(right.record_date ?? '').localeCompare(String(left.record_date ?? '')));
  const total = filtered.reduce((sum, record) => sum + amountOf(record.amount), 0);

  return (
    <div className={styles.cardBox}>
      <div className={styles.cardHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>INCOME</span>
          <h2 className={styles.cardTitle}>Ingresos registrados</h2>
          <span className={styles.subText}>
            Las ventas y la producción con ingresos se registran automáticamente aquí.
          </span>
        </div>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar ingreso..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>
      <div className={styles.tableResponsiveContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>DESCRIPCIÓN</th>
              <th>FECHA</th>
              <th>ORIGEN</th>
              <th>CATEGORÍA</th>
              <th>MONTO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={String(record.id)}>
                <td className="fw-bold">
                  {String(record.description ?? 'Ingreso')}
                  {Boolean(record.derived) && (
                    <div className={styles.subText}>Pendiente de sincronización</div>
                  )}
                </td>
                <td>{String(record.record_date ?? '').slice(0, 10)}</td>
                <td><span className={styles.originBadge}>{originLabel(record.reference_type)}</span></td>
                <td><span className={styles.categoryBadge}>{String(record.category ?? 'Sin categoría')}</span></td>
                <td className={`fw-bold ${styles.incomeAmount}`}>{money(amountOf(record.amount))}</td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center text-secondary py-4">{error ?? 'No hay ingresos registrados para esta finca.'}</td></tr>
            )}
            {isLoading && <tr><td colSpan={5} role="status" className="text-center text-secondary py-4">Cargando ingresos…</td></tr>}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 && (
        <div className={styles.totalRow}>
          <span>Total de ingresos</span>
          <span className={styles.incomeAmount}>{money(total)}</span>
        </div>
      )}
    </div>
  );
};

export default IncomeTab;
