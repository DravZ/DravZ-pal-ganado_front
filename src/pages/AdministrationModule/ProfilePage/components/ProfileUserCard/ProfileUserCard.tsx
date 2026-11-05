import React from 'react';
import styles from './ProfileUserCard.module.css';
import type { ProfileUIUser } from '../../ProfilePage';

interface ProfileUserCardProps {
  user: ProfileUIUser;
  onEditProfile: () => void;
}

export const ProfileUserCard: React.FC<ProfileUserCardProps> = ({
  user,
  onEditProfile
}) => (
  <div className={styles.userCardWrapper}>
    <div className={styles.leftProfileFlex}>
      <div className={styles.avatarBox}>{user.initials}</div>
      <div className={styles.userInfo}>
        <span className={styles.tagLabel}>PERFIL DE USUARIO</span>
        <h2 className={styles.userName}>{user.name}</h2>
        <span className={styles.userEmail}>{user.email}</span>
        <div className={styles.badgeWrapper}>
          <span className={styles.roleBadge}>{user.role}</span>
        </div>
      </div>
    </div>

    <button
      type="button"
      className={styles.secondaryEditBtn}
      onClick={onEditProfile}
    >
      Editar perfil
    </button>
  </div>
);

export default ProfileUserCard;