import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './CreateUserPage.module.css';

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  farm_id: string;
}

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados del formulario inicializados
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Perfil por confirmar',
    status: 'Invitación pendiente',
    farm_id: 'farm-serra-verde'
  });

  // Estado para la simulación de error de servidor
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

  // Guardar usuario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (showServerError) {
      // Si la simulación de error está activa, muestra el estado y detiene la navegación
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Payload mapeado para la tabla users y sync_queue
      const userPayload = {
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        phone: formData.phone,
        status: 'pending_invitation',
        role: formData.role,
        farm_id: formData.farm_id,
        created_at: new Date().toISOString()
      };

      console.log('[Action Log]: Usuario registrado en sistema', userPayload);
      navigate('/usuarios');
    }, 600);
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Botón Volver */}
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate('/admin/usuarios')}
      >
        <ArrowLeft size={18} />
        <span>Volver a usuarios</span>
      </button>

      {/* Encabezado */}
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · NUEVO USUARIO</span>
        <h1 className={styles.sectionTitle}>Crear usuario</h1>
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

      {/* FORMULARIO PRINCIPAL DE CREACIÓN */}
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
                placeholder=""
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
                placeholder=""
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
                placeholder="nombre@correo.com"
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
                placeholder="+57 300 000 0000"
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
            {/* Rol (Readonly) */}
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

            {/* Estado (Readonly) */}
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

        {/* ACCIONES DEL FORMULARIO */}
        <div className={styles.formActionsFlex}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate('/admin/usuarios')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar usuario'}
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

export default CreateUserPage;