import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import styles from './CreateFarmPage.module.css';

interface FarmFormData {
  name: string;
  code: string;
  state: string;
  municipality: string;
  locality: string;
  hectares: string;
  address: string;
}

export const CreateFarmPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados del formulario inicializados
  const [formData, setFormData] = useState<FarmFormData>({
    name: '',
    code: 'FIN-001',
    state: '',
    municipality: '',
    locality: '',
    hectares: '',
    address: ''
  });

  // Estado para la simulación de error de servidor
  const [showServerError, setShowServerError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Manejador de cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar finca
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (showServerError) {
      // Si la simulación de error está activa, muestra el estado y conserva la información ingresada
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Payload mapeado para la tabla farms y sync_queue
      const farmPayload = {
        name: formData.name,
        code: formData.code,
        state: formData.state || undefined,
        municipality: formData.municipality || undefined,
        locality: formData.locality || undefined,
        hectares: formData.hectares ? parseFloat(formData.hectares) : undefined,
        address: formData.address || undefined,
        status: 'active',
        organization_id: 'org-123',
        created_at: new Date().toISOString()
      };

      console.log('[Action Log]: Finca registrada en el sistema', farmPayload);
      navigate('/admin/fincas');
    }, 600);
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Botón Volver */}
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate('/admin/fincas')}
      >
        <ArrowLeft size={18} />
        <span>Volver a fincas</span>
      </button>

      {/* Encabezado */}
      <div className={styles.headerFlex}>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · NUEVA FINCA</span>
        <h1 className={styles.sectionTitle}>Crear finca</h1>
        <p className={styles.sectionDescription}>
          Registra únicamente la información soportada por el modelo actual de fincas.
        </p>
      </div>

      {/* BANNER DE ERROR SIMULADO DE SERVIDOR */}
      {showServerError && (
        <div className={styles.errorBanner}>
          <AlertTriangle className={styles.errorIcon} size={22} />
          <div>
            <h4 className={styles.errorTitle}>No pudimos guardar la finca</h4>
            <p className={styles.errorDescription}>
              Los valores ingresados se conservan para volver a intentarlo.
            </p>
          </div>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL DE CREACIÓN */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* SECCIÓN 1: IDENTIFICACIÓN */}
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>IDENTIFICACIÓN</span>
          <h2 className={styles.groupTitle}>Información principal</h2>

          <div className="row g-4 mt-1">
            {/* Nombre de la finca */}
            <div className="col-12 col-md-6">
              <label htmlFor="name" className={styles.label}>
                Nombre de la finca (farms.name)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Finca La Esperanza"
                required
              />
            </div>

            {/* Código */}
            <div className="col-12 col-md-6">
              <label htmlFor="code" className={styles.label}>
                Código (farms.code)
              </label>
              <input
                id="code"
                name="code"
                type="text"
                className={styles.input}
                value={formData.code}
                onChange={handleChange}
                placeholder="FIN-001"
              />
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* SECCIÓN 2: UBICACIÓN Y SUPERFICIE */}
        <div className={styles.formSection}>
          <span className={styles.sectionTag}>UBICACIÓN Y SUPERFICIE</span>
          <h2 className={styles.groupTitle}>Datos de la finca</h2>

          <div className="row g-4 mt-1">
            {/* Departamento / Estado */}
            <div className="col-12 col-md-6">
              <label htmlFor="state" className={styles.label}>
                Departamento / Estado (farms.state)
              </label>
              <input
                id="state"
                name="state"
                type="text"
                className={styles.input}
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            {/* Municipio */}
            <div className="col-12 col-md-6">
              <label htmlFor="municipality" className={styles.label}>
                Municipio (farms.municipality)
              </label>
              <input
                id="municipality"
                name="municipality"
                type="text"
                className={styles.input}
                value={formData.municipality}
                onChange={handleChange}
              />
            </div>

            {/* Vereda / Localidad */}
            <div className="col-12 col-md-6">
              <label htmlFor="locality" className={styles.label}>
                Vereda / Localidad (farms.locality)
              </label>
              <input
                id="locality"
                name="locality"
                type="text"
                className={styles.input}
                value={formData.locality}
                onChange={handleChange}
              />
              <span className={styles.optionalText}>Opcional</span>
            </div>

            {/* Hectáreas */}
            <div className="col-12 col-md-6">
              <label htmlFor="hectares" className={styles.label}>
                Hectáreas (farms.hectares)
              </label>
              <div className={styles.inputWithSuffix}>
                <input
                  id="hectares"
                  name="hectares"
                  type="number"
                  step="0.01"
                  className={styles.input}
                  value={formData.hectares}
                  onChange={handleChange}
                />
                <span className={styles.suffix}>ha</span>
              </div>
            </div>

            {/* Dirección / Referencia */}
            <div className="col-12">
              <label htmlFor="address" className={styles.label}>
                Dirección / referencia (farms.address)
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className={styles.input}
                value={formData.address}
                onChange={handleChange}
              />
              <span className={styles.optionalText}>Opcional</span>
            </div>
          </div>
        </div>

        {/* ACCIONES DEL FORMULARIO */}
        <div className={styles.formActionsFlex}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate('/admin/fincas')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar finca'}
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

export default CreateFarmPage;