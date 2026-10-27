import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './UserInfoPage.module.css';
import type { User } from '../../../types/database.types';

// Subcomponentes Modularizados
import UserInfoHeader from './components/UserInfoHeader/UserInfoHeader';
import UserInfoProfileCard from './components/UserInfoProfileCard/UserInfoProfileCard';
import UserInfoDetailsGrid from './components/UserInfoDetailsGrid/UserInfoDetailsGrid';
import UserStatusWarning from './components/UserStatusWarning/UserStatusWarning';

export interface UserDetailUI extends User {
  role: string;
  farm_name: string;
  initials: string;
}

export const UserInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<UserDetailUI | null>(null);

  useEffect(() => {
    // Carga de datos mock o respuesta API basada en el tipo User de database.types.ts
    const mockUser: UserDetailUI = {
      id: id || 'user-1',
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

    setUserData(mockUser);
  }, [id]);

  if (!userData) return null;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado con redirección para editar */}
      <UserInfoHeader
        userName={userData.name}
        onBack={() => navigate('/usuarios')}
        onEdit={() => navigate(`/usuarios/editar/${userData.id}`)}
      />

      {/* Tarjeta Contenedora Principal */}
      <div className={styles.mainCard}>
        {/* Perfil (Avatar, Nombre, Email y Badge de Estado) */}
        <UserInfoProfileCard user={userData} />

        {/* Rejilla de Detalles (Correo, Teléfono, Rol, Finca) */}
        <UserInfoDetailsGrid user={userData} />

        {/* Alerta de Estado no Habilitado */}
        <UserStatusWarning />
      </div>
    </div>
  );
};

export default UserInfoPage;