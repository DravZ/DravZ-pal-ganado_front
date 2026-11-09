import React, { useState } from 'react';
import styles from './ProductionRecordsTab.module.css';
import { Plus } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

interface ProductionRecordsTabProps {
  onOpenModal: () => void;
}

const numberValue = (value: unknown) => Number(value ?? 0) || 0;
const money = (value: number) => value.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

export const ProductionRecordsTab: React.FC<ProductionRecordsTabProps> = ({ onOpenModal }) => {
  const { scope } = useFarmScope();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'production_records',
    '/production-records',
    scope,
  );
  const { records: animals } = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);
  const { records: lots } = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const today = new Date();
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const milkThisMonth = records
    .filter((record) => String(record.production_type ?? '').toLowerCase() === 'leche'
      && String(record.production_date ?? '').startsWith(month))
    .reduce((sum, record) => sum + numberValue(record.quantity), 0);
  const filtered = records
    .filter((record) => typeFilter === 'ALL'
      || String(record.production_type ?? '').toLowerCase() === typeFilter.toLowerCase())
    .sort((left, right) => String(right.production_date ?? '').localeCompare(String(left.production_date ?? '')));

  const rows = filtered.map((record) => {
    const animal = animals.find((entry) => entry.id === record.animal_id);
    const lot = lots.find((entry) => entry.id === record.lot_id);
    const target = animal
      ? `${String(animal.identifier_tag ?? animal.tag_number ?? animal.id)} · ${String(animal.name ?? 'Sin nombre')}`
      : lot ? `Lote ${String(lot.name ?? '')}` : 'Destino no disponible';
    const type = String(record.production_type ?? 'Producción');
    return { record, target, type };
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div className={styles.bannerGreen}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className={styles.bannerLabel}>PRODUCCIÓN DE LECHE · ESTE MES</span>
            <div className={styles.bannerValue}>
              {milkThisMonth.toLocaleString('es-MX')} <span className={styles.bannerUnit}>litros</span>
            </div>
            <span className={styles.bannerSubtext}>Calculado desde los registros locales</span>
          </div>
          <button type="button" className={styles.bannerBtn} onClick={onOpenModal}>
            <Plus size={16} /><span>Registrar producción</span>
          </button>
        </div>
      </div>

      <div className={styles.cardBox}>
        <div className={styles.cardHeaderFlex}>
          <div>
            <span className={styles.dbLabel}>PRODUCTION_RECORDS</span>
            <h2 className={styles.cardTitle}>Últimos registros</h2>
          </div>
          <select className={styles.filterSelect} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="ALL">Todos los tipos</option>
            <option value="Leche">Leche</option>
            <option value="Carne">Carne</option>
          </select>
        </div>
        {error && <p role="alert" className="text-danger">{error}</p>}
        <div className={styles.tableResponsiveContainer}>
          <table className={styles.customTable}>
            <thead>
              <tr><th>DESTINO</th><th>TIPO</th><th>FECHA</th><th>CANTIDAD</th><th>PRECIO / UNIDAD</th><th>INGRESO</th></tr>
            </thead>
            <tbody>
              {rows.map(({ record, target, type }) => (
                <tr key={String(record.id)}>
                  <td className="fw-bold">{target}</td>
                  <td>
                    <span className={`${styles.typeBadge} ${type.toLowerCase() === 'leche' ? styles.badgeMilk : styles.badgeMeat}`}>
                      {type}
                    </span>
                  </td>
                  <td>{String(record.production_date ?? '').slice(0, 10)}</td>
                  <td className="fw-bold">{numberValue(record.quantity)} {String(record.unit ?? '')}</td>
                  <td>{money(numberValue(record.price_per_unit))} / {String(record.unit ?? 'unidad')}</td>
                  <td className="fw-bold">{money(numberValue(record.revenue))}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={6} className="text-center text-secondary py-4">{error ?? 'No hay registros de producción para esta finca.'}</td></tr>
              )}
              {isLoading && <tr><td colSpan={6} role="status" className="text-center text-secondary py-4">Cargando registros…</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionRecordsTab;
