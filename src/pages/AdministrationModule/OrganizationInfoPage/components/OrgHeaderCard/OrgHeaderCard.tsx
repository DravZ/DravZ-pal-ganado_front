import React from 'react';
import { Building2 } from 'lucide-react';
import styles from './OrgHeaderCard.module.css';
import type { Organization } from '../../../../../types/database.types';

interface OrgHeaderCardProps {
  organization: Organization;
}

export const OrgHeaderCard: React.FC<OrgHeaderCardProps> = ({ organization }) => (
  <div className={styles.orgHeaderFlex}>
    <div className={styles.infoGroup}>
      <div className={styles.iconBox}>
        <Building2 size={24} color="#ffffff" />
      </div>
      <div>
        <span className={styles.tag}>ORGANIZACIÓN ACTUAL</span>
        <h2 className={styles.title}>{organization.name}</h2>
        <span className={styles.subtitle}>{organization.legal_name}</span>
      </div>
    </div>

    <span className={styles.statusBadge}>Activa</span>
  </div>
);

export default OrgHeaderCard;