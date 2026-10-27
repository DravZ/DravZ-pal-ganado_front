import React from 'react';
import { Plus } from 'lucide-react';
import styles from './UsersHeader.module.css';

interface UsersHeaderProps {
  onCreateUser: () => void;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({ onCreateUser }) => (
  <div className={styles.headerFlex}>
    <div>
      <span className={styles.subtitle}>ADMINISTRACIÓN · USERS</span>
      <h1 className={styles.title}>Administrar usuarios</h1>
      <p className={styles.description}>
        Consulta y administra las cuentas vinculadas a la organización.
      </p>
    </div>
    <button type="button" className={styles.createBtn} onClick={onCreateUser}>
      <Plus size={18} />
      <span className="d-none d-sm-inline">Crear usuario</span>
    </button>
  </div>
);

export default UsersHeader;