import React from 'react';
import { Settings } from 'lucide-react';
import styles from './PermissionsWarning.module.css';

export const PermissionsWarning: React.FC = () => (
  <div className={styles.warningBox}>
    <div className={styles.iconBox}>
      <Settings size={20} color="#b45309" />
    </div>
    <div>
      <h4 className={styles.title}>Permisos pendientes de definición</h4>
      <p className={styles.description}>
        La aplicación identifica al usuario actual como administrador, pero no define reglas adicionales de edición por organización.
      </p>
    </div>
  </div>
);

export default PermissionsWarning;