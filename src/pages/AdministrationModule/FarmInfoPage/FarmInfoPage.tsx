import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './FarmInfoPage.module.css';
import type { Farm } from '../../../types/database.types';

// Subcomponentes Modularizados
import FarmInfoHeader from './components/FarmInfoHeader/FarmInfoHeader';
import FarmInfoProfileCard from './components/FarmInfoProfileCard/FarmInfoProfileCard';
import FarmInfoDetailsGrid from './components/FarmInfoDetailsGrid/FarmInfoDetailsGrid';

export const FarmInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [farmData, setFarmData] = useState<Farm | null>(null);

  useEffect(() => {
    // Datos precargados según el esquema de la base de datos
    const mockFarm: Farm = {
      id: id || 'farm-1',
      organization_id: 'org-123',
      name: 'Finca Serra Verde',
      code: 'FIN-001',
      state: 'Antioquia',
      municipality: 'Puerto Berrío',
      locality: 'Vereda La Sierra',
      address: 'Vía Puerto Berrío, km 18',
      hectares: 159.5,
      status: 'active',
      created_at: new Date().toISOString()
    };

    setFarmData(mockFarm);
  }, [id]);

  if (!farmData) return null;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado con redirección a edición */}
      <FarmInfoHeader
        farmName={farmData.name}
        onBack={() => navigate('/admin/fincas')}
        onEdit={() => navigate(`/fincas/editar/${farmData.id}`)}
      />

      {/* Tarjeta Principal de Información */}
      <div className={styles.mainCard}>
        {/* Perfil Superior (Icono, Código, Nombre, Municipio/Estado y Badge Registrada) */}
        <FarmInfoProfileCard farm={farmData} />

        {/* Rejilla de Detalles (Estado, Municipio, Vereda, Superficie, Dirección) */}
        <FarmInfoDetailsGrid farm={farmData} />
      </div>
    </div>
  );
};

export default FarmInfoPage;