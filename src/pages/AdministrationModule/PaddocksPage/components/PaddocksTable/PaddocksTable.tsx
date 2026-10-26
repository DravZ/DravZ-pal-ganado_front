import React from 'react';
import styles from './PaddocksTable.module.css';
import type { PaddockUI } from '../../PaddocksPage';
import { ChevronRight } from 'lucide-react';

interface PaddocksTableProps {
  paddocks: PaddockUI[];
}

export const PaddocksTable: React.FC<PaddocksTableProps> = ({ paddocks }) => {
  return (
    <div className={styles.cardBox}>
      <div className={styles.tableResponsiveContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>CÓDIGO / NOMBRE</th>
              <th>FORRAJE</th>
              <th>HÉCTAREAS</th>
              <th>CAPACIDAD</th>
              <th>OCUPACIÓN</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {paddocks.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="fw-bold">{p.name}</div>
                  <div className={styles.subText}>{p.code}</div>
                </td>
                <td>{p.forage_type}</td>
                <td className="fw-bold">{p.hectares} ha</td>
                <td>{p.capacity} animales</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className={styles.progressBarBg}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${p.occupancy_percentage}%` }}
                      ></div>
                    </div>
                    <span className="fw-bold">{p.current_animals}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      p.badge_status === 'Descanso'
                        ? styles.badgeResting
                        : styles.badgeInUse
                    }`}
                  >
                    {p.badge_status}
                  </span>
                </td>
                <td>
                  <button type="button" className={styles.detailBtn}>
                    <span>Ver detalle</span>
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaddocksTable;