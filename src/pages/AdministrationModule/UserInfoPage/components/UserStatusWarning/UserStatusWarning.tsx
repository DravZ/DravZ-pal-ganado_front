import React from 'react';
import { Settings } from 'lucide-react';
import styles from './UserStatusWarning.module.css';

export const UserStatusWarning: React.FC = () => (
  <div className={styles.warningBox}>
    <div className={styles.iconBox}>
      <Settings size={20} color="#b45309" />
    </div>
    <div>
      <h4 className={styles.title}>Cambio de estado no habilitado</h4>
      <p className={styles.description}>
        La activación o desactivación requiere reglas de autorización del backend aún no definidas.
      </p>
    </div>
  </div>
);

export default UserStatusWarning;