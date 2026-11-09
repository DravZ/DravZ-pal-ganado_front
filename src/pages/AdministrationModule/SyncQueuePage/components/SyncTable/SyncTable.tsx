import React from 'react';
import { HardDrive } from 'lucide-react';
import styles from './SyncTable.module.css';
import type { SyncStatusFilter } from '../../SyncQueuePage';

export interface SyncQueueRow {
  id: string;
  entity_name: string;
  entity_id: string;
  operation_type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  status: 'PENDING' | 'FAILED';
  created_at: string;
  error_message?: string;
}

interface SyncTableProps {
  queue: SyncQueueRow[];
  totalItems: number;
  statusFilter: SyncStatusFilter;
  entityFilter: string;
  entityOptions: string[];
  onStatusFilterChange: (status: SyncStatusFilter) => void;
  onEntityFilterChange: (entity: string) => void;
  onViewPayload: (payload: Record<string, unknown>) => void;
}

export const SyncTable: React.FC<SyncTableProps> = ({
  queue,
  totalItems,
  statusFilter,
  entityFilter,
  entityOptions,
  onStatusFilterChange,
  onEntityFilterChange,
  onViewPayload
}) => (
  <div className={styles.tableWrapper}>
    {/* Barra de Filtros (Tabs + Dropdown Entidades) */}
    <div className={styles.filtersBarFlex}>
      <div className={styles.statusTabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${statusFilter === 'ALL' ? styles.activeTab : ''}`}
          onClick={() => onStatusFilterChange('ALL')}
        >
          <span>Todos</span>
          <span className={styles.badgeCount}>{totalItems}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${statusFilter === 'PENDING' ? styles.activeTab : ''}`}
          onClick={() => onStatusFilterChange('PENDING')}
        >
          Pendientes
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${statusFilter === 'FAILED' ? styles.activeTab : ''}`}
          onClick={() => onStatusFilterChange('FAILED')}
        >
          Conflictos
        </button>
      </div>

      <div className={styles.selectBoxWrapper}>
        <select
          className={styles.entitySelect}
          value={entityFilter}
          onChange={(e) => onEntityFilterChange(e.target.value)}
        >
          <option value="ALL">Todas las entidades</option>
          {entityOptions.map((entity) => <option key={entity} value={entity}>{entity}</option>)}
        </select>
      </div>
    </div>

    {/* Tabla de Operaciones */}
    <div className={styles.tableContainer}>
      <table className={styles.customTable}>
        <thead>
          <tr>
            <th>ENTITY_NAME / ENTITY_ID ↑↓</th>
            <th>OPERACIÓN ↑↓</th>
            <th>PAYLOAD ↑↓</th>
            <th>CREATED_AT ↑↓</th>
            <th>ESTADO ↑↓</th>
            <th>ERROR_MESSAGE ↑↓</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <tr key={item.id}>
              <td>
                <div className={styles.entityName}>{item.entity_name}</div>
                <div className={styles.entityId}>{item.entity_id}</div>
              </td>
              <td>
                <span className={`${styles.opBadge} ${styles[`op_${item.operation_type}`]}`}>
                  {item.operation_type}
                </span>
              </td>
              <td>
                <div className={styles.payloadPreview}>
                  {JSON.stringify(item.payload).substring(0, 32)}...
                </div>
                <button
                  type="button"
                  className={styles.viewJsonBtn}
                  onClick={() => onViewPayload(item.payload)}
                >
                  Ver JSON
                </button>
              </td>
              <td className={styles.dateText}>{item.created_at}</td>
              <td>
                <span className={`${styles.statusBadge} ${styles[`status_${item.status}`]}`}>
                  {item.status === 'FAILED' ? 'CONFLICTO' : 'PENDIENTE'}
                </span>
              </td>
              <td>
                {item.error_message ? (
                  <span className={styles.errorText}>{item.error_message}</span>
                ) : (
                  <span className={styles.dashText}>—</span>
                )}
              </td>
            </tr>
          ))}
          {queue.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-secondary py-4">
                No hay operaciones en la cola para estos filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Paginador y Pie de Persistencia */}
    <div className={styles.tableFooterFlex}>
      <span className={styles.counterSubtext}>
        Mostrando {queue.length} de {totalItems} operaciones locales pendientes o en conflicto
      </span>
    </div>

    <div className={styles.persistenceNote}>
      <HardDrive size={16} />
      <span>
        <strong>Persistencia local:</strong> las operaciones permanecen en IndexedDB hasta recibir confirmación del servidor.
      </span>
    </div>
  </div>
);

export default SyncTable;