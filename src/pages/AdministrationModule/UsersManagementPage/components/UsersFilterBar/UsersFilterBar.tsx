import React from 'react';
import { Search } from 'lucide-react';
import styles from './UsersFilterBar.module.css';

interface UsersFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
}

export const UsersFilterBar: React.FC<UsersFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange
}) => (
  <div className={styles.filterRow}>
    <div className={styles.searchBox}>
      <Search className={styles.searchIcon} size={18} />
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar usuario por nombre o correo..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>

    <div className={styles.selectWrapper}>
      <select
        className={styles.selectInput}
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="ALL">Todos los estados</option>
        <option value="ACTIVE">Activos</option>
        <option value="PENDING">Invitación pendiente</option>
      </select>
    </div>

    <div className={styles.selectWrapper}>
      <select
        className={styles.selectInput}
        value={roleFilter}
        onChange={(e) => onRoleChange(e.target.value)}
      >
        <option value="ALL">Todos los perfiles</option>
        <option value="ADMIN">Administrador</option>
        <option value="UNCONFIRMED">Perfil por confirmar</option>
      </select>
    </div>
  </div>
);

export default UsersFilterBar;