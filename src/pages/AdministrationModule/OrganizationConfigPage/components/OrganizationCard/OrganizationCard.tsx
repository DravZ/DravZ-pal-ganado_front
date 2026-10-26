import React from 'react';
import { Building2 } from 'lucide-react';
import styles from './OrganizationCard.module.css';
import type { Organization } from '../../../../../types/database.types';

interface OrganizationCardProps {
  organization: Organization;
  onViewInfo: () => void;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({ organization, onViewInfo }) => (
  <div className={styles.orgMainCard}>
    <div className={styles.orgInfoFlex}>
      <div className={styles.orgIconBox}>
        <Building2 size={24} color="#ffffff" />
      </div>
      <div>
        <span className={styles.cardHeaderTag}>ORGANIZACIÓN ACTUAL</span>
        <h2 className={styles.orgName}>{organization.name}</h2>
        <p className={styles.orgLegalText}>
          {organization.legal_name} · NIT/RUC: {organization.tax_id}
        </p>
      </div>
    </div>
    <button type="button" className={styles.secondaryBtn} onClick={onViewInfo}>
      Ver información
    </button>
  </div>
);

export default OrganizationCard;