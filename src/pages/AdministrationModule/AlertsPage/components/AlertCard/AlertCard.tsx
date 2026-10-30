import React from 'react';
import { Bell, Package, Check, Utensils } from 'lucide-react';
import styles from './AlertCard.module.css';
import type { AlertUIItem } from '../../AlertsPage';

interface AlertCardProps {
  alert: AlertUIItem;
  onDetail: () => void;
  onResolve: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onDetail,
  onResolve
}) => {
  // Ícono según la categoría de la alerta
  const renderIcon = () => {
    switch (alert.category) {
      case 'Inventario':
        return <Package size={20} color="#b45309" />;
      case 'Reproducción':
        return <Utensils size={20} color="#b45309" />;
      default:
        return <Bell size={20} color="#b45309" />;
    }
  };

  // Clases CSS para el borde de severidad
  const getSeverityBorder = () => {
    if (alert.severity === 'CRÍTICA') return styles.borderCritical;
    if (alert.severity === 'ALTA') return styles.borderHigh;
    return styles.borderMedium;
  };

  // Clases CSS para el badge de severidad
  const getSeverityBadge = () => {
    if (alert.severity === 'CRÍTICA') return styles.badgeCritical;
    if (alert.severity === 'ALTA') return styles.badgeHigh;
    return styles.badgeMedium;
  };

  return (
    <div className={`${styles.card} ${getSeverityBorder()}`}>
      <div className={styles.leftContent}>
        <div className={styles.iconCircle}>{renderIcon()}</div>

        <div className={styles.textContent}>
          <div className={styles.badgesFlex}>
            <span className={`${styles.severityBadge} ${getSeverityBadge()}`}>
              {alert.severity === 'CRÍTICA' ? 'Crítica' : alert.severity === 'ALTA' ? 'Alta' : 'Media'}
            </span>
            <span className={styles.categoryTag}>{alert.category}</span>
          </div>

          <h3 className={styles.alertTitle}>{alert.title}</h3>
          <p className={styles.alertMessage}>{alert.message}</p>

          <div className={styles.timeInfo}>
            <Bell size={14} />
            <span>{alert.time_label}</span>
          </div>
        </div>
      </div>

      <div className={styles.actionsFlex}>
        <button type="button" className={styles.detailBtn} onClick={onDetail}>
          Ver detalle
        </button>
        <button type="button" className={styles.resolveBtn} onClick={onResolve}>
          <Check size={18} />
          <span>Resolver</span>
        </button>
      </div>
    </div>
  );
};

export default AlertCard;