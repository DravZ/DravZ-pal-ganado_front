import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Box } from 'lucide-react';
import styles from './OrganizationConfigPage.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection, useHatoRecord } from '../../../services/hatoDataService';
import LoadingState from './components/LoadingState/LoadingState';
import OrganizationCard from './components/OrganizationCard/OrganizationCard';
import ActionCard from './components/ActionCard/ActionCard';
import PermissionBanner from './components/PermissionBanner/PermissionBanner';

export const OrganizationConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scope } = useFarmScope();
  const { record: organization, isLoading, error } = useHatoRecord<Record<string, unknown>>(
    'organizations',
    user ? `/organizations/${user.organization_id}` : '',
    user?.organization_id ?? '',
    scope,
  );
  const { records: farms } = useHatoCollection<Record<string, unknown>>('farms', '/farms', scope);

  if (isLoading) return <LoadingState />;
  if (!organization) {
    return <p className="container-fluid" role="alert">
      {error ?? 'La organización no está disponible en este dispositivo. Conéctate para actualizarla.'}
    </p>;
  }

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <div className="mb-4">
        <span className={styles.sectionSubtitle}>CONFIGURACIÓN · ORGANIZACIÓN</span>
        <h1 className={styles.sectionTitle}>Configuración de organización</h1>
        <p className={styles.sectionDescription}>Administra la información soportada y consulta las dependencias de configuración.</p>
      </div>
      {error && <p role="alert">{error}. Se muestran los datos locales guardados.</p>}
      <OrganizationCard
        organization={{
          id: String(organization.id ?? user?.organization_id ?? ''),
          name: String(organization.name ?? ''),
          legal_name: typeof organization.legal_name === 'string' ? organization.legal_name : undefined,
          tax_id: typeof organization.tax_id === 'string' ? organization.tax_id : undefined,
          email: typeof organization.email === 'string' ? organization.email : undefined,
          phone: typeof organization.phone === 'string' ? organization.phone : undefined,
          status: String(organization.status ?? 'inactive'),
          created_at: String(organization.created_at ?? ''),
        }}
        onViewInfo={() => navigate('/organizacion/informacion')}
      />
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <ActionCard
            icon={<Building2 size={20} color="#1e4b27" />}
            tag="INFORMACIÓN GENERAL"
            title="Datos de la organización"
            description="Nombre comercial, razón social y datos de contacto."
            onClick={() => navigate('/organizacion/informacion')}
          />
        </div>
        <div className="col-12 col-md-6">
          <ActionCard
            icon={<Box size={20} color="#1e4b27" />}
            tag="FINCAS ASOCIADAS"
            title={`${farms.length} fincas disponibles`}
            description="Abre la administración de fincas existente."
            onClick={() => navigate('/admin/fincas')}
          />
        </div>
      </div>
      <PermissionBanner />
    </div>
  );
};

export default OrganizationConfigPage;
