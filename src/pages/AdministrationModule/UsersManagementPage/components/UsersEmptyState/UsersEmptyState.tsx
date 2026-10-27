// UsersEmptyState.tsx
import React from 'react';
import { Home, Plus } from 'lucide-react';
import styles from './UsersEmptyState.module.css';

interface UsersEmptyStateProps {
  onCreateUser: () => void;
}

export const UsersEmptyState: React.FC<UsersEmptyStateProps> = ({ onCreateUser }) => (
  <div className={styles.card}>
    <div className={styles.iconCircle}>
      <Home size={24} color="#1e4b27" />
    </div>
    <h3 className={styles.title}>No hay usuarios registrados</h3>
    <p className={styles.subtitle}>
      Esta colección está vacía. Agrega el primer registro cuando tengas autorización.
    </p>
    <button type="button" className={styles.createBtn} onClick={onCreateUser}>
      <Plus size={16} />
      <span>Crear usuario</span>
    </button>
  </div>
);
export default UsersEmptyState;