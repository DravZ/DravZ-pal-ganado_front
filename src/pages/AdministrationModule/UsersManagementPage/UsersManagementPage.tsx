import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UsersManagementPage.module.css';
import type { User } from '../../../types/database.types';

// Componentes Modularizados
import UsersHeader from './components/UsersHeader/UsersHeader';
import UsersStateSelector from './components/UsersStateSelector/UsersStateSelector';
import UsersFilterBar from './components/UsersFilterBar/UsersFilterBar';
import UsersTable from './components/UsersTable/UsersTable';
import UsersLoadingState from './components/UsersLoadingState/UsersLoadingState';
import UsersEmptyState from './components/UsersEmptyState/UsersEmptyState';
import UsersErrorState from './components/UsersErrorState/UsersErrorState';

export type UserPageState = 'LIST' | 'LOADING' | 'EMPTY' | 'ERROR';

// Interfaz extendida para la vista de UI (mapeada a database.types.ts)
export interface UserUIItem extends User {
  role: string;
  farm_name: string;
  initials: string;
}

export const UsersManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<UserPageState>('LIST');
  const [usersList, setUsersList] = useState<UserUIItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Petición / Simulación de Carga
  const fetchUsers = async () => {
    setPageState('LOADING');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockUsers: UserUIItem[] = [
        {
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
        },
        {
          id: 'user-2',
          organization_id: 'org-123',
          name: 'Laura Gómez',
          email: 'laura@serraverde.com',
          phone: '+57 315 774 2091',
          status: 'pending_invitation',
          role: 'Perfil por confirmar',
          farm_name: 'Finca Serra Verde',
          initials: 'LG',
          created_at: new Date().toISOString()
        },
        {
          id: 'user-3',
          organization_id: 'org-123',
          name: 'Ana Costa',
          email: 'ana@veterinaria.com',
          phone: '+57 301 555 0148',
          status: 'active',
          role: 'Perfil por confirmar',
          farm_name: 'Finca Serra Verde',
          initials: 'AC',
          created_at: new Date().toISOString()
        }
      ];

      setUsersList(mockUsers);
      setPageState('LIST');
    } catch {
      setPageState('ERROR');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtro dinámico en memoria
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchQuery =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.status === 'active') ||
        (statusFilter === 'PENDING' && u.status === 'pending_invitation');

      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'ADMIN' && u.role === 'Administrador') ||
        (roleFilter === 'UNCONFIRMED' && u.role === 'Perfil por confirmar');

      return matchQuery && matchStatus && matchRole;
    });
  }, [usersList, searchTerm, statusFilter, roleFilter]);

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado con Redirección al Crear Usuario */}
      <UsersHeader onCreateUser={() => navigate('/usuarios/nuevo')} />

      {/* Selector de Simulación de Estados (Lista, Carga, Vacío, Error) */}
      <UsersStateSelector
        currentState={pageState}
        onChangeState={(state) => {
          setPageState(state);
          if (state === 'LIST' && usersList.length === 0) {
            fetchUsers();
          }
        }}
      />

      {/* RENDERIZADO CONDICIONAL DE ESTADOS */}
      {pageState === 'LOADING' && <UsersLoadingState />}

      {pageState === 'ERROR' && <UsersErrorState onRetry={fetchUsers} />}

      {pageState === 'EMPTY' && (
        <UsersEmptyState onCreateUser={() => navigate('/usuarios/nuevo')} />
      )}

      {pageState === 'LIST' && (
        <>
          <UsersFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            roleFilter={roleFilter}
            onRoleChange={setRoleFilter}
          />

          <UsersTable
            users={filteredUsers}
            onUserClick={(user) => navigate(`/usuarios/${user.id}`)}
          />
        </>
      )}
    </div>
  );
};

export default UsersManagementPage;