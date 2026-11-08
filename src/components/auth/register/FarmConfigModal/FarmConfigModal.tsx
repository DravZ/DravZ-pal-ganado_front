import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Home, Check } from 'lucide-react';
import styles from './FarmConfigModal.module.css';
import type { FarmFormValues } from '../../../../types/database.types';

interface FarmConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFarm: (farmData: FarmFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

type FarmFormErrors = Partial<Record<keyof FarmFormValues, string>>;

export const FarmConfigModal: React.FC<FarmConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmitFarm,
  isSubmitting = false,
}) => {
  // Estado local para los campos de la finca
  const [farmData, setFarmData] = useState<FarmFormValues>({
    name: '',
    code: '',
    state: '',
    municipality: '',
    locality: '',
    hectares: '',
    address: '',
  });

  const [errors, setErrors] = useState<FarmFormErrors>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFarmData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FarmFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FarmFormErrors = {};

    if (!farmData.name.trim()) {
      newErrors.name = 'El nombre de la finca es obligatorio.';
    } else if (farmData.name.trim().length > 150) {
      newErrors.name = 'El nombre no puede superar 150 caracteres.';
    }
    if (!farmData.code.trim()) {
      newErrors.code = 'El código es obligatorio.';
    } else if (farmData.code.trim().length > 50) {
      newErrors.code = 'El código no puede superar 50 caracteres.';
    }
    if (!farmData.state.trim()) {
      newErrors.state = 'El departamento/estado es obligatorio.';
    } else if (farmData.state.trim().length > 100) {
      newErrors.state = 'El departamento/estado no puede superar 100 caracteres.';
    }
    if (!farmData.municipality.trim()) {
      newErrors.municipality = 'El municipio es obligatorio.';
    } else if (farmData.municipality.trim().length > 100) {
      newErrors.municipality = 'El municipio no puede superar 100 caracteres.';
    }
    if (farmData.locality.trim().length > 100) {
      newErrors.locality = 'La localidad no puede superar 100 caracteres.';
    }

    const hectaresValue = String(farmData.hectares).trim();
    const hectNum = Number(hectaresValue);
    if (!hectaresValue || !Number.isFinite(hectNum) || hectNum < 0 || hectNum > 99999999.99) {
      newErrors.hectares = 'Indica un número de hectáreas entre 0 y 99,999,999.99.';
    } else if (!/^\d+(\.\d{1,2})?$/.test(hectaresValue)) {
      newErrors.hectares = 'Las hectáreas pueden tener hasta dos decimales.';
    }

    if (farmData.address.trim().length > 1000) {
      newErrors.address = 'La dirección no puede superar 1000 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmitFarm(farmData);
    }
  };

  // createPortal renderiza el modal en document.body para evitar que contenedores padres corten su tamaño
  return createPortal(
    <div className={styles.modalOverlay} onClick={() => {
      if (!isSubmitting) onClose();
    }}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado Fijo */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.kicker}>ÚLTIMO PASO · FARMS</div>
            <h2 className={styles.modalTitle}>Configura tu primera finca</h2>
            <p className={styles.modalSubtitle}>Podrás agregar más fincas después.</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} disabled={isSubmitting}>
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        {/* Cuerpo con Scroll si la pantalla es reducida */}
        <div className={styles.modalBody}>
          <div className={styles.infoBanner}>
            <div className={styles.homeIconBadge}>
              <Home size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className={styles.bannerTitle}>¿Dónde está tu operación?</div>
              <p className={styles.bannerText}>
                Esta información organiza potreros, lotes y registros productivos.
              </p>
            </div>
          </div>

          <form id="farmConfigForm" onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="farmName">
                  Nombre de la finca (farms.name)
                </label>
                <input
                  id="farmName"
                  name="name"
                  type="text"
                  className={`${styles.inputControl} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Ej. Finca La Esperanza"
                  value={farmData.name}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
                {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="farmCode">
                  Código (farms.code)
                </label>
                <input
                  id="farmCode"
                  name="code"
                  type="text"
                  className={`${styles.inputControl} ${errors.code ? styles.inputError : ''}`}
                  placeholder="FIN-001"
                  value={farmData.code}
                  onChange={handleChange}
                  maxLength={50}
                  required
                />
                {errors.code && <div className={styles.errorMessage}>{errors.code}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="farmState">
                  Departamento / Estado (farms.state)
                </label>
                <input
                  id="farmState"
                  name="state"
                  type="text"
                  className={`${styles.inputControl} ${errors.state ? styles.inputError : ''}`}
                  placeholder="Antioquia"
                  value={farmData.state}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
                {errors.state && <div className={styles.errorMessage}>{errors.state}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="farmMunicipality">
                  Municipio (farms.municipality)
                </label>
                <input
                  id="farmMunicipality"
                  name="municipality"
                  type="text"
                  className={`${styles.inputControl} ${errors.municipality ? styles.inputError : ''}`}
                  placeholder="Puerto Berrío"
                  value={farmData.municipality}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
                {errors.municipality && <div className={styles.errorMessage}>{errors.municipality}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="farmLocality">
                  Vereda / Localidad (farms.locality)
                </label>
                <input
                  id="farmLocality"
                  name="locality"
                  type="text"
                  className={styles.inputControl}
                  placeholder="Vereda La Sierra"
                  value={farmData.locality}
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.locality && <div className={styles.errorMessage}>{errors.locality}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className={styles.fieldLabel} htmlFor="farmHectares">
                  Hectáreas (farms.hectares)
                </label>
                <div className={styles.inputGroupSuffix}>
                  <input
                    id="farmHectares"
                    name="hectares"
                    type="number"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    className={`${styles.inputControl} ${errors.hectares ? styles.inputError : ''}`}
                    placeholder="0"
                    value={farmData.hectares}
                    onChange={handleChange}
                    required
                  />
                  <span className={styles.suffixText}>ha</span>
                </div>
                {errors.hectares && <div className={styles.errorMessage}>{errors.hectares}</div>}
              </div>

              <div className="col-12">
                <label className={styles.fieldLabel} htmlFor="farmAddress">
                  Dirección (farms.address)
                </label>
                <input
                  id="farmAddress"
                  name="address"
                  type="text"
                  className={styles.inputControl}
                  placeholder="Vía, kilómetro o indicaciones de acceso"
                  value={farmData.address}
                  onChange={handleChange}
                  maxLength={1000}
                />
                {errors.address && <div className={styles.errorMessage}>{errors.address}</div>}
              </div>
            </div>
          </form>
        </div>

        {/* Pie Fijo del Modal */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.backBtn} onClick={onClose} disabled={isSubmitting}>
            Volver
          </button>
          <button type="submit" form="farmConfigForm" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? null : <Check size={18} strokeWidth={2.5} />}
            <span>{isSubmitting ? 'Creando cuenta...' : 'Crear finca y comenzar'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body // Renderizado al final del DOM
  );
};