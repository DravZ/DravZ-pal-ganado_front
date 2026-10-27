import React from 'react';
import styles from './OrgDetailsGrid.module.css';
import type { Organization } from '../../../../../types/database.types';

interface OrgDetailsGridProps {
  organization: Organization;
}

export const OrgDetailsGrid: React.FC<OrgDetailsGridProps> = ({ organization }) => (
  <div className={styles.gridContainer}>
    <div className="row g-4">
      {/* Nombre Comercial */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Nombre comercial</span>
          <span className={styles.value}>{organization.name}</span>
        </div>
      </div>

      {/* Razón Social */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Razón social</span>
          <span className={styles.value}>{organization.legal_name || 'N/A'}</span>
        </div>
      </div>

      {/* NIT / RUT */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>NIT / RUT</span>
          <span className={styles.value}>{organization.tax_id || 'N/A'}</span>
        </div>
      </div>

      {/* Correo de contacto */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Correo de contacto</span>
          <span className={styles.value}>{organization.email || 'N/A'}</span>
        </div>
      </div>

      {/* Teléfono */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Teléfono</span>
          <span className={styles.value}>{organization.phone || 'N/A'}</span>
        </div>
      </div>
    </div>
  </div>
);

export default OrgDetailsGrid;