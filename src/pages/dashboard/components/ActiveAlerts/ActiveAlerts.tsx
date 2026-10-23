import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActiveAlerts.module.css';

interface AlertData {
  id: string;
  type: 'retiro' | 'vacunacion' | 'stock';
  pillText: string;
  pillVariant: 'red' | 'yellow';
  title: string;
  subtitle: string;
  timeText: string;
}

const ALERTS_LIST: AlertData[] = [
  {
    id: '1',
    type: 'retiro',
    pillText: 'Periodo de retiro',
    pillVariant: 'red',
    title: 'BR-1088 · Restringir venta de carne',
    subtitle: 'Tratamiento con ivermectina',
    timeText: 'Faltan 8 días',
  },
  {
    id: '2',
    type: 'vacunacion',
    pillText: 'Vacunación pendiente',
    pillVariant: 'yellow',
    title: 'Vacas de cría · Vacunar 12 animales',
    subtitle: 'Jornada sanitaria programada',
    timeText: 'Hoy',
  },
  {
    id: '3',
    type: 'stock',
    pillText: 'Stock bajo',
    pillVariant: 'yellow',
    title: 'Sal mineralizada · Solicitar reposición',
    subtitle: 'Quedan 18 bultos disponibles',
    timeText: 'Hoy',
  },
];

export const ActiveAlerts: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.alertsCard}>
      {/* Encabezado del Bloque */}
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

      {/* Listado de Alertas Responsivo */}
      <div className="d-flex flex-column">
        {ALERTS_LIST.map((alert) => (
          <div key={alert.id} className={styles.alertItem}>
            <div className={styles.alertContentGroup}>
              {/* Etiqueta / Pill */}
              <span
                className={`${styles.alertPill} ${
                  alert.pillVariant === 'red' ? styles.pillRed : styles.pillYellow
                }`}
              >
                {alert.pillText}
              </span>

              {/* Título y Subtítulo */}
              <div className={styles.alertTextWrapper}>
                <h4 className={styles.alertTitle}>{alert.title}</h4>
                <p className={styles.alertSubtitle}>{alert.subtitle}</p>
              </div>
            </div>

            {/* Tiempo restante */}
            <span className={styles.alertTime}>{alert.timeText}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveAlerts;