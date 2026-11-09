import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import styles from './EditProfilePage.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useFarmScope } from '../../../context/FarmScopeContext';
import useNotification from '../../../hooks/useNotification';
import { requestOnlineAdministrationWrite } from '../../../services/administrationService';
import { cacheAdministrationRecord, useHatoRecord } from '../../../services/hatoDataService';
import { offlineDatabase } from '../../../services/offlineDatabase';

export const EditProfilePage: React.FC = () => {
  const { user, isOffline, updateUserDetails } = useAuth();
  const { scope, activeFarm } = useFarmScope();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const userScope = user ? {
    userId: user.id,
    organizationId: user.organization_id,
    farmId: user.farm_id ?? scope?.farmId ?? '',
  } : null;
  const { record, error: profileError } = useHatoRecord<Record<string, unknown>>(
    'users',
    user ? `/users/${user.id}` : '',
    user?.id ?? '',
    userScope,
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const name = String(record?.name ?? user?.name ?? '');
  const nameParts = name.split(/\s+/).filter(Boolean);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setSubmissionError('No se pudo determinar la cuenta de la sesión.');
      return;
    }
    if (isOffline) {
      const message = 'Editar el perfil requiere conexión a internet. No se guardaron cambios locales.';
      setSubmissionError(message);
      showNotification({ type: 'error', title: 'Se requiere conexión', message });
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const fields = new FormData(event.currentTarget);
      const value = (key: string) => String(fields.get(key) ?? '').trim();
      const updated = await requestOnlineAdministrationWrite('/users/' + user.id, 'PATCH', {
        name: `${value('first_name')} ${value('last_name')}`.trim(),
        email: value('email'),
        phone: value('phone') || undefined,
      });
      await cacheAdministrationRecord(user.id, user.organization_id, 'users', updated);

      const updatedName = String(updated.name ?? updated['name'] ?? `${value('first_name')} ${value('last_name')}`.trim());
      const updatedEmail = String(updated.email ?? value('email'));
      await offlineDatabase.profiles.update(user.id, {
        name: updatedName,
        email: updatedEmail,
      });
      updateUserDetails(updatedName, updatedEmail);
      showNotification({
        type: 'success',
        title: 'Perfil actualizado',
        message: 'Los datos se guardaron en el backend.',
      });
      navigate('/perfil');
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : 'No se pudieron guardar los cambios.';
      setSubmissionError(message);
      showNotification({ type: 'error', title: 'No se pudo actualizar el perfil', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <p className="container-fluid">No hay una sesión activa.</p>;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <button
        type="button"
        className={`${styles.backBtn} d-md-none`}
        onClick={() => navigate('/perfil')}
      >
        <ArrowLeft size={18} />
        <span>Volver a Mi perfil</span>
      </button>

      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>CUENTA · PERFIL</span>
        <h1 className={styles.sectionTitle}>Editar perfil</h1>
        <p className={styles.sectionDescription}>Actualiza tu información personal y de contacto.</p>
      </div>

      {isOffline && (
        <p role="status">La lectura está disponible sin conexión; para editar y guardar debes conectarte a internet.</p>
      )}
      {profileError && <p role="status">Se muestran los datos de perfil guardados localmente.</p>}
      {submissionError && (
        <div className={styles.errorViewCard} role="alert">
          <div className={styles.errorIconCircle}><AlertTriangle size={28} className={styles.errorIcon} /></div>
          <span className={styles.errorTag}>ERROR AL ACTUALIZAR</span>
          <h2 className={styles.errorTitle}>No pudimos guardar los cambios</h2>
          <p className={styles.errorDescription}>{submissionError}</p>
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form onSubmit={handleSubmit} className={styles.formCard}>
            <div className={styles.cardHeaderFlex}>
              <div className={styles.avatarBox}>
                {nameParts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')}
              </div>
              <div>
                <h2 className={styles.cardTitle}>Información personal</h2>
                <p className={styles.cardDescription}>Los cambios se envían directamente al backend.</p>
              </div>
            </div>

            <div className="row g-4 mt-1">
              <div className="col-12 col-md-6">
                <label htmlFor="first_name" className={styles.label}>Nombre</label>
                <input id="first_name" name="first_name" type="text" className={styles.input} defaultValue={nameParts[0] ?? ''} required />
              </div>
              <div className="col-12 col-md-6">
                <label htmlFor="last_name" className={styles.label}>Apellidos</label>
                <input id="last_name" name="last_name" type="text" className={styles.input} defaultValue={nameParts.slice(1).join(' ')} required />
              </div>
              <div className="col-12 col-md-6">
                <label htmlFor="email" className={styles.label}>Correo electrónico</label>
                <input id="email" name="email" type="email" className={styles.input} defaultValue={String(record?.email ?? user.email)} required />
              </div>
              <div className="col-12 col-md-6">
                <label htmlFor="phone" className={styles.label}>Teléfono</label>
                <input id="phone" name="phone" type="text" className={styles.input} defaultValue={String(record?.phone ?? '')} />
              </div>
            </div>

            <div className={styles.formActionsFlex}>
              <button type="button" className={styles.cancelBtn} onClick={() => navigate('/perfil')}>Cancelar</button>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting || isOffline}>
                <Check size={18} />
                <span>{isSubmitting ? 'Guardando…' : 'Guardar cambios'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <div className={styles.uneditableCard}>
            <span className={styles.uneditableTag}>DATOS NO EDITABLES</span>
            <h3 className={styles.uneditableTitle}>Información de la cuenta</h3>
            <p className={styles.uneditableDescription}>El rol y la finca dependen de tu acceso a la organización.</p>
            <div className={styles.uneditableGroup}>
              <span className={styles.uneditableLabel}>Rol</span>
              <span className={styles.uneditableValue}>{String(record?.role ?? user.role)}</span>
            </div>
            <div className={styles.uneditableGroup}>
              <span className={styles.uneditableLabel}>Finca actual</span>
              <span className={styles.uneditableValue}>{String(record?.farm_name ?? record?.farmName ?? activeFarm?.name ?? 'Sin finca asignada')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
