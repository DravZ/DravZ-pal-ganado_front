import React from 'react';
import { MoreHorizontal, HardDrive } from 'lucide-react';
import styles from './SyncTable.module.css';
import type { SyncQueueEntry } from '../../../../../types/database.types';
import type { SyncStatusFilter } from '../../SyncQueuePage';

interface SyncTableProps {
  queue: SyncQueueEntry[];
  totalItems: number;
  statusFilter: SyncStatusFilter;
  entityFilter: string;
  onStatusFilterChange: (status: SyncStatusFilter) => void;
  onEntityFilterChange: (entity: string) => void;
  onViewPayload: (payload: Record<string, unknown>) => void;
}

export const SyncTable: React.FC<SyncTableProps> = ({
  queue,
  totalItems,
  statusFilter,
  entityFilter,
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
          Fallidos
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${statusFilter === 'SYNCED' ? styles.activeTab : ''}`}
          onClick={() => onStatusFilterChange('SYNCED')}
        >
          Sincronizados
        </button>
      </div>

      <div className={styles.selectBoxWrapper}>
        <select
          className={styles.entitySelect}
          value={entityFilter}
          onChange={(e) => onEntityFilterChange(e.target.value)}
        >
          <option value="ALL">Todas las entidades</option>
          <option value="feeding_records">feeding_records</option>
          <option value="expenses">expenses</option>
          <option value="animal_weights">animal_weights</option>
          <option value="treatments">treatments</option>
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
            <th>REINTENTOS ↑↓</th>
            <th>ERROR_MESSAGE ↑↓</th>
            <th style={{ width: '40px' }}></th>
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
                  {item.status}
                </span>
              </td>
              <td className={styles.attemptsText}>{item.retry_count}</td>
              <td>
                {item.error_message ? (
                  <span className={styles.errorText}>{item.error_message}</span>
                ) : (
                  <span className={styles.dashText}>—</span>
                )}
              </td>
              <td>
                <button type="button" className={styles.menuBtn}>
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Paginador y Pie de Persistencia */}
    <div className={styles.tableFooterFlex}>
      <span className={styles.counterSubtext}>
        Mostrando {queue.length} operaciones locales
      </span>

      <div className={styles.paginationFlex}>
        <button type="button" className={styles.pageArrowBtn} disabled>
          Anterior
        </button>
        <button type="button" className={`${styles.pageNumBtn} ${styles.activePage}`}>
          1
        </button>
        <button type="button" className={styles.pageNumBtn}>
          2
        </button>
        <button type="button" className={styles.pageArrowBtn}>
          Siguiente
        </button>
      </div>
    </div>

    <div className={styles.persistenceNote}>
      <HardDrive size={16} />
      <span>
        <strong>Persistencia local:</strong> los datos permanecen en IndexedDB incluso si cierras la aplicación. Último intento: hoy, 14:35.
      </span>
    </div>
  </div>
);

export default SyncTable;