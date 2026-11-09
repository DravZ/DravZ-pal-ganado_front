import React from 'react';
import styles from './FeedingRecordsTab.module.css';
import { Beef, DollarSign, Package, Plus, WifiOff } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

const numberValue = (value: unknown) => Number(value ?? 0) || 0;
const money = (value: number) => value.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

interface FeedingRecordsTabProps {
  onOpenModal: () => void;
}

export const FeedingRecordsTab: React.FC<FeedingRecordsTabProps> = ({ onOpenModal }) => {
  const { scope } = useFarmScope();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'feeding_records',
    '/feeding-records',
    scope,
  );
  const { records: animals } = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);
  const { records: lots } = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const { records: products } = useHatoCollection<Record<string, unknown>>('products', '/products', scope);
  const today = new Date();
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthRecords = records.filter((record) =>
    String(record.feeding_date ?? '').startsWith(month),
  );
  const monthCost = monthRecords.reduce((sum, record) => sum + numberValue(record.cost), 0);
  const pendingCount = records.filter((record) => String(record.id ?? '').startsWith('local:')).length;
  const productTotals = new Map<string, number>();

  for (const record of monthRecords) {
    const productId = String(record.product_id ?? '');
    productTotals.set(productId, (productTotals.get(productId) ?? 0) + numberValue(record.quantity));
  }

  const rows = [...records]
    .sort((left, right) => String(right.feeding_date ?? '').localeCompare(String(left.feeding_date ?? '')))
    .map((record) => {
      const animal = animals.find((item) => item.id === record.animal_id);
      const lot = lots.find((item) => item.id === record.lot_id);
      const product = products.find((item) => item.id === record.product_id);
      const target = animal
        ? `${String(animal.identifier_tag ?? animal.tag_number ?? animal.id)} · ${String(animal.name ?? 'Sin nombre')}`
        : lot ? String(lot.name ?? 'Lote') : 'Destino no disponible';
      const pending = String(record.id ?? '').startsWith('local:');
      return { record, target, product, pending };
    });

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconGreen}><Package size={22} /></div>
            <div>
              <span className={styles.metricLabel}>REGISTROS ESTE MES</span>
              <div className={styles.metricValue}>{monthRecords.length}</div>
              <span className={styles.metricSubtextGreen}>Guardados para esta finca</span>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconGreen}><DollarSign size={22} /></div>
            <div>
              <span className={styles.metricLabel}>COSTO DE ALIMENTACIÓN</span>
              <div className={styles.metricValue}>{money(monthCost)}</div>
              <span className={styles.metricSubtext}>Acumulado del mes</span>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconYellow}><WifiOff size={22} /></div>
            <div>
              <span className={styles.metricLabel}>REGISTROS PENDIENTES</span>
              <div className={styles.metricValue}>{pendingCount}</div>
              <span className={styles.metricSubtext}>Guardados en este dispositivo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className={styles.cardBox}>
            <div className={styles.cardHeaderFlex}>
              <div>
                <span className={styles.dbLabel}>FEEDING_RECORDS</span>
                <h2 className={styles.cardTitle}>Registros recientes</h2>
              </div>
              <button type="button" className={styles.newRecordBtn} onClick={onOpenModal}>
                <Plus size={16} /><span>Nuevo registro</span>
              </button>
            </div>
            {error && <p role="alert" className="text-danger">{error}</p>}
            <div className={styles.tableResponsiveContainer}>
              <table className={styles.customTable}>
                <thead>
                  <tr><th>DESTINO</th><th>PRODUCTO</th><th>FECHA</th><th>CANTIDAD</th><th>COSTO</th><th>ESTADO</th></tr>
                </thead>
                <tbody>
                  {rows.map(({ record, target, product, pending }) => (
                    <tr key={String(record.id)}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={styles.avatarIcon}><Beef size={18} color="#1e4b27" /></div>
                          <div className="fw-bold">{target}</div>
                        </div>
                      </td>
                      <td className="fw-bold">{String(product?.name ?? 'Sin producto')}</td>
                      <td>{String(record.feeding_date ?? '').slice(0, 10)}</td>
                      <td className="fw-bold">{numberValue(record.quantity)} {String(record.unit ?? '')}</td>
                      <td>{money(numberValue(record.cost))}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${pending ? styles.statusPending : styles.statusSynced}`}>
                          {pending ? 'Pendiente' : 'Sincronizado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && rows.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-secondary py-4">{error ?? 'No hay registros de alimentación para esta finca.'}</td></tr>
                  )}
                  {isLoading && <tr><td colSpan={6} role="status" className="text-center text-secondary py-4">Cargando registros…</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className={styles.cardBox}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div><span className={styles.dbLabel}>CONSUMO POR PRODUCTO</span><h2 className={styles.cardTitle}>Este mes</h2></div>
            </div>
            <div className="d-flex flex-column gap-3">
              {[...productTotals.entries()].map(([productId, quantity]) => {
                const product = products.find((item) => item.id === productId);
                return (
                  <div key={productId || 'unassigned'}>
                    <div className="d-flex justify-content-between fw-bold mb-1">
                      <span>{String(product?.name ?? 'Sin producto')}</span>
                      <span>{quantity.toLocaleString('es-MX')} {String(product?.unit ?? '')}</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${Math.min(quantity / Math.max(...productTotals.values(), 1) * 100, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
              {productTotals.size === 0 && <p className="text-secondary mb-0">No hay consumo registrado este mes.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedingRecordsTab;
