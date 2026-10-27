import React from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import styles from './UserInfoHeader.module.css';

interface UserInfoHeaderProps {
  userName: string;
  onBack: () => void;
  onEdit: () => void;
}

export const UserInfoHeader: React.FC<UserInfoHeaderProps> = ({
  userName,
  onBack,
  onEdit
}) => (
  <div className={styles.headerWrapper}>
    <button type="button" className={styles.backBtn} onClick={onBack}>
      <ArrowLeft size={18} />
      <span>Volver a usuarios</span>
    </button>

    <div className={styles.headerFlex}>
      <div>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · USERS</span>
        <h1 className={styles.sectionTitle}>{userName}</h1>
        <p className={styles.sectionDescription}>
          Información de cuenta y perfil disponible para esta organización.
        </p>
      </div>

      <button type="button" className={styles.editBtn} onClick={onEdit}>
        <Pencil size={16} className="d-none d-sm-inline" />
        <span>Editar usuario</span>
      </button>
    </div>
  </div>
);

export default UserInfoHeader;