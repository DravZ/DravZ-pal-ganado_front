import React from 'react';
import styles from './ProfileHeader.module.css';

interface ProfileHeaderProps {
  onEditProfile: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onEditProfile }) => (
  <div className={styles.headerFlex}>
    <div>
      <span className={styles.subtitle}>CUENTA · PERFIL</span>
      <h1 className={styles.title}>Mi perfil</h1>
      <p className={styles.description}>
        Consulta tu información personal y los datos asociados a tu cuenta.
      </p>
    </div>
    <button type="button" className={styles.editBtn} onClick={onEditProfile}>
      Editar perfil
    </button>
  </div>
);

export default ProfileHeader;