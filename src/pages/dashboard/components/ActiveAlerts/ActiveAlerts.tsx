import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActiveAlerts.module.css';

export interface DashboardAlert {
  id: string;
  category: string;
  severity: string;
  title: string;
  message: string;
  detectedAt: string;
  dueDate?: string;
}

interface ActiveAlertsProps {
  alerts: DashboardAlert[];
  isLoading: boolean;
}

function timeLabel(alert: DashboardAlert): string {
  const value = alert.dueDate ?? alert.detectedAt;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  const today = new Date();
  const dayDifference = Math.round((
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  ) / 86_400_000);
  if (dayDifference === 0) return 'Hoy';
  if (dayDifference === 1) return 'Mañana';
  if (dayDifference === -1) return 'Ayer';
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function isUrgent(severity: string): boolean {
  return ['ALTA', 'CRÍTICA', 'CRITICA'].includes(severity.toUpperCase());
}

export const ActiveAlerts: React.FC<ActiveAlertsProps> = ({ alerts, isLoading }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.alertsCard}>
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div>
          <div className={styles.sectionKicker}>ATENCIÓN REQUERIDA</div>
          <h3 className={styles.sectionTitle}>Alertas activas</h3>
        </div>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => navigate('/admin/alertas')}
        >
          Ver alertas pendientes
        </button>
      </div>

      <div className="d-flex flex-column">
        {isLoading ? <p role="status">Cargando alertas…</p> : alerts.length ? (
          alerts.map((alert) => (
            <div key={alert.id} className={styles.alertItem}>
              <div className={styles.alertContentGroup}>
                <span className={`${styles.alertPill} ${
                  isUrgent(alert.severity) ? styles.pillRed : styles.pillYellow
                }`}>
                  {alert.category}
                </span>
                <div className={styles.alertTextWrapper}>
                  <h4 className={styles.alertTitle}>{alert.title}</h4>
                  {alert.message && <p className={styles.alertSubtitle}>{alert.message}</p>}
                </div>
              </div>
              <span className={styles.alertTime}>{timeLabel(alert)}</span>
            </div>
          ))
        ) : <p>No hay alertas pendientes para esta finca.</p>}
      </div>
    </div>
  );
};

export default ActiveAlerts;