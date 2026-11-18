import React from 'react';
import { Settings } from 'lucide-react';
import styles from '../../../shared/StatusWarning.module.css';

interface UserStatusWarningProps {
  statusLabel: string;
  isActive: boolean;
  canManage: boolean;
  isBusy: boolean;
  isOffline: boolean;
  onToggle: () => void;
}

export const UserStatusWarning: React.FC<UserStatusWarningProps> = ({
  statusLabel,
  isActive,
  canManage,
  isBusy,
  isOffline,
  onToggle,
}) => (
  <div className={styles.warningBox}>
    <div className={styles.iconBox}>
      <Settings size={20} color="#b45309" />
    </div>
    <div>
      <h4 className={styles.title}>Estado de la cuenta</h4>
      <p className={styles.description}>
        Estado actual: <strong>{statusLabel}</strong>.{' '}
        {canManage
          ? 'Puedes activar o desactivar el acceso de este usuario.'
          : 'Solo un administrador puede cambiar el estado de otra cuenta.'}
      </p>
      {canManage && (
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onToggle}
          disabled={isBusy || isOffline}
        >
          {isBusy ? 'Actualizando…' : isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
        </button>
      )}
      {canManage && isOffline && (
        <p className={styles.description}>Conéctate a internet para cambiar el estado.</p>
      )}
    </div>
  </div>
);

export default UserStatusWarning;
