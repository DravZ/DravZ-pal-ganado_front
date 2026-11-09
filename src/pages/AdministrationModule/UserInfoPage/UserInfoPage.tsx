import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../shared/InfoPage.module.css';
import type { User } from '../../../types/database.types';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';
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
  const { scope } = useFarmScope();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>('users', '/users', scope);
  const { records: farms } = useHatoCollection<Record<string, unknown>>('farms', '/farms', scope);
  const userData = useMemo(() => {
    const record = records.find((item) => item.id === id);
    if (!record) return null;
    const name = String(record.name ?? '');
    const farmId = typeof record.farm_id === 'string' ? record.farm_id : '';
    return {
      id: String(record.id),
      organization_id: String(record.organization_id ?? scope?.organizationId ?? ''),
      name,
      email: String(record.email ?? ''),
      phone: typeof record.phone === 'string' ? record.phone : undefined,
      status: String(record.status ?? 'inactive'),
      created_at: String(record.created_at ?? ''),
      role: typeof record.role === 'string' ? record.role : 'Perfil por confirmar',
      farm_name: typeof record.farm_name === 'string'
        ? record.farm_name
        : String(farms.find((farm) => farm.id === farmId)?.name ?? ''),
      initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join(''),
    } satisfies UserDetailUI;
  }, [farms, id, records, scope?.organizationId]);

  if (isLoading) return <p className="container-fluid">Cargando información local del usuario…</p>;
  if (!userData) return <p className="container-fluid" role={error ? 'alert' : undefined}>
    {error ?? 'El usuario no está disponible en los datos autorizados de este dispositivo.'}
  </p>;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <UserInfoHeader
        userName={userData.name}
        onBack={() => navigate('/usuarios')}
        onEdit={() => navigate(`/usuarios/editar/${userData.id}`)}
      />
      {error && <p role="alert">{error}. Se muestran los datos locales guardados.</p>}
      <div className={styles.mainCard}>
        <UserInfoProfileCard user={userData} />
        <UserInfoDetailsGrid user={userData} />
        <UserStatusWarning />
      </div>
    </div>
  );
};

export default UserInfoPage;
