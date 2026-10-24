import React from 'react';
import styles from './ProductionRecordsTab.module.css';
import { Plus } from 'lucide-react';
import type { ProductionRecord } from '../../../../../types/database.types';

interface ProductionRecordsTabProps {
  onOpenModal: () => void;
}

type ProductionRecordUI = ProductionRecord & {
  target_name: string;
  type_badge: 'Leche' | 'Carne';
  formatted_price: string;
  formatted_revenue: string;
};

const MOCK_PRODUCTION_RECORDS: ProductionRecordUI[] = [
  {
    id: 'pr-1',
    farm_id: 'farm-1',
    production_date: '2025-06-16',
    target_name: 'Lote Vacas de cría',
    production_type: 'Leche',
    type_badge: 'Leche',
    quantity: 1320,
    unit: 'L',
    price_per_unit: 2050, // <--- Corregido: 'price_per_unit' según database.types.ts
    revenue: 2706000,      // <--- Corregido: 'revenue' según database.types.ts
    formatted_price: '$2,050 / L',
    formatted_revenue: '$2,706,000'
  },
  {
    id: 'pr-2',
    farm_id: 'farm-1',
    production_date: '2025-06-16',
    target_name: 'BR-1042 · Esperanza',
    production_type: 'Leche',
    type_badge: 'Leche',
    quantity: 24.5,
    unit: 'L',
    price_per_unit: 2050, // <--- Corregido
    revenue: 50225,       // <--- Corregido
    formatted_price: '$2,050 / L',
    formatted_revenue: '$50,225'
  },
  {
    id: 'pr-3',
    farm_id: 'farm-1',
    production_date: '2025-06-12',
    target_name: 'Lote Ceba final',
    production_type: 'Carne',
    type_badge: 'Carne',
    quantity: 2840,
    unit: 'kg',
    price_per_unit: 9800, // <--- Corregido
    revenue: 27832000,    // <--- Corregido
    formatted_price: '$9,800 / kg',
    formatted_revenue: '$27,832,000'
  }
];

export const ProductionRecordsTab: React.FC<ProductionRecordsTabProps> = ({ onOpenModal }) => {
  return (
    <div className="d-flex flex-column gap-4">
      {/* BANNER VERDE */}
      <div className={styles.bannerGreen}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className={styles.bannerLabel}>PRODUCCIÓN DE LECHE · JUNIO</span>
            <div className={styles.bannerValue}>
              18,420 <span className={styles.bannerUnit}>litros</span>
            </div>
            <span className={styles.bannerSubtext}>+6.2% frente al mes anterior</span>
          </div>

          <button
            type="button"
            className={styles.bannerBtn}
            onClick={onOpenModal}
          >
            <Plus size={16} />
            <span>Registrar producción</span>
          </button>
        </div>
      </div>

      {/* TABLA DE REGISTROS */}
      <div className={styles.cardBox}>
        <div className={styles.cardHeaderFlex}>
          <div>
            <span className={styles.dbLabel}>PRODUCTION_RECORDS</span>
            <h2 className={styles.cardTitle}>Últimos registros</h2>
          </div>

          <select className={styles.filterSelect} defaultValue="ALL">
            <option value="ALL">Todos los tipos</option>
            <option value="Leche">Leche</option>
            <option value="Carne">Carne</option>
          </select>
        </div>

        <div className={styles.tableResponsiveContainer}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>DESTINO</th>
                <th>TIPO</th>
                <th>FECHA</th>
                <th>CANTIDAD</th>
                <th>PRECIO / UNIDAD</th>
                <th>INGRESO</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PRODUCTION_RECORDS.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold">{item.target_name}</td>
                  <td>
                    <span
                      className={`${styles.typeBadge} ${
                        item.type_badge === 'Leche' ? styles.badgeMilk : styles.badgeMeat
                      }`}
                    >
                      {item.type_badge}
                    </span>
                  </td>
                  <td>{item.production_date}</td>
                  <td className="fw-bold">
                    {item.quantity} {item.unit}
                  </td>
                  <td>{item.formatted_price}</td>
                  <td className="fw-bold">{item.formatted_revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionRecordsTab;