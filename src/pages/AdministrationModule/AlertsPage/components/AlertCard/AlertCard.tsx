import React from 'react';
import { Bell, Package, Check, Utensils } from 'lucide-react';
import styles from './AlertCard.module.css';
import type { AlertUIItem } from '../../AlertsPage';
import {
  isCriticalSeverity,
  isHighSeverity,
  severityLabel,
} from '../../../../../utils/alertSeverity';

interface AlertCardProps {
  alert: AlertUIItem;
  onResolve: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onResolve }) => {
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
    if (isCriticalSeverity(alert.severity)) return styles.borderCritical;
    if (isHighSeverity(alert.severity)) return styles.borderHigh;
    return styles.borderMedium;
  };

  // Clases CSS para el badge de severidad
  const getSeverityBadge = () => {
    if (isCriticalSeverity(alert.severity)) return styles.badgeCritical;
    if (isHighSeverity(alert.severity)) return styles.badgeHigh;
    return styles.badgeMedium;
  };

  return (
    <div className={`${styles.card} ${getSeverityBorder()}`}>
      <div className={styles.leftContent}>
        <div className={styles.iconCircle}>{renderIcon()}</div>

        <div className={styles.textContent}>
          <div className={styles.badgesFlex}>
            <span className={`${styles.severityBadge} ${getSeverityBadge()}`}>
              {severityLabel(alert.severity)}
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
        <button type="button" className={styles.resolveBtn} onClick={onResolve}>
          <Check size={18} />
          <span>Resolver</span>
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
