import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './EditOrganizationInfoPage.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../context/FormExitGuardContext';
import useNotification from '../../../hooks/useNotification';
import { queueHatoWrite, useHatoRecord } from '../../../services/hatoDataService';

export const EditOrganizationInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { record, isLoading, error } = useHatoRecord<Record<string, unknown>>(
    'organizations',
    user ? `/organizations/${user.organization_id}` : '',
    user?.organization_id ?? '',
    scope,
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!scope || !user) {
      setSubmissionError('No se pudo determinar el alcance de la organización.');
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const fields = new FormData(event.currentTarget);
      const field = (name: string) => String(fields.get(name) ?? '').trim();
      const result = await queueHatoWrite(scope, 'organizations', 'UPDATE', {
        name: field('name'),
        legal_name: field('legal_name') || undefined,
        email: field('email') || undefined,
        phone: field('phone') || undefined,
      }, user.organization_id);
      markCurrentFormsSaved(formElement);
      showNotification({
        type: 'success',
        title: result.pending ? 'Cambios guardados sin conexión' : 'Organización actualizada',
        message: result.pending
          ? 'Los cambios se sincronizarán automáticamente al recuperar conexión.'
          : 'La información se actualizó en el backend.',
      });
      navigate('/organizacion/informacion');
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo guardar la organización.';
      setSubmissionError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar la organización', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="container-fluid">Cargando datos locales de la organización…</p>;
  if (!record) return <p className="container-fluid" role="alert">{error ?? 'La organización no está disponible en este dispositivo.'}</p>;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <button type="button" className={styles.backBtn} onClick={() => navigate('/organizacion/informacion')}>
        <ArrowLeft size={18} /><span>Volver a información general</span>
      </button>
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>CONFIGURACIÓN · ORGANIZACIÓN</span>
        <h1 className={styles.sectionTitle}>Editar información</h1>
        <p className={styles.sectionDescription}>Los cambios se guardan en la cola y se sincronizan al recuperar conexión.</p>
      </div>
      {error && <p role="alert">{error}. Se muestran los datos locales guardados.</p>}
      {submissionError && (
        <div className={styles.errorBanner} role="alert">
          <AlertTriangle className={styles.errorIcon} size={22} />
          <div><h4 className={styles.errorTitle}>No pudimos guardar la organización</h4><p className={styles.errorDescription}>{submissionError}</p></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>INFORMACIÓN GENERAL</span>
          <h2 className={styles.groupTitle}>Identificación de la organización</h2>
          <div className="row g-4 mt-1">
            <div className="col-12 col-md-6">
              <label htmlFor="name" className={styles.label}>Nombre comercial</label>
              <input id="name" name="name" className={styles.input} defaultValue={String(record.name ?? '')} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="legal_name" className={styles.label}>Razón social</label>
              <input id="legal_name" name="legal_name" className={styles.input} defaultValue={String(record.legal_name ?? '')} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="tax_id" className={styles.label}>NIT / RUT</label>
              <input id="tax_id" className={`${styles.input} ${styles.readOnlyInput}`} defaultValue={String(record.tax_id ?? '')} disabled />
              <span className={styles.fieldHelpText}>Identificador de solo lectura.</span>
            </div>
          </div>
        </div>
        <hr className={styles.divider} />
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>CONTACTO</span>
          <h2 className={styles.groupTitle}>Canales de la organización</h2>
          <div className="row g-4 mt-1">
            <div className="col-12 col-md-6">
              <label htmlFor="email" className={styles.label}>Correo de contacto</label>
              <input id="email" name="email" type="email" className={styles.input} defaultValue={String(record.email ?? '')} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="phone" className={styles.label}>Teléfono</label>
              <input id="phone" name="phone" className={styles.input} defaultValue={String(record.phone ?? '')} />
            </div>
          </div>
        </div>
        <div className={styles.formActionsFlex}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/organizacion/informacion')}>Cancelar</button>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting || !scope}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOrganizationInfoPage;
