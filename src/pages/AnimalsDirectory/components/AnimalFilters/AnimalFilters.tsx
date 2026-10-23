import React from 'react';
import { Search } from 'lucide-react';
import styles from './AnimalFilters.module.css';

interface AnimalFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLote: string;
  onLoteChange: (value: string) => void;
  selectedPotrero: string;
  onPotreroChange: (value: string) => void;
  selectedSexo: string;
  onSexoChange: (value: string) => void;
  selectedEstado: string;
  onEstadoChange: (value: string) => void;
}

export const AnimalFilters: React.FC<AnimalFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedLote,
  onLoteChange,
  selectedPotrero,
  onPotreroChange,
  selectedSexo,
  onSexoChange,
  selectedEstado,
  onEstadoChange,
}) => {
  return (
    <div className={styles.filtersWrapper}>
      {/* Campo de Búsqueda */}
      <div className={styles.searchGroup}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por arete, nombre o raza..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Select Lotes */}
      <select
        className={styles.selectControl}
        value={selectedLote}
        onChange={(e) => onLoteChange(e.target.value)}
      >
        <option value="">Todos los lotes</option>
        <option value="Vacas de cría">Vacas de cría</option>
        <option value="Novillos levante">Novillos levante</option>
        <option value="Ceba final">Ceba final</option>
        <option value="Hembras reemplazo">Hembras reemplazo</option>
      </select>

      {/* Select Potreros */}
      <select
        className={styles.selectControl}
        value={selectedPotrero}
        onChange={(e) => onPotreroChange(e.target.value)}
      >
        <option value="">Todos los potreros</option>
        <option value="Potrero Norte">Potrero Norte</option>
        <option value="La Quebrada">La Quebrada</option>
        <option value="Loma Alta">Loma Alta</option>
      </select>

      {/* Select Sexo */}
      <select
        className={styles.selectControl}
        value={selectedSexo}
        onChange={(e) => onSexoChange(e.target.value)}
      >
        <option value="">Sexo</option>
        <option value="Hembra">Hembra</option>
        <option value="Macho">Macho</option>
      </select>

      {/* Select Estado */}
      <select
        className={styles.selectControl}
        value={selectedEstado}
        onChange={(e) => onEstadoChange(e.target.value)}
      >
        <option value="">Estado</option>
        <option value="Activo">Activo</option>
        <option value="Tratamiento">Tratamiento</option>
      </select>
    </div>
  );
};