import React from 'react';
import styles from './FeedingRecordsTab.module.css';
import { Package, DollarSign, WifiOff, Plus, Beef } from 'lucide-react';
import type { FeedingRecord } from '../../../../../types/database.types';

interface FeedingRecordsTabProps {
  onOpenModal: () => void;
}

type FeedingRecordUI = FeedingRecord & {
  target_name: string;
  target_subtitle: string;
  product_name: string;
  formatted_cost: string;
  status: 'Sincronizado' | 'Pendiente';
};

const MOCK_FEEDING_RECORDS: FeedingRecordUI[] = [
  {
    id: 'fr-1',
    farm_id: 'farm-1',
    feeding_date: '2025-06-16',
    target_name: 'Vacas de cría',
    target_subtitle: 'Lote · 58 animales',
    product_name: 'Sal mineralizada 8%',
    quantity: 4,
    unit: 'bultos',
    cost: 296800, // <--- Corregido: 'cost' según database.types.ts
    formatted_cost: '$296,800',
    status: 'Sincronizado'
  },
  {
    id: 'fr-2',
    farm_id: 'farm-1',
    feeding_date: '2025-06-16',
    target_name: 'Novillos levante',
    target_subtitle: 'Lote · 63 animales',
    product_name: 'Maíz ensilado',
    quantity: 1.8,
    unit: 'ton',
    cost: 572400, // <--- Corregido: 'cost'
    formatted_cost: '$572,400',
    status: 'Pendiente'
  },
  {
    id: 'fr-3',
    farm_id: 'farm-1',
    feeding_date: '2025-06-15',
    target_name: 'BR-1088 · Magnate',
    target_subtitle: 'Animal individual',
    product_name: 'Concentrado finalización',
    quantity: 6,
    unit: 'kg',
    cost: 18600, // <--- Corregido: 'cost'
    formatted_cost: '$18,600',
    status: 'Sincronizado'
  }
];

export const FeedingRecordsTab: React.FC<FeedingRecordsTabProps> = ({ onOpenModal }) => {
  return (
    <div className="d-flex flex-column gap-4">
      {/* TARJETAS DE MÉTRICAS */}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconGreen}>
              <Package size={22} />
            </div>
            <div>
              <span className={styles.metricLabel}>CONSUMO ESTE MES</span>
              <div className={styles.metricValue}>38.6 <span className={styles.metricUnit}>ton</span></div>
              <span className={styles.metricSubtextGreen}>+4.1% vs. mayo</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconGreen}>
              <DollarSign size={22} />
            </div>
            <div>
              <span className={styles.metricLabel}>COSTO DE ALIMENTACIÓN</span>
              <div className={styles.metricValue}>$12.8 M</div>
              <span className={styles.metricSubtext}>$6,880 / animal</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIconYellow}>
              <WifiOff size={22} />
            </div>
            <div>
              <span className={styles.metricLabel}>REGISTROS PENDIENTES</span>
              <div className={styles.metricValue}>3</div>
              <span className={styles.metricSubtext}>Guardados sin conexión</span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE PRINCIPAL */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className={styles.cardBox}>
            <div className={styles.cardHeaderFlex}>
              <div>
                <span className={styles.dbLabel}>FEEDING_RECORDS</span>
                <h2 className={styles.cardTitle}>Registros recientes</h2>
              </div>
              <button
                type="button"
                className={styles.newRecordBtn}
                onClick={onOpenModal}
              >
                <Plus size={16} />
                <span>Nuevo registro</span>
              </button>
            </div>

            <div className={styles.tableResponsiveContainer}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th>DESTINO</th>
                    <th>PRODUCTO</th>
                    <th>FECHA</th>
                    <th>CANTIDAD</th>
                    <th>COSTO</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_FEEDING_RECORDS.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={styles.avatarIcon}>
                            <Beef size={18} color="#1e4b27" />
                          </div>
                          <div>
                            <div className="fw-bold">{item.target_name}</div>
                            <div className={styles.subText}>{item.target_subtitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-bold">{item.product_name}</td>
                      <td>{item.feeding_date}</td>
                      <td className="fw-bold">
                        {item.quantity} {item.unit}
                      </td>
                      <td>{item.formatted_cost}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            item.status === 'Sincronizado'
                              ? styles.statusSynced
                              : styles.statusPending
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="col-12 col-lg-4">
          <div className={styles.cardBox}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className={styles.dbLabel}>CONSUMO POR PRODUCTO</span>
                <h2 className={styles.cardTitle}>Junio 2025</h2>
              </div>
              <button type="button" className={styles.linkBtn}>Ver reporte</button>
            </div>

            <div className="d-flex flex-column gap-3">
              <div>
                <div className="d-flex justify-content-between fw-bold mb-1">
                  <span>Maíz ensilado</span>
                  <span>22.4 ton</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between fw-bold mb-1">
                  <span>Sal mineralizada</span>
                  <span>148 bultos</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '60%' }}></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between fw-bold mb-1">
                  <span>Concentrado</span>
                  <span>3.2 ton</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedingRecordsTab;