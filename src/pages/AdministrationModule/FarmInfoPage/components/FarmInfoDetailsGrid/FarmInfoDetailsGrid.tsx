import React from 'react';
import styles from './FarmInfoDetailsGrid.module.css';
import type { Farm } from '../../../../../types/database.types';

interface FarmInfoDetailsGridProps {
  farm: Farm;
}

export const FarmInfoDetailsGrid: React.FC<FarmInfoDetailsGridProps> = ({ farm }) => (
  <div className={styles.gridContainer}>
    <div className="row g-4">
      {/* Departamento / Estado */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Departamento / Estado</span>
          <span className={styles.value}>{farm.state || 'N/A'}</span>
        </div>
      </div>

      {/* Municipio */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Municipio</span>
          <span className={styles.value}>{farm.municipality || 'N/A'}</span>
        </div>
      </div>

      {/* Vereda / Localidad */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Vereda / Localidad</span>
          <span className={styles.value}>{farm.locality || 'N/A'}</span>
        </div>
      </div>

      {/* Superficie */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Superficie</span>
          <span className={styles.value}>
            {farm.hectares ? `${farm.hectares} ha` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Dirección */}
      <div className="col-12">
        <div className={styles.detailItem}>
          <span className={styles.label}>Dirección</span>
          <span className={styles.value}>{farm.address || 'N/A'}</span>
        </div>
      </div>
    </div>
  </div>
);

export default FarmInfoDetailsGrid;