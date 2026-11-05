import React from 'react';
import styles from './ProfilePersonalDetails.module.css';
import type { ProfileUIUser } from '../../ProfilePage';

interface ProfilePersonalDetailsProps {
  user: ProfileUIUser;
}

export const ProfilePersonalDetails: React.FC<ProfilePersonalDetailsProps> = ({ user }) => (
  <div className={styles.sectionContainer}>
    <span className={styles.sectionTag}>INFORMACIÓN DE CONTACTO</span>
    <h3 className={styles.sectionTitle}>Datos personales</h3>

    <div className={styles.detailRow}>
      <span className={styles.label}>Nombre completo</span>
      <span className={styles.value}>{user.name}</span>
    </div>

    <div className={styles.detailRow}>
      <span className={styles.label}>Correo electrónico</span>
      <span className={styles.value}>{user.email}</span>
    </div>

    <div className={styles.detailRow}>
      <span className={styles.label}>Teléfono</span>
      <span className={styles.value}>{user.phone || 'N/A'}</span>
    </div>
  </div>
);

export default ProfilePersonalDetails;