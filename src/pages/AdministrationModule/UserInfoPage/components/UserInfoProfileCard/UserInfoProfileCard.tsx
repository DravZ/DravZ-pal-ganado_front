import React from 'react';
import styles from './UserInfoProfileCard.module.css';
import type { UserDetailUI } from '../../UserInfoPage';

interface UserInfoProfileCardProps {
  user: UserDetailUI;
}

export const UserInfoProfileCard: React.FC<UserInfoProfileCardProps> = ({ user }) => (
  <div className={styles.profileHeaderFlex}>
    <div className={styles.infoGroup}>
      <div className={styles.avatarBox}>{user.initials}</div>
      <div className={styles.textDetails}>
        <span className={styles.tag}>PERFIL DE USUARIO</span>
        <h2 className={styles.name}>{user.name}</h2>
        <span className={styles.email}>{user.email}</span>
      </div>
    </div>

    <div className={styles.badgeWrapper}>
      <span
        className={`${styles.statusBadge} ${
          user.status === 'active' ? styles.badgeActive : styles.badgePending
        }`}
      >
        {user.status === 'active' ? 'Activo' : 'Invitación pendiente'}
      </span>
    </div>
  </div>
);

export default UserInfoProfileCard;