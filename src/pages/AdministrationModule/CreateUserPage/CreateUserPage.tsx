import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './CreateUserPage.module.css';
import type { CreateUserFormValues } from '../../../types/database.types';
import { useAuth } from '../../../context/AuthContext';
import { useFarmScope } from '../../../context/FarmScopeContext';
import useNotification from '../../../hooks/useNotification';
import { requestOnlineAdministrationWrite } from '../../../services/administrationService';
import { cacheAdministrationRecord } from '../../../services/hatoDataService';

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isOffline } = useAuth();
  const { farms, activeFarm } = useFarmScope();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<CreateUserFormValues>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Perfil por confirmar',
    status: 'Invitación pendiente',
    farm_id: activeFarm?.id ?? '',
  });
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      if (!user) throw new Error('No se pudo determinar la organización de la sesión.');
      const savedUser = await requestOnlineAdministrationWrite('/users', 'POST', {
        organization_id: user.organization_id,
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        farm_id: formData.farm_id || null,
      });
      await cacheAdministrationRecord(user.id, user.organization_id, 'users', savedUser);
      showNotification({ type: 'success', title: 'Usuario creado', message: 'El usuario se registró en el backend.' });
      navigate('/admin/usuarios');
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo guardar el usuario.';
      setSubmissionError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar el usuario', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <button type="button" className={styles.backBtn} onClick={() => navigate('/admin/usuarios')}>
        <ArrowLeft size={18} /><span>Volver a usuarios</span>
      </button>
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · NUEVO USUARIO</span>
        <h1 className={styles.sectionTitle}>Crear usuario</h1>
        <p className={styles.sectionDescription}>La información de cuenta y perfil se gestiona en un único formulario compartido.</p>
      </div>
      {isOffline && <p role="status">Crear usuarios requiere conexión. No se guardarán cambios sin internet.</p>}
      {submissionError && (
        <div className={styles.errorBanner} role="alert">
          <AlertTriangle className={styles.errorIcon} size={22} />
          <div><h4 className={styles.errorTitle}>No pudimos guardar el usuario</h4><p className={styles.errorDescription}>{submissionError}</p></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>INFORMACIÓN DE CUENTA Y PERFIL</span>
          <h2 className={styles.groupTitle}>Datos personales</h2>
          <div className="row g-4 mt-1">
            <div className="col-12 col-md-6">
              <label htmlFor="first_name" className={styles.label}>Nombre</label>
              <input id="first_name" name="first_name" className={styles.input} value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="last_name" className={styles.label}>Apellidos</label>
              <input id="last_name" name="last_name" className={styles.input} value={formData.last_name} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="email" className={styles.label}>Correo electrónico</label>
              <input id="email" name="email" type="email" className={styles.input} value={formData.email} onChange={handleChange} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="phone" className={styles.label}>Teléfono</label>
              <input id="phone" name="phone" className={styles.input} value={formData.phone} onChange={handleChange} />
            </div>
          </div>
        </div>
        <hr className={styles.divider} />
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>ASIGNACIÓN ADMINISTRATIVA</span>
          <h2 className={styles.groupTitle}>Acceso y finca</h2>
          <div className="row g-4 mt-1">
            <div className="col-12 col-md-6">
              <label htmlFor="role" className={styles.label}>Rol</label>
              <input id="role" className={`${styles.input} ${styles.readOnlyInput}`} value={formData.role} readOnly disabled />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="status" className={styles.label}>Estado</label>
              <input id="status" className={`${styles.input} ${styles.readOnlyInput}`} value={formData.status} readOnly disabled />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="farm_id" className={styles.label}>Finca asociada</label>
              <div className={styles.selectWrapper}>
                <select id="farm_id" name="farm_id" className={styles.selectInput} value={formData.farm_id} onChange={handleChange}>
                  <option value="">Sin finca asignada</option>
                  {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.formActionsFlex}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/admin/usuarios')}>Cancelar</button>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting || isOffline}>
            {isSubmitting ? 'Guardando…' : 'Guardar usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
