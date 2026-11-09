import React from 'react';
import { RefreshCw } from 'lucide-react';
import styles from './SyncHeader.module.css';

interface SyncHeaderProps {
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const SyncHeader: React.FC<SyncHeaderProps> = ({
  onSyncNow,
  isSyncing,
}) => (
  <div className={styles.headerFlex}>
    <div>
      <span className={styles.subtitle}>PWA · ALMACENAMIENTO LOCAL</span>
      <h1 className={styles.title}>Cola de Sincronización Pendiente</h1>
      <p className={styles.description}>
        IndexedDB · Operaciones reales pendientes de este usuario y dispositivo.
      </p>
    </div>

    <div className={styles.actionsFlex}>
      <button type="button" className={styles.syncBtn} onClick={onSyncNow} disabled={isSyncing}>
        <RefreshCw size={16} />
        <span>{isSyncing ? 'Sincronizando…' : 'Sincronizar ahora'}</span>
      </button>
    </div>
  </div>
);

export default SyncHeader;