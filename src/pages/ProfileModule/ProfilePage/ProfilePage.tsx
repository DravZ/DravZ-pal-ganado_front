import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import type { User } from '../../../types/database.types';
import { useAuth } from '../../../context/AuthContext';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoRecord } from '../../../services/hatoDataService';
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
  const { user } = useAuth();
  const { scope, activeFarm } = useFarmScope();
  const userScope = user ? {
    userId: user.id,
    organizationId: user.organization_id,
    farmId: user.farm_id ?? scope?.farmId ?? '',
  } : null;
  const { record, error } = useHatoRecord<Record<string, unknown>>(
    'users',
    user ? `/users/${user.id}` : '',
    user?.id ?? '',
    userScope,
  );
  const profileData = useMemo((): ProfileUIUser | null => {
    if (!user) return null;
    const name = String(record?.name ?? user.name);
    const email = String(record?.email ?? user.email);
    return {
      id: user.id,
      organization_id: String(record?.organization_id ?? record?.organizationId ?? user.organization_id),
      name,
      email,
      phone: typeof record?.phone === 'string' ? record.phone : undefined,
      status: String(record?.status ?? 'active'),
      created_at: String(record?.created_at ?? record?.createdAt ?? ''),
      role: String(record?.role ?? user.role),
      farm_name: String(record?.farm_name ?? record?.farmName ?? activeFarm?.name ?? 'Sin finca asignada'),
      initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join(''),
    };
  }, [activeFarm?.name, record, user]);

  if (!profileData) return <p className="container-fluid">No hay una sesión activa.</p>;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <ProfileHeader onEditProfile={() => navigate('/perfil/editar')} />
      {error && <p role="status">No se pudo actualizar el perfil. Se muestran los datos guardados localmente.</p>}
      <div className={styles.mainCard}>
        <ProfileUserCard user={profileData} onEditProfile={() => navigate('/perfil/editar')} />
        <div className={styles.detailsGrid}>
          <ProfilePersonalDetails user={profileData} />
          <ProfileAccountDetails user={profileData} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
