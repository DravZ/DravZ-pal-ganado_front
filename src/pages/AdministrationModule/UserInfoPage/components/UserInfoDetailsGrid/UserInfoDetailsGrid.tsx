import React from 'react';
import styles from './UserInfoDetailsGrid.module.css';
import type { UserDetailUI } from '../../UserInfoPage';

interface UserInfoDetailsGridProps {
  user: UserDetailUI;
}

export const UserInfoDetailsGrid: React.FC<UserInfoDetailsGridProps> = ({ user }) => (
  <div className={styles.gridContainer}>
    <div className="row g-4">
      {/* Correo electrónico */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Correo electrónico</span>
          <span className={styles.value}>{user.email}</span>
        </div>
      </div>

      {/* Teléfono */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Teléfono</span>
          <span className={styles.value}>{user.phone || 'N/A'}</span>
        </div>
      </div>

      {/* Rol */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Rol</span>
          <span className={styles.value}>{user.role}</span>
        </div>
      </div>

      {/* Finca asociada */}
      <div className="col-12 col-md-6">
        <div className={styles.detailItem}>
          <span className={styles.label}>Finca asociada</span>
          <span className={styles.value}>{user.farm_name}</span>
        </div>
      </div>
    </div>
  </div>
);

export default UserInfoDetailsGrid;