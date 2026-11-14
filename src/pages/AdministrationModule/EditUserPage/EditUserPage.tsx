import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './EditUserPage.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../context/FormExitGuardContext';
import useNotification from '../../../hooks/useNotification';
import { requestOnlineAdministrationWrite } from '../../../services/administrationService';
import { cacheAdministrationRecord, useHatoCollection } from '../../../services/hatoDataService';
import { ASSIGNABLE_ROLES, WORKER_ROLE } from '../../../utils/roles';

export const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isOffline } = useAuth();
  const { farms, scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>('users', '/users', scope);
  const userRecord = useMemo(() => records.find((record) => record.id === id), [id, records]);
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
      const savedUser = await requestOnlineAdministrationWrite(`/users/${id}`, 'PATCH', {
        name: `${field('first_name')} ${field('last_name')}`.trim(),
        email: field('email'),
        phone: field('phone') || undefined,
        role: field('role'),
        farm_id: field('farm_id') || null,
      });
      await cacheAdministrationRecord(user.id, user.organization_id, 'users', savedUser);
      markCurrentFormsSaved(formElement);
      showNotification({ type: 'success', title: 'Usuario actualizado', message: 'Los cambios se guardaron en el backend.' });
      navigate('/admin/usuarios');
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudo actualizar el usuario.';
      setSubmissionError(message);
      showNotification({ type: 'error', title: 'No se pudo actualizar el usuario', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="container-fluid">Cargando datos locales del usuario…</p>;
  if (!userRecord) return <p className="container-fluid" role="alert">{error ?? 'El usuario no está disponible en este dispositivo.'}</p>;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <button type="button" className={styles.backBtn} onClick={() => navigate('/admin/usuarios')}>
        <ArrowLeft size={18} /><span>Volver a usuarios</span>
      </button>
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · EDITAR USUARIO</span>
        <h1 className={styles.sectionTitle}>Editar usuario</h1>
        <p className={styles.sectionDescription}>La información de cuenta y perfil se gestiona en un único formulario compartido.</p>
      </div>
      {isOffline && <p role="status">La visualización sigue disponible offline; para guardar cambios debes conectarte a internet.</p>}
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
              <input id="first_name" name="first_name" className={styles.input} defaultValue={String(userRecord.name ?? '').split(/\s+/).filter(Boolean).slice(0, 1)[0] ?? ''} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="last_name" className={styles.label}>Apellidos</label>
              <input id="last_name" name="last_name" className={styles.input} defaultValue={String(userRecord.name ?? '').split(/\s+/).filter(Boolean).slice(1).join(' ')} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="email" className={styles.label}>Correo electrónico</label>
              <input id="email" name="email" type="email" className={styles.input} defaultValue={String(userRecord.email ?? '')} required />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="phone" className={styles.label}>Teléfono</label>
              <input id="phone" name="phone" className={styles.input} defaultValue={String(userRecord.phone ?? '')} />
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
              <div className={styles.selectWrapper}>
                <select
                  id="role"
                  name="role"
                  className={styles.selectInput}
                  defaultValue={ASSIGNABLE_ROLES.find((role) => role === String(userRecord.role)) ?? WORKER_ROLE}
                >
                  {ASSIGNABLE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="status" className={styles.label}>Estado</label>
              <input id="status" className={`${styles.input} ${styles.readOnlyInput}`} defaultValue={String(userRecord.status ?? '')} readOnly disabled />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="farm_id" className={styles.label}>Finca asociada</label>
              <div className={styles.selectWrapper}>
                <select id="farm_id" name="farm_id" className={styles.selectInput} defaultValue={String(userRecord.farm_id ?? '')}>
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
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
