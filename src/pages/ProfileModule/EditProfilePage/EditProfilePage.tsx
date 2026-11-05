import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import styles from './EditProfilePage.module.css';
import type { User } from '../../../types/database.types';

interface EditProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // Estado con datos precargados del usuario
  const [formData, setFormData] = useState<EditProfileFormData>({
    first_name: 'Rafael',
    last_name: 'Mendes',
    email: 'rafael@serraverde.com',
    phone: '+57 300 482 1930'
  });

  // Datos no editables asociados a la cuenta
  const uneditableAccountInfo = {
    role: 'Administrador',
    current_farm: 'Finca Serra Verde'
  };

  // Estados de vista y error
  const [showErrorView, setShowErrorView] = useState<boolean>(false);
  const [simulateErrorToggle, setSimulateErrorToggle] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Manejador de cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejador de envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (simulateErrorToggle) {
      // Muestra la pantalla dedicada de error al actualizar conservando los datos
      setShowErrorView(true);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Payload mapeado para la tabla users y sync_queue
      const updatedUserPayload: Partial<User> = {
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      };

      console.log('[Action Log]: Perfil actualizado con éxito', updatedUserPayload);
      navigate('/perfil');
    }, 600);
  };

  // VISTA DEDICADA DE ERROR AL GUARDAR
  if (showErrorView) {
    return (
      <div className={`container-fluid ${styles.pageContainer}`}>
        {/* Botón Volver a editar superior */}
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => setShowErrorView(false)}
        >
          <ArrowLeft size={18} />
          <span>Volver a editar</span>
        </button>

        {/* Tarjeta Centrada de Error */}
        <div className={styles.errorViewCard}>
          <div className={styles.errorIconCircle}>
            <AlertTriangle size={28} className={styles.errorIcon} />
          </div>

          <span className={styles.errorTag}>ERROR AL ACTUALIZAR</span>
          <h2 className={styles.errorTitle}>No pudimos guardar los cambios</h2>
          <p className={styles.errorDescription}>
            Ocurrió un problema al actualizar tu perfil. Verifica la información e inténtalo nuevamente.
          </p>

          <div className={styles.errorActionsFlex}>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={() => {
                setShowErrorView(false);
                setSimulateErrorToggle(false);
              }}
            >
              Intentar de nuevo
            </button>
            <button
              type="button"
              className={styles.backToEditBtn}
              onClick={() => setShowErrorView(false)}
            >
              Volver a editar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL DEL FORMULARIO DE EDICIÓN
  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Botón Volver a Mi perfil en dispositivos móviles */}
      <button
        type="button"
        className={`${styles.backBtn} d-md-none`}
        onClick={() => navigate('/perfil')}
      >
        <ArrowLeft size={18} />
        <span>Volver a Mi perfil</span>
      </button>

      {/* Encabezado */}
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>CUENTA · PERFIL</span>
        <h1 className={styles.sectionTitle}>Editar perfil</h1>
        <p className={styles.sectionDescription}>
          Actualiza tu información personal y de contacto.
        </p>
      </div>

      {/* REJILLA PRINCIPAL (FORMULARIO EDITABLE + DATOS NO EDITABLES) */}
      <div className="row g-4">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="col-12 col-lg-7">
          <form onSubmit={handleSubmit} className={styles.formCard}>
            <div className={styles.cardHeaderFlex}>
              <div className={styles.avatarBox}>RM</div>
              <div>
                <h2 className={styles.cardTitle}>Información personal</h2>
                <p className={styles.cardDescription}>
                  Estos datos identifican tu cuenta dentro de la organización.
                </p>
              </div>
            </div>

            <div className="row g-4 mt-1">
              {/* Nombre */}
              <div className="col-12 col-md-6">
                <label htmlFor="first_name" className={styles.label}>
                  Nombre
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className={styles.input}
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Apellidos */}
              <div className="col-12 col-md-6">
                <label htmlFor="last_name" className={styles.label}>
                  Apellidos
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className={styles.input}
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Correo electrónico */}
              <div className="col-12 col-md-6">
                <label htmlFor="email" className={styles.label}>
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Teléfono */}
              <div className="col-12 col-md-6">
                <label htmlFor="phone" className={styles.label}>
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className={styles.input}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className={styles.formActionsFlex}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate('/perfil')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                <Check size={18} />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</span>
              </button>
            </div>

            {/* SIMULADOR DE ERROR */}
            <div className={styles.simulationFooter}>
              <button
                type="button"
                className={styles.simulateErrorBtn}
                onClick={() => setSimulateErrorToggle((prev) => !prev)}
              >
                {simulateErrorToggle
                  ? 'Desactivar simulación de error'
                  : 'Simular error al guardar'}
              </button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: DATOS NO EDITABLES */}
        <div className="col-12 col-lg-5">
          <div className={styles.uneditableCard}>
            <span className={styles.uneditableTag}>DATOS NO EDITABLES</span>
            <h3 className={styles.uneditableTitle}>Información de la cuenta</h3>
            <p className={styles.uneditableDescription}>
              Estos valores dependen de tu acceso a la organización.
            </p>

            <div className={styles.uneditableGroup}>
              <span className={styles.uneditableLabel}>Rol</span>
              <span className={styles.uneditableValue}>{uneditableAccountInfo.role}</span>
            </div>

            <div className={styles.uneditableGroup}>
              <span className={styles.uneditableLabel}>Finca actual</span>
              <span className={styles.uneditableValue}>{uneditableAccountInfo.current_farm}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;