import React, { useState } from 'react';
import styles from './SalesHistoryTable.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

export const SalesHistoryTable: React.FC = () => {
  const [filterRange, setFilterRange] = useState<string>('30_DAYS');
  const [now] = useState(() => Date.now());
  const { scope } = useFarmScope();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'sales_records',
    '/sales-records',
    scope,
  );
  const cutoff = filterRange === '30_DAYS'
    ? now - 30 * 86_400_000
    : filterRange === '60_DAYS'
      ? now - 60 * 86_400_000
      : new Date(new Date(now).getFullYear(), 0, 1).getTime();
  const sales = records.filter((sale) => Date.parse(String(sale.sale_date ?? '')) >= cutoff);

  return (
    <div className={styles.tableCard}>
      {/* Encabezado Responsivo */}
      <div className={styles.cardHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>SALES · HISTORIAL</span>
          <h2 className={styles.sectionTitle}>Ventas recientes</h2>
        </div>

        <select
          className={styles.filterSelect}
          value={filterRange}
          onChange={(e) => setFilterRange(e.target.value)}
        >
          <option value="30_DAYS">Últimos 30 días</option>
          <option value="60_DAYS">Últimos 60 días</option>
          <option value="THIS_YEAR">Este año</option>
        </select>
      </div>

      {/* Contenedor de la Tabla con Scroll Horizontal Responsivo */}
      <div className={styles.tableResponsiveContainer}>
        <table className={styles.tableCustom}>
          <thead>
            <tr>
              <th>VENTA ↑↓</th>
              <th>CLIENTE ↑↓</th>
              <th>FECHA ↑↓</th>
              <th>PESO ↑↓</th>
              <th>TOTAL ↑↓</th>
              <th>ESTADO ↑↓</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((item) => {
              const lines = Array.isArray(item.lines) ? item.lines : [];
              const totalWeight = lines.reduce((total, line) =>
                total + (typeof line === 'object' && line !== null && 'weight' in line
                  ? Number(line.weight)
                  : 0), 0);
              const paymentStatus = String(item.payment_status ?? 'Sin estado');
              return (
              <tr key={String(item.id)}>
                <td className="fw-bold">{String(item.sale_number ?? '—')}</td>
                <td>{String(item.customer_name ?? '—')}</td>
                <td>{String(item.sale_date ?? '—')}</td>
                <td>{totalWeight.toLocaleString('es-CO')} kg</td>
                <td className="fw-bold">${Number(item.total ?? item.total_amount ?? 0).toLocaleString('es-CO')}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      paymentStatus.toLocaleLowerCase() === 'pagada'
                        || paymentStatus.toLocaleLowerCase() === 'paid'
                        ? styles.badgePaid
                        : styles.badgePending
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </td>
              </tr>
              );
            })}
            {sales.length === 0 && (
              <tr><td colSpan={6} className="text-center text-secondary">No hay ventas en el periodo seleccionado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación Responsiva */}
      <div className={styles.paginationFooter}>
        <span className={styles.paginationInfo}>Mostrando {sales.length} ventas</span>
        <div className={styles.paginationControls}>
          <button type="button" className={styles.pageBtn} disabled>
            Anterior
          </button>
          <button type="button" className={`${styles.pageBtn} ${styles.pageActive}`}>
            1
          </button>
          <button type="button" className={styles.pageBtn}>
            2
          </button>
          <button type="button" className={styles.pageBtn}>
            Siguiente
          </button>
        </div>
        {isLoading && <p role="status">Cargando ventas locales…</p>}
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  );
};

export default SalesHistoryTable;