import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './EditOrganizationInfoPage.module.css';
import type { Organization } from '../../../types/database.types';

export const EditOrganizationInfoPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados del formulario inicializados con la organización actual
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: 'Ganadería Serra Verde',
    legal_name: 'Ganadería Serra Verde S.A.S.',
    tax_id: '900.482.193-1',
    email: 'administracion@serraverde.com',
    phone: '+57 604 555 0182'
  });

  // Estado para la simulación de error de servidor / guardado
  const [showServerError, setShowServerError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Manejador de cambio de campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios reales / simulados
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (showServerError) {
      // Si la simulación de error está activada, permanece en la pantalla
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Imprimir payload formal alineado a la BD
      console.log('[Action Log]: Organización actualizada', formData);
      navigate('/organizacion/informacion');
    }, 600);
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Botón Volver */}
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate('/organizacion/informacion')}
      >
        <ArrowLeft size={18} />
        <span>Volver a información general</span>
      </button>

      {/* Encabezado */}
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>CONFIGURACIÓN · ORGANIZACIÓN</span>
        <h1 className={styles.sectionTitle}>Editar información</h1>
        <p className={styles.sectionDescription}>
          Actualiza únicamente los atributos admitidos por el modelo actual.
        </p>
      </div>

      {/* BANNER DE ERROR SIMULADO DEL SERVIDOR */}
      {showServerError && (
        <div className={styles.errorBanner}>
          <AlertTriangle className={styles.errorIcon} size={22} />
          <div>
            <h4 className={styles.errorTitle}>No pudimos guardar la organización</h4>
            <p className={styles.errorDescription}>
              Los valores permanecen en el formulario para volver a intentarlo.
            </p>
          </div>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* SECCIÓN 1: IDENTIFICACIÓN */}
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>INFORMACIÓN GENERAL</span>
          <h2 className={styles.groupTitle}>Identificación de la organización</h2>

          <div className="row g-4 mt-1">
            {/* Nombre comercial */}
            <div className="col-12 col-md-6">
              <label htmlFor="name" className={styles.label}>
                Nombre comercial (organizations.name)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={styles.input}
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </div>

            {/* Razón social */}
            <div className="col-12 col-md-6">
              <label htmlFor="legal_name" className={styles.label}>
                Razón social (organizations.legal_name)
              </label>
              <input
                id="legal_name"
                name="legal_name"
                type="text"
                className={styles.input}
                value={formData.legal_name || ''}
                onChange={handleChange}
              />
            </div>

            {/* NIT / RUT (SOLO LECTURA) */}
            <div className="col-12 col-md-6">
              <label htmlFor="tax_id" className={styles.label}>
                NIT / RUT (organizations.tax_id)
              </label>
              <input
                id="tax_id"
                name="tax_id"
                type="text"
                className={`${styles.input} ${styles.readOnlyInput}`}
                value={formData.tax_id || ''}
                disabled
              />
              <span className={styles.fieldHelpText}>Identificador de solo lectura.</span>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* SECCIÓN 2: CANALES DE CONTACTO */}
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>CONTACTO</span>
          <h2 className={styles.groupTitle}>Canales de la organización</h2>

          <div className="row g-4 mt-1">
            {/* Correo de contacto */}
            <div className="col-12 col-md-6">
              <label htmlFor="email" className={styles.label}>
                Correo de contacto (organizations.email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.input}
                value={formData.email || ''}
                onChange={handleChange}
              />
              <span className={styles.fieldHelpText}>Opcional</span>
            </div>

            {/* Teléfono */}
            <div className="col-12 col-md-6">
              <label htmlFor="phone" className={styles.label}>
                Teléfono (organizations.phone)
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                className={styles.input}
                value={formData.phone || ''}
                onChange={handleChange}
              />
              <span className={styles.fieldHelpText}>Opcional</span>
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIONES ABAJO DE LAS SECCIONES */}
        <div className={styles.formActionsFlex}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate('/organizacion/informacion')}
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

        {/* BOTÓN INFERIOR DE SIMULACIÓN DE ERROR DE SERVIDOR */}
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

export default EditOrganizationInfoPage;