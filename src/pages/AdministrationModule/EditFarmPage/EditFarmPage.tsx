import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './EditFarmPage.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../context/FormExitGuardContext';
import useNotification from '../../../hooks/useNotification';
import { requestOnlineAdministrationWrite } from '../../../services/administrationService';
import { cacheAdministrationRecord, useHatoCollection } from '../../../services/hatoDataService';

export const EditFarmPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isOffline } = useAuth();
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>('farms', '/farms', scope);
  const farm = useMemo(() => records.find((record) => record.id === id), [id, records]);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!id) return;
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      if (!user) throw new Error('No se pudo determinar la cuenta de la sesión.');
      const fields = new FormData(event.currentTarget);
      const field = (name: string) => String(fields.get(name) ?? '').trim();
      const savedFarm = await requestOnlineAdministrationWrite(`/farms/${id}`, 'PATCH', {
        name: field('name'),
        state: field('state') || undefined,
        municipality: field('municipality') || undefined,
        locality: field('locality') || undefined,
        hectares: field('hectares') ? Number(field('hectares')) : undefined,
        address: field('address') || undefined,
      });
      await cacheAdministrationRecord(user.id, user.organization_id, 'farms', savedFarm);
      markCurrentFormsSaved(formElement);
      showNotification({ type: 'success', title: 'Finca actualizada', message: 'Los cambios se guardaron en el backend.' });
      navigate('/admin/fincas');
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo actualizar la finca.';
      setSubmissionError(message);
      showNotification({ type: 'error', title: 'No se pudo actualizar la finca', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="container-fluid">Cargando datos locales de la finca…</p>;
  if (!farm) return <p className="container-fluid" role="alert">{error ?? 'La finca no está disponible en este dispositivo.'}</p>;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <button type="button" className={styles.backBtn} onClick={() => navigate('/admin/fincas')}>
        <ArrowLeft size={18} /><span>Volver a fincas</span>
      </button>
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · EDITAR FINCA</span>
        <h1 className={styles.sectionTitle}>Editar finca</h1>
        <p className={styles.sectionDescription}>Registra únicamente la información soportada por el modelo actual de fincas.</p>
      </div>
      {isOffline && <p role="status">La visualización sigue disponible offline; para guardar cambios debes conectarte a internet.</p>}
      {submissionError && (
        <div className={styles.errorBanner} role="alert">
          <AlertTriangle className={styles.errorIcon} size={22} />
          <div><h4 className={styles.errorTitle}>No pudimos guardar la finca</h4><p className={styles.errorDescription}>{submissionError}</p></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>IDENTIFICACIÓN</span>
          <h2 className={styles.groupTitle}>Información principal</h2>
          <div className="row g-4 mt-1">
            <div className="col-12 col-md-6">
              <label htmlFor="name" className={styles.label}>Nombre de la finca</label>
              <input id="name" name="name" className={styles.input} defaultValue={String(farm.name ?? '')} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="code" className={styles.label}>Código</label>
              <input id="code" className={`${styles.input} ${styles.readOnlyInput}`} defaultValue={String(farm.code ?? '')} disabled />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="state" className={styles.label}>Departamento / Estado</label>
              <input id="state" name="state" className={styles.input} defaultValue={String(farm.state ?? '')} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="municipality" className={styles.label}>Municipio</label>
              <input id="municipality" name="municipality" className={styles.input} defaultValue={String(farm.municipality ?? '')} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="locality" className={styles.label}>Vereda / Localidad</label>
              <input id="locality" name="locality" className={styles.input} defaultValue={String(farm.locality ?? '')} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="hectares" className={styles.label}>Hectáreas</label>
              <input id="hectares" name="hectares" type="number" min="0" step="0.01" className={styles.input} defaultValue={String(farm.hectares ?? farm.total_area_hectares ?? '')} />
            </div>
            <div className="col-12">
              <label htmlFor="address" className={styles.label}>Dirección / referencia</label>
              <input id="address" name="address" className={styles.input} defaultValue={String(farm.address ?? '')} />
            </div>
          </div>
        </div>
        <div className={styles.formActionsFlex}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/admin/fincas')}>Cancelar</button>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting || isOffline}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditFarmPage;
