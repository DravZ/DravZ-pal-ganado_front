import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './CreateFarmPage.module.css';
import type { FarmFormValues } from '../../../types/database.types';
import { useAuth } from '../../../context/AuthContext';
import { useFormExitGuard } from '../../../context/FormExitGuardContext';
import useNotification from '../../../hooks/useNotification';
import { requestOnlineAdministrationWrite } from '../../../services/administrationService';
import { cacheAdministrationRecord } from '../../../services/hatoDataService';

export const CreateFarmPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isOffline } = useAuth();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<FarmFormValues>({
    name: '',
    code: '',
    state: '',
    municipality: '',
    locality: '',
    hectares: '',
    address: '',
  });
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      if (!user) throw new Error('No se pudo determinar la organización de la sesión.');
      const savedFarm = await requestOnlineAdministrationWrite('/farms', 'POST', {
        organization_id: user.organization_id,
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        state: formData.state || undefined,
        municipality: formData.municipality || undefined,
        locality: formData.locality || undefined,
        hectares: formData.hectares ? Number(formData.hectares) : undefined,
        address: formData.address || undefined,
        status: 'active',
      });
      await cacheAdministrationRecord(user.id, user.organization_id, 'farms', savedFarm);
      markCurrentFormsSaved(formElement);
      showNotification({ type: 'success', title: 'Finca registrada', message: 'La finca se guardó correctamente en el backend.' });
      navigate('/admin/fincas');
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo guardar la finca.';
      setSubmissionError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar la finca', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <button type="button" className={styles.backBtn} onClick={() => navigate('/admin/fincas')}>
        <ArrowLeft size={18} /><span>Volver a fincas</span>
      </button>
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · NUEVA FINCA</span>
        <h1 className={styles.sectionTitle}>Crear finca</h1>
        <p className={styles.sectionDescription}>Registra únicamente la información soportada por el modelo actual de fincas.</p>
      </div>
      {isOffline && <p role="status">Crear fincas requiere conexión. No se guardarán cambios sin internet.</p>}
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
              <label htmlFor="name" className={styles.label}>Nombre de la finca (farms.name)</label>
              <input id="name" name="name" className={styles.input} value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="code" className={styles.label}>Código (farms.code)</label>
              <input id="code" name="code" className={styles.input} value={formData.code} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="state" className={styles.label}>Departamento / Estado (farms.state)</label>
              <input id="state" name="state" className={styles.input} value={formData.state} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="municipality" className={styles.label}>Municipio (farms.municipality)</label>
              <input id="municipality" name="municipality" className={styles.input} value={formData.municipality} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="locality" className={styles.label}>Vereda / Localidad (farms.locality)</label>
              <input id="locality" name="locality" className={styles.input} value={formData.locality} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="hectares" className={styles.label}>Hectáreas (farms.hectares)</label>
              <input id="hectares" name="hectares" type="number" min="0" step="0.01" className={styles.input} value={formData.hectares} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label htmlFor="address" className={styles.label}>Dirección / referencia (farms.address)</label>
              <input id="address" name="address" className={styles.input} value={formData.address} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className={styles.formActionsFlex}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/admin/fincas')}>Cancelar</button>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting || isOffline}>
            {isSubmitting ? 'Guardando…' : 'Guardar finca'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFarmPage;
