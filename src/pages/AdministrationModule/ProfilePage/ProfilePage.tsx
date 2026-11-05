import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import type { User } from '../../../types/database.types';

// Subcomponentes Modularizados
import ProfileHeader from './components/ProfileHeader/ProfileHeader';
import ProfileUserCard from './components/ProfileUserCard/ProfileUserCard';
import ProfilePersonalDetails from './components/ProfilePersonalDetails/ProfilePersonalDetails';
import ProfileAccountDetails from './components/ProfileAccountDetails/ProfileAccountDetails';

export interface ProfileUIUser extends User {
  role: string;
  farm_name: string;
  initials: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileUIUser | null>(null);

  useEffect(() => {
    // Datos del usuario logueado mapeados según el esquema de la BD
    const mockUser: ProfileUIUser = {
      id: 'user-1',
      organization_id: 'org-123',
      name: 'Rafael Mendes',
      email: 'rafael@serraverde.com',
      phone: '+57 300 482 1930',
      status: 'active',
      role: 'Administrador',
      farm_name: 'Finca Serra Verde',
      initials: 'RM',
      created_at: new Date().toISOString()
    };

    setProfileData(mockUser);
  }, []);

  if (!profileData) return null;

  const handleEditProfile = () => {
    navigate('/perfil/editar');
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado con breadcrumb y botón "Editar perfil" */}
      <ProfileHeader onEditProfile={handleEditProfile} />

      {/* Tarjeta Principal del Perfil */}
      <div className={styles.mainCard}>
        {/* Bloque Superior: Avatar, Nombre, Email, Badge de Rol y Botón de edición secundario */}
        <ProfileUserCard user={profileData} onEditProfile={handleEditProfile} />

        {/* Bloque Inferior: Dos columnas (Datos Personales vs Acceso y Finca) */}
        <div className={styles.detailsGrid}>
          <ProfilePersonalDetails user={profileData} />
          <ProfileAccountDetails user={profileData} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;