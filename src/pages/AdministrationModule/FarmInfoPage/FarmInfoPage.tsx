import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../shared/InfoPage.module.css';
import type { Farm } from '../../../types/database.types';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';
import FarmInfoHeader from './components/FarmInfoHeader/FarmInfoHeader';
import FarmInfoProfileCard from './components/FarmInfoProfileCard/FarmInfoProfileCard';
import FarmInfoDetailsGrid from './components/FarmInfoDetailsGrid/FarmInfoDetailsGrid';

export const FarmInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { scope } = useFarmScope();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>('farms', '/farms', scope);
  const farmData = useMemo(() => {
    const record = records.find((item) => item.id === id);
    if (!record) return null;
    return {
      id: String(record.id),
      organization_id: String(record.organization_id ?? scope?.organizationId ?? ''),
      name: String(record.name ?? ''),
      code: typeof record.code === 'string' ? record.code : undefined,
      state: typeof record.state === 'string' ? record.state : undefined,
      municipality: typeof record.municipality === 'string' ? record.municipality : undefined,
      locality: typeof record.locality === 'string' ? record.locality : undefined,
      address: typeof record.address === 'string' ? record.address : undefined,
      hectares: Number(record.hectares ?? record.total_area_hectares ?? 0) || undefined,
      status: String(record.status ?? 'inactive'),
      created_at: String(record.created_at ?? ''),
    } satisfies Farm;
  }, [id, records, scope?.organizationId]);

  if (isLoading) return <p className="container-fluid">Cargando información local de la finca…</p>;
  if (!farmData) return <p className="container-fluid" role={error ? 'alert' : undefined}>
    {error ?? 'La finca no está disponible en los datos autorizados de este dispositivo.'}
  </p>;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <FarmInfoHeader
        farmName={farmData.name}
        onBack={() => navigate('/admin/fincas')}
        onEdit={() => navigate(`/fincas/editar/${farmData.id}`)}
      />
      {error && <p role="alert">{error}. Se muestran los datos locales guardados.</p>}
      <div className={styles.mainCard}>
        <FarmInfoProfileCard farm={farmData} />
        <FarmInfoDetailsGrid farm={farmData} />
      </div>
    </div>
  );
};

export default FarmInfoPage;
