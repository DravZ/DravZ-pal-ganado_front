import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Home, Check } from 'lucide-react';
import styles from './FarmConfigModal.module.css';

export interface FarmFormData {
  name: string;
  code: string;
  state: string;
  municipality: string;
  locality: string;
  hectares: number | string;
  address: string;
}

interface FarmConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFarm: (farmData: FarmFormData) => void;
}

type FarmFormErrors = Partial<Record<keyof FarmFormData, string>>;

export const FarmConfigModal: React.FC<FarmConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmitFarm,
}) => {
  if (!isOpen) return null;

  // Estado local para los campos de la finca
  const [farmData, setFarmData] = useState<FarmFormData>({
    name: 'Finca La Esperanza',
    code: 'FIN-001',
    state: 'Antioquia',
    municipality: 'Puerto Berrío',
    locality: 'Vereda La Sierra',
    hectares: 0,
    address: 'Vía, kilómetro o indicaciones de acceso',
  });

  const [errors, setErrors] = useState<FarmFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFarmData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FarmFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FarmFormErrors = {};

    if (!farmData.name.trim()) newErrors.name = 'El nombre de la finca es obligatorio.';
    if (!farmData.code.trim()) newErrors.code = 'El código es obligatorio.';
    if (!farmData.state.trim()) newErrors.state = 'El departamento/estado es obligatorio.';
    if (!farmData.municipality.trim()) newErrors.municipality = 'El municipio es obligatorio.';

    const hectNum = Number(farmData.hectares);
    if (isNaN(hectNum) || hectNum < 0) {
      newErrors.hectares = 'Las hectáreas deben ser un número mayor o igual a 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmitFarm(farmData);
    }
  };

  // createPortal renderiza el modal en document.body para evitar que contenedores padres corten su tamaño
  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado Fijo */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.kicker}>ÚLTIMO PASO · FARMS</div>
            <h2 className={styles.modalTitle}>Configura tu primera finca</h2>
            <p className={styles.modalSubtitle}>Podrás agregar más fincas después.</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
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
                />
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
                    className={`${styles.inputControl} ${errors.hectares ? styles.inputError : ''}`}
                    placeholder="0"
                    value={farmData.hectares}
                    onChange={handleChange}
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
                />
              </div>
            </div>
          </form>
        </div>

        {/* Pie Fijo del Modal */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.backBtn} onClick={onClose}>
            Volver
          </button>
          <button type="submit" form="farmConfigForm" className={styles.submitBtn}>
            <Check size={18} strokeWidth={2.5} />
            <span>Crear finca y comenzar</span>
          </button>
        </div>
      </div>
    </div>,
    document.body // Renderizado al final del DOM
  );
};