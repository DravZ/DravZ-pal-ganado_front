import React from 'react';
import { Plus } from 'lucide-react';
import styles from './FarmsHeader.module.css';

interface FarmsHeaderProps {
  onCreateFarm: () => void;
}

export const FarmsHeader: React.FC<FarmsHeaderProps> = ({ onCreateFarm }) => (
  <div className={styles.headerFlex}>
    <div>
      <span className={styles.subtitle}>ADMINISTRACIÓN · FARMS</span>
      <h1 className={styles.title}>Administrar fincas</h1>
      <p className={styles.description}>
        Consulta y actualiza las fincas disponibles para esta organización.
      </p>
    </div>
    <button type="button" className={styles.createBtn} onClick={onCreateFarm}>
      <Plus size={18} />
      <span className="d-none d-sm-inline">Crear finca</span>
    </button>
  </div>
);

export default FarmsHeader;