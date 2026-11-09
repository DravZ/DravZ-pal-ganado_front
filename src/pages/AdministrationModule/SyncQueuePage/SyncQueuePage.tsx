import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import styles from '../shared/ManagementPage.module.css';
import { offlineDatabase, type SyncQueueOperation } from '../../../services/offlineDatabase';
import { flushPendingHatoOperations } from '../../../services/hatoDataService';
import { useAuth } from '../../../context/AuthContext';
import useNotification from '../../../hooks/useNotification';
import SyncHeader from './components/SyncHeader/SyncHeader';
import SyncOfflineBanner from './components/SyncOfflineBanner/SyncOfflineBanner';
import SyncTable, { type SyncQueueRow } from './components/SyncTable/SyncTable';
import JsonPayloadModal from './components/JsonPayloadModal/JsonPayloadModal';

export type SyncStatusFilter = 'ALL' | 'PENDING' | 'FAILED';

function displayDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-MX');
}

function toQueueRow(operation: SyncQueueOperation): SyncQueueRow {
  return {
    id: String(operation.id ?? operation.idempotencyKey),
    entity_name: operation.resourceType,
    entity_id: operation.recordId ?? '—',
    operation_type: operation.operation,
    payload: operation.payload,
    status: operation.status === 'CONFLICT' ? 'FAILED' : 'PENDING',
    created_at: displayDate(operation.createdAt),
    error_message: operation.lastError,
  };
}

export const SyncQueuePage: React.FC = () => {
  const { user, isOffline } = useAuth();
  const { showNotification } = useNotification();
  const [statusFilter, setStatusFilter] = useState<SyncStatusFilter>('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedJsonPayload, setSelectedJsonPayload] = useState<Record<string, unknown> | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = !isOffline && navigator.onLine;

  const operations = useLiveQuery(
    () => user
      ? offlineDatabase.syncQueue.where('userId').equals(user.id).sortBy('id')
      : Promise.resolve([] as SyncQueueOperation[]),
    [user?.id],
  ) ?? [];
  const queueItems = useMemo(() => operations.map(toQueueRow), [operations]);
  const metrics = useMemo(() => ({
    total: queueItems.length,
    pending: operations.filter((operation) => operation.status === 'PENDING').length,
    failed: operations.filter((operation) => operation.status === 'CONFLICT').length,
  }), [operations, queueItems.length]);
  const entityOptions = useMemo(
    () => [...new Set(queueItems.map((item) => item.entity_name))].sort(),
    [queueItems],
  );
  const filteredQueue = useMemo(() => queueItems.filter((item) => (
    (statusFilter === 'ALL' || item.status === statusFilter)
    && (entityFilter === 'ALL' || item.entity_name === entityFilter)
  )), [entityFilter, queueItems, statusFilter]);

  const handleSyncNow = async () => {
    if (!user || isSyncing) return;
    if (!isOnline) {
      const message = 'Conéctate a internet para enviar las operaciones pendientes.';
      setSyncError(message);
      showNotification({ type: 'alert', title: 'Sin conexión', message });
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      await flushPendingHatoOperations(user.id);
      showNotification({
        type: 'success',
        title: 'Sincronización terminada',
        message: 'Se procesaron las operaciones pendientes. Los conflictos requieren revisión.',
      });
    } catch (cause) {
      const message = cause instanceof Error
        ? cause.message
        : 'No se pudieron sincronizar todas las operaciones.';
      setSyncError(message);
      showNotification({ type: 'error', title: 'Sincronización incompleta', message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <SyncHeader onSyncNow={() => void handleSyncNow()} isSyncing={isSyncing} />
      <SyncOfflineBanner
        metrics={metrics}
        isOnline={isOnline}
      />
      {syncError && <p role="alert" className="alert alert-danger">{syncError}</p>}
      <SyncTable
        queue={filteredQueue}
        totalItems={metrics.total}
        statusFilter={statusFilter}
        entityFilter={entityFilter}
        entityOptions={entityOptions}
        onStatusFilterChange={setStatusFilter}
        onEntityFilterChange={setEntityFilter}
        onViewPayload={setSelectedJsonPayload}
      />
      {selectedJsonPayload && (
        <JsonPayloadModal
          payload={selectedJsonPayload}
          onClose={() => setSelectedJsonPayload(null)}
        />
      )}
    </div>
  );
};

export default SyncQueuePage;
