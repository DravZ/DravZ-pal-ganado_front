import React from 'react';
import styles from './PurchasesTab.module.css';
import { Plus } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

interface PurchasesTabProps {
  onOpenPurchaseModal: () => void;
}

const numberValue = (value: unknown) => Number(value ?? 0) || 0;
const money = (value: number) => value.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

export const PurchasesTab: React.FC<PurchasesTabProps> = ({ onOpenPurchaseModal }) => {
  const { scope } = useFarmScope();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'purchase_records',
    '/purchase-records',
    scope,
  );
  const rows = [...records]
    .sort((left, right) => String(right.purchase_date ?? '').localeCompare(String(left.purchase_date ?? '')));

  return (
    <div className={styles.cardBox}>
      <div className={styles.cardHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>PURCHASE_RECORDS</span>
          <h2 className={styles.cardTitle}>Compras recientes</h2>
        </div>
        <button type="button" className={styles.registerPurchaseBtn} onClick={onOpenPurchaseModal}>
          <Plus size={16} /><span className="d-none d-md-block">Registrar compra</span>
        </button>
      </div>
      {error && <p role="alert" className="text-danger">{error}</p>}
      <div className={styles.tableResponsiveContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr><th>FACTURA / PROVEEDOR</th><th>FECHA</th><th>PRODUCTOS</th><th>SUBTOTAL</th><th>IMPUESTO</th><th>TOTAL</th><th>ESTADO</th></tr>
          </thead>
          <tbody>
            {rows.map((purchase) => {
              const status = String(purchase.payment_status ?? 'Pendiente');
              const paid = ['paid', 'pagada', 'pagado'].includes(status.toLowerCase());
              const lines = Array.isArray(purchase.lines) ? purchase.lines : [];
              const total = numberValue(purchase.total_amount ?? purchase.total);
              return (
                <tr key={String(purchase.id)}>
                  <td>
                    <div className="fw-bold">{String(purchase.invoice_number ?? 'Sin factura')}</div>
                    <div className={styles.subText}>{String(purchase.supplier_name ?? 'Proveedor no disponible')}</div>
                  </td>
                  <td>{String(purchase.purchase_date ?? '').slice(0, 10)}</td>
                  <td>{lines.length} líneas</td>
                  <td>{money(numberValue(purchase.subtotal))}</td>
                  <td>{money(numberValue(purchase.tax))}</td>
                  <td className="fw-bold">{money(total)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${paid ? styles.badgePaid : styles.badgePending}`}>
                      {status}
                    </span>
                    {String(purchase.id ?? '').startsWith('local:') && <div className={styles.subText}>Pendiente de sincronización</div>}
                  </td>
                </tr>
              );
            })}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={7} className="text-center text-secondary py-4">{error ?? 'No hay compras registradas para esta finca.'}</td></tr>
            )}
            {isLoading && <tr><td colSpan={7} role="status" className="text-center text-secondary py-4">Cargando compras…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchasesTab;
