import React from 'react';
import styles from './PurchasesTab.module.css';
import { Plus } from 'lucide-react';
import type { Purchase } from '../../../../../types/database.types';

interface PurchasesTabProps {
  onOpenPurchaseModal: () => void;
}

type PurchaseUI = Purchase & {
  supplier_name: string;
  lines_count_text: string;
  formatted_subtotal: string;
  formatted_tax: string;
  formatted_total: string;
};

const MOCK_PURCHASES: PurchaseUI[] = [
  {
    id: 'pur-1',
    farm_id: 'farm-1',
    supplier_id: 'sup-1',
    supplier_name: 'Agroinsumos del Llano',
    purchase_date: '2025-06-14',
    invoice_number: 'FV-88210',
    subtotal: 1248000,
    tax: 237120,
    total: 1485120,
    payment_status: 'Pagada',
    lines_count_text: '3 líneas',
    formatted_subtotal: '$1,248,000',
    formatted_tax: '$237,120',
    formatted_total: '$1,485,120'
  },
  {
    id: 'pur-2',
    farm_id: 'farm-1',
    supplier_id: 'sup-2',
    supplier_name: 'Veterinaria San Martín',
    purchase_date: '2025-06-08',
    invoice_number: 'FAC-1092',
    subtotal: 892500,
    tax: 169575,
    total: 1062075,
    payment_status: 'Pendiente',
    lines_count_text: '5 líneas',
    formatted_subtotal: '$892,500',
    formatted_tax: '$169,575',
    formatted_total: '$1,062,075'
  }
];

export const PurchasesTab: React.FC<PurchasesTabProps> = ({ onOpenPurchaseModal }) => {
  return (
    <div className={styles.cardBox}>
      <div className={styles.cardHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>PURCHASES</span>
          <h2 className={styles.cardTitle}>Compras recientes</h2>
        </div>

        <button
          type="button"
          className={styles.registerPurchaseBtn}
          onClick={onOpenPurchaseModal}
        >
          <Plus size={16} />
          <span className='d-none d-md-block'>Registrar compra</span>
        </button>
      </div>

      <div className={styles.tableResponsiveContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>FACTURA / PROVEEDOR</th>
              <th>FECHA</th>
              <th>PRODUCTOS</th>
              <th>SUBTOTAL</th>
              <th>IMPUESTO</th>
              <th>TOTAL</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PURCHASES.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="fw-bold">{p.invoice_number}</div>
                  <div className={styles.subText}>{p.supplier_name}</div>
                </td>
                <td>{p.purchase_date}</td>
                <td>{p.lines_count_text}</td>
                <td>{p.formatted_subtotal}</td>
                <td>{p.formatted_tax}</td>
                <td className="fw-bold">{p.formatted_total}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      p.payment_status === 'Pagada'
                        ? styles.badgePaid
                        : styles.badgePending
                    }`}
                  >
                    {p.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchasesTab;