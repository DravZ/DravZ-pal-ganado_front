import React, { useState, useMemo } from 'react';
import styles from './SyncQueuePage.module.css';
import type { SyncQueueEntry } from '../../../types/database.types';

// Componentes Modularizados
import SyncHeader from './components/SyncHeader/SyncHeader';
import SyncOfflineBanner from './components/SyncOfflineBanner/SyncOfflineBanner';
import SyncTable from './components/SyncTable/SyncTable';
import JsonPayloadModal from './components/JsonPayloadModal/JsonPayloadModal';

export type SyncStatusFilter = 'ALL' | 'PENDING' | 'FAILED' | 'SYNCED';

export const SyncQueuePage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<SyncStatusFilter>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [selectedJsonPayload, setSelectedJsonPayload] = useState<Record<string, unknown> | null>(null);

  // Lista mock mapeada exactamente como en las imágenes
  const [queueItems, setQueueItems] = useState<SyncQueueEntry[]>([
    {
      id: 'fr_9a71',
      entity_name: 'feeding_records',
      entity_id: 'fr_9a71',
      operation_type: 'CREATE',
      payload: {
        lot_id: 'lot_02',
        product_id: 'prod_99',
        quantity: 150,
        unit: 'kg',
        registered_by: 'user-123'
      },
      status: 'PENDING',
      retry_count: 0,
      created_at: '16 jun · 14:32'
    },
    {
      id: 'exp_3f20',
      entity_name: 'expenses',
      entity_id: 'exp_3f20',
      operation_type: 'CREATE',
      payload: {
        supplier_id: 'sup_08',
        category: 'Insumos Alimentos',
        amount: 450000,
        currency: 'COP'
      },
      status: 'PENDING',
      retry_count: 0,
      created_at: '16 jun · 13:18'
    },
    {
      id: 'aw_821c',
      entity_name: 'animal_weights',
      entity_id: 'aw_821c',
      operation_type: 'UPDATE',
      payload: {
        animal_id: 'ani_1042',
        weight: 485.5,
        weighed_at: '2025-06-16'
      },
      status: 'FAILED',
      retry_count: 2,
      error_message: 'Tiempo de espera agotado',
      created_at: '16 jun · 10:42'
    },
    {
      id: 'tr_11bd',
      entity_name: 'treatments',
      entity_id: 'tr_11bd',
      operation_type: 'CREATE',
      payload: {
        animal_id: 'ani_1088',
        medication: 'Ivermax 1%',
        dose: '10ml',
        administered_by: 'Vet. Torres'
      },
      status: 'SYNCED',
      retry_count: 0,
      created_at: '15 jun · 17:05'
    }
  ]);

  // Cálculos dinámicos de métricas
  const metrics = useMemo(() => {
    return {
      total: queueItems.length,
      pending: queueItems.filter((item) => item.status === 'PENDING').length,
      failed: queueItems.filter((item) => item.status === 'FAILED').length,
      synced: queueItems.filter((item) => item.status === 'SYNCED').length
    };
  }, [queueItems]);

  // Limpiar sincronizados
  const handleClearSynced = () => {
    setQueueItems((prev) => prev.filter((item) => item.status !== 'SYNCED'));
  };

  // Simulación de Sincronizar Ahora
  const handleSyncNow = () => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.status === 'PENDING' || item.status === 'FAILED'
          ? { ...item, status: 'SYNCED', error_message: undefined }
          : item
      )
    );
  };

  // Filtrado de la tabla
  const filteredQueue = useMemo(() => {
    return queueItems.filter((item) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && item.status === 'PENDING') ||
        (statusFilter === 'FAILED' && item.status === 'FAILED') ||
        (statusFilter === 'SYNCED' && item.status === 'SYNCED');

      const matchesEntity =
        entityFilter === 'ALL' || item.entity_name === entityFilter;

      return matchesStatus && matchesEntity;
    });
  }, [queueItems, statusFilter, entityFilter]);

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado Principal */}
      <SyncHeader
        onClearSynced={handleClearSynced}
        onSyncNow={handleSyncNow}
      />

      {/* Banner de Estado Offline y Métricas */}
      <SyncOfflineBanner metrics={metrics} />

      {/* Contenedor de la Tabla y Filtros */}
      <SyncTable
        queue={filteredQueue}
        totalItems={metrics.total}
        statusFilter={statusFilter}
        entityFilter={entityFilter}
        onStatusFilterChange={setStatusFilter}
        onEntityFilterChange={setEntityFilter}
        onViewPayload={(payload) => setSelectedJsonPayload(payload)}
      />

      {/* Modal Inspector de Payload JSON */}
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