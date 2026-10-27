import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OrganizationInfoPage.module.css';
import type { Organization } from '../../../types/database.types';

// Componentes Modularizados
import HeaderSection from './components/HeaderSection/HeaderSection';
import OrgHeaderCard from './components/OrgHeaderCard/OrgHeaderCard';
import OrgDetailsGrid from './components/OrgDetailsGrid/OrgDetailsGrid';
import PermissionsWarning from './components/PermissionsWarning/PermissionsWarning';

export const OrganizationInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    // Mock de datos basado en database.types.ts (Organization)
    const mockOrg: Organization = {
      id: 'org-123',
      name: 'Ganadería Serra Verde',
      legal_name: 'Ganadería Serra Verde S.A.S.',
      tax_id: '900.482.193-1',
      email: 'administracion@serraverde.com',
      phone: '+57 604 555 0182',
      status: 'active',
      created_at: new Date().toISOString()
    };

    setOrganization(mockOrg);
  }, []);

  if (!organization) return null;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Botón de volver y Encabezado con Botón de Editar */}
      <HeaderSection
        onBack={() => navigate('/admin/configuracion')}
        onEdit={() => navigate('/organizacion/editar')}
      />

      {/* Tarjeta Contenedora Principal */}
      <div className={styles.mainInfoCard}>
        {/* Cabecera de la Organización con Badge "Activa" */}
        <OrgHeaderCard organization={organization} />

        {/* Rejilla/Lista de Detalles (Nombre Comercial, Razón Social, NIT/RUT, etc.) */}
        <OrgDetailsGrid organization={organization} />

        {/* Alerta de Permisos */}
        <PermissionsWarning />
      </div>
    </div>
  );
};

export default OrganizationInfoPage;