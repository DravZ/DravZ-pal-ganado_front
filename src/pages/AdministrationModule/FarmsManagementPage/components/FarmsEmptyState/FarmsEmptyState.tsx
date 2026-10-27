// FarmsEmptyState.tsx
import React from 'react';
import { Box, Plus } from 'lucide-react';
import styles from './FarmsEmptyState.module.css';

interface FarmsEmptyStateProps {
  onCreateFarm: () => void;
}

export const FarmsEmptyState: React.FC<FarmsEmptyStateProps> = ({ onCreateFarm }) => (
  <div className={styles.card}>
    <div className={styles.iconCircle}>
      <Box size={24} color="#334155" />
    </div>
    <h3 className={styles.title}>No hay fincas registradas</h3>
    <p className={styles.subtitle}>
      Esta colección está vacía. Agrega el primer registro cuando tengas autorización.
    </p>
    <button type="button" className={styles.createBtn} onClick={onCreateFarm}>
      <Plus size={16} />
      <span>Crear finca</span>
    </button>
  </div>
);
export default FarmsEmptyState;