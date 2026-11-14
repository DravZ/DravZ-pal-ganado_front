import React, { useMemo, useState } from 'react';
import styles from './AlertsPage.module.css';
import type { Alert } from '../../../types/database.types';
import { useFarmScope } from '../../../context/FarmScopeContext';
import useNotification from '../../../hooks/useNotification';
import { queueHatoWrite, useHatoCollection } from '../../../services/hatoDataService';
import AlertsHeader from './components/AlertsHeader/AlertsHeader';
import AlertsFilterTabs from './components/AlertsFilterTabs/AlertsFilterTabs';
import AlertCard from './components/AlertCard/AlertCard';

export type AlertFilterType = 'ALL' | 'CRITICAL' | 'HIGH' | 'UPCOMING';

export interface AlertUIItem extends Alert {
  category: 'Salud' | 'Inventario' | 'Reproducción' | 'Sanidad' | string;
  time_label: string;
}

function alertCategory(type: string): string {
  const normalized = type.toUpperCase();
  if (normalized.includes('STOCK') || normalized.includes('INVENTORY')) return 'Inventario';
  if (normalized.includes('PARTO') || normalized.includes('REPRO')) return 'Reproducción';
  if (normalized.includes('VACUN') || normalized.includes('SANIT')) return 'Sanidad';
  return 'Salud';
}

function timeLabel(dueDate: unknown, detectedAt: string): string {
  if (typeof dueDate !== 'string') return new Date(detectedAt).toLocaleString();
  const date = new Date(dueDate);
  return Number.isNaN(date.getTime()) ? new Date(detectedAt).toLocaleString() : date.toLocaleString();
}

export const AlertsPage: React.FC = () => {
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<AlertFilterType>('ALL');
  const { records, error, isLoading } = useHatoCollection<Record<string, unknown>>(
    'alerts',
    '/alerts',
    scope,
  );
  const alerts = useMemo(() => records
    .filter((record) => String(record.status ?? '').toLowerCase() === 'open')
    .map((record): AlertUIItem => {
      const alertType = String(record.alert_type ?? 'SALUD');
      const detectedAt = String(record.detected_at ?? new Date(0).toISOString());
      return {
        id: String(record.id ?? ''),
        farm_id: String(record.farm_id ?? scope?.farmId ?? ''),
        animal_id: typeof record.animal_id === 'string' ? record.animal_id : undefined,
        lot_id: typeof record.lot_id === 'string' ? record.lot_id : undefined,
        alert_type: alertType,
        severity: typeof record.severity === 'string' ? record.severity : 'MEDIA',
        title: String(record.title ?? alertType),
        message: typeof record.message === 'string' ? record.message : '',
        detected_at: detectedAt,
        due_date: typeof record.due_date === 'string' ? record.due_date : undefined,
        status: String(record.status ?? 'open'),
        resolved_at: typeof record.resolved_at === 'string' ? record.resolved_at : undefined,
        resolved_by: typeof record.resolved_by === 'string' ? record.resolved_by : undefined,
        category: alertCategory(alertType),
        time_label: timeLabel(record.due_date, detectedAt),
      };
    }), [records, scope?.farmId]);

  const counts = useMemo(() => ({
    all: alerts.length,
    critical: alerts.filter((alert) => alert.severity === 'CRÍTICA').length,
    high: alerts.filter((alert) => alert.severity === 'ALTA').length,
    upcoming: alerts.filter((alert) => alert.severity === 'MEDIA' || alert.severity === 'BAJA').length,
  }), [alerts]);

  const filteredAlerts = useMemo(() => alerts.filter((alert) => {
    if (activeTab === 'CRITICAL') return alert.severity === 'CRÍTICA';
    if (activeTab === 'HIGH') return alert.severity === 'ALTA';
    if (activeTab === 'UPCOMING') return alert.severity === 'MEDIA' || alert.severity === 'BAJA';
    return true;
  }), [activeTab, alerts]);

  const handleResolve = async (alertId: string) => {
    if (!scope) return;
    try {
      const result = await queueHatoWrite(scope, 'alerts', 'UPDATE', {
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      }, alertId);
      showNotification({
        type: 'success',
        title: result.pending ? 'Alerta guardada para sincronizar' : 'Alerta resuelta',
        message: result.pending
          ? 'El cambio se sincronizará cuando el backend esté disponible.'
          : 'El estado de la alerta se actualizó.',
      });
    } catch (cause: unknown) {
      showNotification({
        type: 'error',
        title: 'No se pudo resolver la alerta',
        message: cause instanceof Error ? cause.message : 'Inténtalo de nuevo.',
      });
    }
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <AlertsHeader pendingCount={counts.all} />
      <AlertsFilterTabs activeTab={activeTab} counts={counts} onTabChange={setActiveTab} />
      {error && <p role="alert">{error}</p>}
      <div className={styles.alertsList}>
        {isLoading ? <p>Cargando alertas guardadas en este dispositivo…</p> : filteredAlerts.length ? (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={() => void handleResolve(alert.id)}
            />
          ))
        ) : <p>No hay alertas pendientes para esta finca.</p>}
      </div>
    </div>
  );
};

export default AlertsPage;
