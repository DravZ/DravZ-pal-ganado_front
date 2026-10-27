import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import styles from './FarmsTable.module.css';
import type { Farm } from '../../../../../types/database.types';

interface FarmsTableProps {
  farms: Farm[];
  onFarmClick: (farm: Farm) => void;
}

export const FarmsTable: React.FC<FarmsTableProps> = ({ farms, onFarmClick }) => (
  <div className={styles.tableCard}>
    {/* Encabezados Desktop */}
    <div className={styles.tableHeader}>
      <div className={styles.colFarm}>FINCA</div>
      <div className={styles.colLocation}>UBICACIÓN</div>
      <div className={styles.colArea}>SUPERFICIE</div>
      <div className={styles.colCode}>CÓDIGO</div>
      <div className={styles.colAction}></div>
    </div>

    {/* Filas */}
    <div className={styles.tableBody}>
      {farms.map((f) => (
        <div
          key={f.id}
          className={styles.farmRow}
          onClick={() => onFarmClick(f)}
        >
          <div className={styles.farmMainGroup}>
            <div className={styles.iconBox}>
              <Home size={20} color="#1e4b27" />
            </div>
            <div className={styles.textGroup}>
              <span className={styles.farmName}>{f.name}</span>
              <span className={styles.farmLocality}>{f.locality || 'N/A'}</span>
            </div>
          </div>

          <div className={styles.colLocationText}>
            {f.municipality && f.state ? `${f.municipality}, ${f.state}` : 'N/A'}
          </div>

          <div className={styles.colAreaText}>
            {f.hectares ? `${f.hectares} ha` : 'N/A'}
          </div>

          <div className={styles.colCodeText}>{f.code || 'N/A'}</div>

          <div className={styles.arrowBox}>
            <ChevronRight size={18} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FarmsTable;