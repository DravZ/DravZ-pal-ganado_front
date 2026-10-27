import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './UsersTable.module.css';
import type { UserUIItem } from '../../UsersManagementPage';

interface UsersTableProps {
  users: UserUIItem[];
  onUserClick: (user: UserUIItem) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onUserClick }) => (
  <div className={styles.tableCard}>
    {/* Encabezados solo visibles en Escritorio */}
    <div className={styles.tableHeader}>
      <div className={styles.colUser}>USUARIO</div>
      <div className={styles.colContact}>CONTACTO</div>
      <div className={styles.colRole}>ROL</div>
      <div className={styles.colFarm}>FINCA</div>
      <div className={styles.colStatus}>ESTADO</div>
      <div className={styles.colAction}></div>
    </div>

    {/* Filas */}
    <div className={styles.tableBody}>
      {users.map((u) => {
        const isPending = u.status === 'pending_invitation';
        return (
          <div
            key={u.id}
            className={styles.userRow}
            onClick={() => onUserClick(u)}
          >
            {/* Columna Usuario */}
            <div className={styles.userMainGroup}>
              <div className={styles.avatarBox}>{u.initials}</div>
              <div>
                <span className={styles.userName}>{u.name}</span>
                <span className={styles.userEmail}>{u.email}</span>
              </div>
            </div>

            {/* Columna Contacto */}
            <div className={styles.colContactText}>{u.phone || 'N/A'}</div>

            {/* Columna Rol */}
            <div className={styles.colRoleText}>{u.role}</div>

            {/* Columna Finca */}
            <div className={styles.colFarmText}>{u.farm_name}</div>

            {/* Columna Estado */}
            <div className={styles.colStatusBadge}>
              <span
                className={`${styles.badge} ${
                  isPending ? styles.badgePending : styles.badgeActive
                }`}
              >
                {isPending ? 'Invitación pendiente' : 'Activo'}
              </span>
            </div>

            {/* Columna Flecha */}
            <div className={styles.arrowBox}>
              <ChevronRight size={18} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default UsersTable;