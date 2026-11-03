import React from 'react';
import { RefreshCw } from 'lucide-react';
import styles from './SyncHeader.module.css';

interface SyncHeaderProps {
  onClearSynced: () => void;
  onSyncNow: () => void;
}

export const SyncHeader: React.FC<SyncHeaderProps> = ({
  onClearSynced,
  onSyncNow
}) => (
  <div className={styles.headerFlex}>
    <div>
      <span className={styles.subtitle}>PWA · ALMACENAMIENTO LOCAL</span>
      <h1 className={styles.title}>Cola de Sincronización Pendiente</h1>
      <p className={styles.description}>
        Local SQLite / IndexedDB · Inspecciona las escrituras almacenadas en este dispositivo.
      </p>
    </div>

    <div className={styles.actionsFlex}>
      <button type="button" className={styles.clearBtn} onClick={onClearSynced}>
        Limpiar sincronizados
      </button>
      <button type="button" className={styles.syncBtn} onClick={onSyncNow}>
        <RefreshCw size={16} />
        <span>Sincronizar ahora</span>
      </button>
    </div>
  </div>
);

export default SyncHeader;