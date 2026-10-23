import React, { useState } from 'react';
import styles from './SalesHistoryTable.module.css';
import type { Sale } from '../../../../types/database.types';

type SaleHistoryUI = Sale & {
  customer_name: string;
  total_weight: number;
};

const MOCK_SALES_HISTORY: SaleHistoryUI[] = [
  {
    id: 's1',
    farm_id: 'f9d12345-0000-0000-0000-000000000001',
    customer_id: 'c1111111-0000-0000-0000-111111111111',
    sale_number: 'VEN-2025-0047',
    customer_name: 'Frigorífico Central',
    sale_date: '12 jun 2025',
    total_weight: 2840,
    total: 27832000,
    payment_status: 'Pagada'
  },
  {
    id: 's2',
    farm_id: 'f9d12345-0000-0000-0000-000000000001',
    customer_id: 'c2222222-0000-0000-0000-222222222222',
    sale_number: 'VEN-2025-0046',
    customer_name: 'Cooperativa del Valle',
    sale_date: '03 jun 2025',
    total_weight: 1920,
    total: 18624000,
    payment_status: 'Pendiente'
  }
];

export const SalesHistoryTable: React.FC = () => {
  const [filterRange, setFilterRange] = useState<string>('30_DAYS');

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
            {MOCK_SALES_HISTORY.map((item) => (
              <tr key={item.id}>
                <td className="fw-bold">{item.sale_number}</td>
                <td>{item.customer_name}</td>
                <td>{item.sale_date}</td>
                <td>{item.total_weight.toLocaleString('es-CO')} kg</td>
                <td className="fw-bold">${(item.total || 0).toLocaleString('es-CO')}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      item.payment_status === 'Pagada' ? styles.badgePaid : styles.badgePending
                    }`}
                  >
                    {item.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación Responsiva */}
      <div className={styles.paginationFooter}>
        <span className={styles.paginationInfo}>Mostrando 1–2 de 48 ventas</span>
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
      </div>
    </div>
  );
};

export default SalesHistoryTable;