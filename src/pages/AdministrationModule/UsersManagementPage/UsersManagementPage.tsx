import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../shared/ManagementPage.module.css';
import type { User } from '../../../types/database.types';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';
import UsersHeader from './components/UsersHeader/UsersHeader';
import UsersFilterBar from './components/UsersFilterBar/UsersFilterBar';
import UsersTable from './components/UsersTable/UsersTable';
import UsersLoadingState from './components/UsersLoadingState/UsersLoadingState';
import UsersEmptyState from './components/UsersEmptyState/UsersEmptyState';
import UsersErrorState from './components/UsersErrorState/UsersErrorState';

export type UserPageState = 'LIST' | 'LOADING' | 'EMPTY' | 'ERROR';

export interface UserUIItem extends User {
  role: string;
  farm_name: string;
  initials: string;
}

function displayRole(role: unknown): string {
  if (typeof role !== 'string' || !role.trim()) return 'Perfil por confirmar';
  const normalized = role.toUpperCase();
  if (normalized.includes('ADMIN')) return 'Administrador';
  return role.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export const UsersManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const { records, isLoading, error, refresh } = useHatoCollection<Record<string, unknown>>(
    'users',
    '/users',
    scope,
  );
  const { records: farms } = useHatoCollection<Record<string, unknown>>('farms', '/farms', scope);
  const usersList = useMemo(() => records.map((record): UserUIItem => {
    const name = String(record.name ?? '');
    const farmId = typeof record.farm_id === 'string' ? record.farm_id : '';
    const farmName = typeof record.farm_name === 'string'
      ? record.farm_name
      : String(farms.find((farm) => farm.id === farmId)?.name ?? '');
    return {
      id: String(record.id ?? ''),
      organization_id: String(record.organization_id ?? scope?.organizationId ?? ''),
      name,
      email: String(record.email ?? ''),
      phone: typeof record.phone === 'string' ? record.phone : undefined,
      status: String(record.status ?? 'inactive'),
      created_at: String(record.created_at ?? ''),
      role: displayRole(record.role),
      farm_name: farmName,
      initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join(''),
    };
  }), [farms, records, scope?.organizationId]);

  const filteredUsers = useMemo(() => usersList.filter((user) => {
    const matchQuery = user.name.toLowerCase().includes(searchTerm.toLowerCase())
      || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const status = user.status.toLowerCase();
    const matchStatus = statusFilter === 'ALL'
      || (statusFilter === 'ACTIVE' && status === 'active')
      || (statusFilter === 'PENDING' && (status.includes('pending') || status.includes('invitation')));
    const matchRole = roleFilter === 'ALL'
      || (roleFilter === 'ADMIN' && user.role === 'Administrador')
      || (roleFilter === 'UNCONFIRMED' && user.role === 'Perfil por confirmar');
    return matchQuery && matchStatus && matchRole;
  }), [roleFilter, searchTerm, statusFilter, usersList]);

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <UsersHeader onCreateUser={() => navigate('/usuarios/nuevo')} />
      {error && <p role="alert">{error}. Se muestran los datos locales disponibles.</p>}
      {isLoading ? <UsersLoadingState /> : usersList.length === 0 ? (
        error ? <UsersErrorState onRetry={() => void refresh()} /> : (
          <UsersEmptyState onCreateUser={() => navigate('/usuarios/nuevo')} />
        )
      ) : (
        <>
          <UsersFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            roleFilter={roleFilter}
            onRoleChange={setRoleFilter}
          />
          <UsersTable users={filteredUsers} onUserClick={(user) => navigate(`/usuarios/${user.id}`)} />
        </>
      )}
    </div>
  );
};

export default UsersManagementPage;
