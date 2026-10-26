import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './ActionCard.module.css';

interface ActionCardProps {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  onClick: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  tag,
  title,
  description,
  onClick
}) => (
  <div className={styles.actionCard} onClick={onClick}>
    <div className={styles.actionHeaderFlex}>
      <div className={styles.actionIconBox}>{icon}</div>
      <ChevronRight className={styles.arrowIcon} size={20} />
    </div>
    <span className={styles.actionTag}>{tag}</span>
    <h3 className={styles.actionTitle}>{title}</h3>
    <p className={styles.actionDescription}>{description}</p>
  </div>
);

export default ActionCard;