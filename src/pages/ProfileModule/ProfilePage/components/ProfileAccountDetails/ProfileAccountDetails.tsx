import React from 'react';
import styles from '../shared/ProfileDetails.module.css';
import type { ProfileUIUser } from '../../ProfilePage';

interface ProfileAccountDetailsProps {
  user: ProfileUIUser;
}

export const ProfileAccountDetails: React.FC<ProfileAccountDetailsProps> = ({ user }) => (
  <div className={styles.sectionContainer}>
    <span className={styles.sectionTag}>INFORMACIÓN DE CUENTA</span>
    <h3 className={styles.sectionTitle}>Acceso y finca</h3>

    <div className={styles.detailRow}>
      <span className={styles.label}>Rol de la cuenta</span>
      <span className={styles.value}>{user.role}</span>
    </div>

    <div className={styles.detailRow}>
      <span className={styles.label}>Finca actual</span>
      <span className={styles.value}>{user.farm_name}</span>
    </div>

    <div className={styles.infoBanner}>
      <p>El rol y la finca se administran desde la configuración de la organización.</p>
    </div>
  </div>
);

export default ProfileAccountDetails;