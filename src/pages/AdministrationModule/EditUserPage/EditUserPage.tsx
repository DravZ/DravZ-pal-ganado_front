import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './EditUserPage.module.css';
import type { User } from '../../../types/database.types';

interface EditUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  farm_id: string;
}

export const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Estados del formulario inicializados con datos por defecto/precargados
  const [formData, setFormData] = useState<EditUserFormData>({
    first_name: 'Rafael',
    last_name: 'Mendes',
    email: 'rafael@serraverde.com',
    phone: '+57 300 482 1930',
    role: 'Administrador',
    status: 'Activo',
    farm_id: 'farm-serra-verde'
  });

  const [showServerError, setShowServerError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Manejador de cambios en inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar formulario / Actualizar usuario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (showServerError) {
      // Si la simulación de error está activa, conserva la información en pantalla
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Payload mapeado para la tabla users y sync_queue
      const updatedUserPayload: Partial<User> & { farm_id: string; role: string } = {
        id: id || 'user-1',
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        farm_id: formData.farm_id,
        updated_at: new Date().toISOString()
      };

      console.log('[Action Log]: Usuario actualizado con éxito', updatedUserPayload);
      navigate('/usuarios');
    }, 600);
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Botón Volver */}
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate('/usuarios')}
      >
        <ArrowLeft size={18} />
        <span>Volver a usuarios</span>
      </button>

      {/* Encabezado */}
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · EDITAR USUARIO</span>
        <h1 className={styles.sectionTitle}>Editar usuario</h1>
        <p className={styles.sectionDescription}>
          La información de cuenta y perfil se gestiona en un único formulario compartido.
        </p>
      </div>

      {/* BANNER DE ERROR SIMULADO DE SERVIDOR */}
      {showServerError && (
        <div className={styles.errorBanner}>
          <AlertTriangle className={styles.errorIcon} size={22} />
          <div>
            <h4 className={styles.errorTitle}>No pudimos guardar el usuario</h4>
            <p className={styles.errorDescription}>
              La información se conserva. Inténtalo nuevamente.
            </p>
          </div>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL DE EDICIÓN */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>INFORMACIÓN DE CUENTA Y PERFIL</span>
          <h2 className={styles.groupTitle}>Datos personales</h2>

          <div className="row g-4 mt-1">
            {/* Nombre */}
            <div className="col-12 col-md-6">
              <label htmlFor="first_name" className={styles.label}>
                Nombre (users.first_name)
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
                Apellidos (users.last_name)
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
                Correo electrónico (users.email)
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
                Teléfono (users.phone)
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
        </div>

        <hr className={styles.divider} />

        {/* SECCIÓN 2: ASIGNACIÓN ADMINISTRATIVA */}
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>ASIGNACIÓN ADMINISTRATIVA</span>
          <h2 className={styles.groupTitle}>Acceso y finca</h2>

          <div className="row g-4 mt-1">
            {/* Rol (Solo lectura) */}
            <div className="col-12 col-md-6">
              <label htmlFor="role" className={styles.label}>
                Rol (organization_users.role)
              </label>
              <input
                id="role"
                type="text"
                className={`${styles.input} ${styles.readOnlyInput}`}
                value={formData.role}
                readOnly
                disabled
              />
              <span className={styles.fieldHelpText}>
                Los perfiles disponibles dependen de reglas de autorización aún no definidas.
              </span>
            </div>

            {/* Estado (Solo lectura) */}
            <div className="col-12 col-md-6">
              <label htmlFor="status" className={styles.label}>
                Estado (organization_users.status)
              </label>
              <input
                id="status"
                type="text"
                className={`${styles.input} ${styles.readOnlyInput}`}
                value={formData.status}
                readOnly
                disabled
              />
            </div>

            {/* Finca asociada */}
            <div className="col-12 col-md-6">
              <label htmlFor="farm_id" className={styles.label}>
                Finca asociada (organization_users.farm_id)
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="farm_id"
                  name="farm_id"
                  className={styles.selectInput}
                  value={formData.farm_id}
                  onChange={handleChange}
                >
                  <option value="farm-serra-verde">Finca Serra Verde</option>
                  <option value="farm-san-jose">Finca San José</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className={styles.formActionsFlex}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate('/usuarios')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* BOTÓN INFERIOR DE SIMULACIÓN DE ERROR */}
        <div className={styles.simulationFooter}>
          <button
            type="button"
            className={styles.simulateErrorBtn}
            onClick={() => setShowServerError((prev) => !prev)}
          >
            {showServerError ? 'Ocultar error de servidor' : 'Simular error de servidor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;