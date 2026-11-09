import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OrganizationInfoPage.module.css';
import type { Organization } from '../../../types/database.types';
import { useAuth } from '../../../context/AuthContext';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoRecord } from '../../../services/hatoDataService';
import HeaderSection from './components/HeaderSection/HeaderSection';
import OrgHeaderCard from './components/OrgHeaderCard/OrgHeaderCard';
import OrgDetailsGrid from './components/OrgDetailsGrid/OrgDetailsGrid';
import PermissionsWarning from './components/PermissionsWarning/PermissionsWarning';

export const OrganizationInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scope } = useFarmScope();
  const { record, isLoading, error } = useHatoRecord<Record<string, unknown>>(
    'organizations',
    user ? `/organizations/${user.organization_id}` : '',
    user?.organization_id ?? '',
    scope,
  );
  const organization = useMemo((): Organization | null => record ? ({
    id: String(record.id ?? user?.organization_id ?? ''),
    name: String(record.name ?? ''),
    legal_name: typeof record.legal_name === 'string' ? record.legal_name : undefined,
    tax_id: typeof record.tax_id === 'string' ? record.tax_id : undefined,
    email: typeof record.email === 'string' ? record.email : undefined,
    phone: typeof record.phone === 'string' ? record.phone : undefined,
    status: String(record.status ?? 'inactive'),
    created_at: String(record.created_at ?? ''),
    updated_at: typeof record.updated_at === 'string' ? record.updated_at : undefined,
  }) : null, [record, user?.organization_id]);

  if (isLoading) return <p className="container-fluid">Cargando información local de la organización…</p>;
  if (!organization) return <p className="container-fluid" role="alert">{error ?? 'La organización no está disponible en este dispositivo.'}</p>;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <HeaderSection
        onBack={() => navigate('/admin/configuracion')}
        onEdit={() => navigate('/organizacion/editar')}
      />
      {error && <p role="alert">{error}. Se muestran los datos locales guardados.</p>}
      <div className={styles.mainInfoCard}>
        <OrgHeaderCard organization={organization} />
        <OrgDetailsGrid organization={organization} />
        <PermissionsWarning />
      </div>
    </div>
  );
};

export default OrganizationInfoPage;
