import React from 'react';
import { UserCheck } from 'lucide-react';
import styles from './PermissionBanner.module.css';

export const PermissionBanner: React.FC = () => (
  <div className={styles.permissionBanner}>
    <div className={styles.permissionIconBox}>
      <UserCheck size={24} color="#1e4b27" />
    </div>
    <div>
      <span className={styles.permissionTag}>ESTADO DE PERMISOS</span>
      <h4 className={styles.permissionTitle}>Edición administrativa</h4>
      <p className={styles.permissionDescription}>
        La vista de solo lectura queda documentada como dependencia pendiente hasta que se definan permisos organizacionales adicionales.
      </p>
    </div>
  </div>
);

export default PermissionBanner;