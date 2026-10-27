import React from 'react';
import { Search } from 'lucide-react';
import styles from './FarmsFilterBar.module.css';

interface FarmsFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const FarmsFilterBar: React.FC<FarmsFilterBarProps> = ({
  searchTerm,
  onSearchChange
}) => (
  <div className={styles.filterRow}>
    <div className={styles.searchBox}>
      <Search className={styles.searchIcon} size={18} />
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar finca por nombre, código o municipio..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  </div>
);

export default FarmsFilterBar;