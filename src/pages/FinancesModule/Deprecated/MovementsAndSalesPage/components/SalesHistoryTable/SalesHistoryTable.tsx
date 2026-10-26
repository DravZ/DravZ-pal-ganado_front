import React from 'react';
import styles from './SalesHistoryTable.module.css';
import type { Sale } from '../../../../../types/database.types';

type SaleHistoryUI = Sale & {
  customer_name: string;
  formatted_weight: string;
  formatted_total: string;
};

const MOCK_SALES_HISTORY: SaleHistoryUI[] = [
  {
    id: 's-1',
    farm_id: 'farm-1',
    customer_id: 'c-1',
    customer_name: 'Frigorífico Central',
    sale_number: 'VEN-2025-0047',
    sale_date: '12 jun 2025',
    subtotal: 27832000,
    tax: 0,
    total: 27832000,
    payment_status: 'Pagada',
    formatted_weight: '2,840 kg',
    formatted_total: '$27,832,000'
  },
  {
    id: 's-2',
    farm_id: 'farm-1',
    customer_id: 'c-2',
    customer_name: 'Cooperativa del Valle',
    sale_number: 'VEN-2025-0046',
    sale_date: '03 jun 2025',
    subtotal: 18624000,
    tax: 0,
    total: 18624000,
    payment_status: 'Pendiente',
    formatted_weight: '1,920 kg',
    formatted_total: '$18,624,000'
  }
];

export const SalesHistoryTable: React.FC = () => {
  return (
    <div className={styles.cardBox}>
      <div className={styles.cardHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>SALES · HISTORIAL</span>
          <h2 className={styles.cardTitle}>Ventas recientes</h2>
        </div>

        <select className={styles.filterSelect} defaultValue="30">
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </div>

      <div className={styles.tableResponsiveContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>VENTA</th>
              <th>CLIENTE</th>
              <th>FECHA</th>
              <th>PESO</th>
              <th>TOTAL</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SALES_HISTORY.map((item) => (
              <tr key={item.id}>
                <td className="fw-bold">{item.sale_number}</td>
                <td>{item.customer_name}</td>
                <td>{item.sale_date}</td>
                <td>{item.formatted_weight}</td>
                <td className="fw-bold">{item.formatted_total}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      item.payment_status === 'Pagada'
                        ? styles.badgePaid
                        : styles.badgePending
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

      {/* PAGINACIÓN */}
      <div className={styles.paginationRow}>
        <span className={styles.paginationText}>Mostrando 1–2 de 48 ventas</span>
        <div className={styles.paginationBtns}>
          <button type="button" className={styles.pageBtnDisabled} disabled>
            Anterior
          </button>
          <button type="button" className={styles.pageBtnActive}>
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