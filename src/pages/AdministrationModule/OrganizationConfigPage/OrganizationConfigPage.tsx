import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Box } from 'lucide-react';
import styles from './OrganizationConfigPage.module.css';

// Hook y Subcomponentes
import { useOrganizationConfig } from './hooks/useOrganizationConfig';
import StateSelector from './components/StateSelector/StateSelector';
import LoadingState from './components/LoadingState/LoadingState';
import ErrorState from './components/ErrorState/ErrorState';
import OrganizationCard from './components/OrganizationCard/OrganizationCard';
import ActionCard from './components/ActionCard/ActionCard';
import PermissionBanner from './components/PermissionBanner/PermissionBanner';

export const OrganizationConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    viewState, 
    organization, 
    associatedFarmsCount, 
    fetchData, 
    setViewState 
  } = useOrganizationConfig();

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado */}
      <div className="mb-4">
        <span className={styles.sectionSubtitle}>CONFIGURACIÓN · ORGANIZACIÓN</span>
        <h1 className={styles.sectionTitle}>Configuración de organización</h1>
        <p className={styles.sectionDescription}>
          Administra la información soportada y consulta las dependencias de configuración.
        </p>
      </div>

      {/* Selector de Simulación de Estados */}
      <StateSelector currentState={viewState} onChangeState={setViewState} />

      {/* Estados Dinámicos de Petición HTTP */}
      {viewState === 'LOADING' && <LoadingState />}

      {viewState === 'ERROR' && <ErrorState onRetry={fetchData} />}

      {viewState === 'OVERVIEW' && organization && (
        <>
          <OrganizationCard
            organization={organization}
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
                title={`${associatedFarmsCount} fincas disponibles`}
                description="Abre la administración de fincas existente."
                onClick={() => navigate('/organizacion/fincas')}
              />
            </div>
          </div>

          <PermissionBanner />
        </>
      )}
    </div>
  );
};

export default OrganizationConfigPage;