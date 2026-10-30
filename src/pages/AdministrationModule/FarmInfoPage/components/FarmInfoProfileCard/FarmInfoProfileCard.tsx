import React from 'react';
import { Home } from 'lucide-react';
import styles from './FarmInfoProfileCard.module.css';
import type { Farm } from '../../../../../types/database.types';

interface FarmInfoProfileCardProps {
  farm: Farm;
}

export const FarmInfoProfileCard: React.FC<FarmInfoProfileCardProps> = ({ farm }) => (
  <div className={styles.profileHeaderFlex}>
    <div className={styles.infoGroup}>
      <div className={styles.iconBox}>
        <Home size={24} color="#ffffff" />
      </div>
      <div className={styles.textDetails}>
        <span className={styles.codeTag}>{farm.code || 'FIN-000'}</span>
        <h2 className={styles.farmName}>{farm.name}</h2>
        <span className={styles.locationSubtext}>
          {farm.municipality}, {farm.state}
        </span>
      </div>
    </div>

    <div className={styles.badgeWrapper}>
      <span className={styles.registeredBadge}>Registrada</span>
    </div>
  </div>
);

export default FarmInfoProfileCard;