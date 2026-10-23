import React from 'react';
import { Syringe, Bell } from 'lucide-react';
import styles from './Step3TreatmentDetails.module.css';

interface Step3Props {
  medication: string;
  onMedicationChange: (val: string) => void;
  dose: string;
  onDoseChange: (val: string) => void;
  doseUnit: string;
  onDoseUnitChange: (val: string) => void;
  treatmentRoute: string;
  onTreatmentRouteChange: (val: string) => void;
}

export const Step3TreatmentDetails: React.FC<Step3Props> = ({
  medication,
  onMedicationChange,
  dose,
  onDoseChange,
  doseUnit,
  onDoseUnitChange,
  treatmentRoute,
  onTreatmentRouteChange,
}) => {
  return (
    <div className={styles.stepContainer}>
      {/* Banner Superior Sanitario */}
      <div className={styles.bannerSanitary}>
        <div className={styles.bannerInfoGroup}>
          <div className={styles.syringeIconBox}>
            <Syringe size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className={styles.bannerKicker}>REGISTRO SANITARIO OPCIONAL</div>
            <h4 className={styles.bannerTitle}>Agrega los datos del tratamiento</h4>
          </div>
        </div>
        <span className={styles.queueBadge}>Se guardará en cola</span>
      </div>

      {/* Medicamento */}
      <div>
        <label className={styles.formLabel}>Medicamento</label>
        <select
          className={styles.controlInput}
          value={medication}
          onChange={(e) => onMedicationChange(e.target.value)}
        >
          <option value="">Sin tratamiento adicional</option>
          <option value="Ivermectina 1%">Ivermectina 1%</option>
          <option value="Vitamina ADE">Vitamina ADE</option>
          <option value="Vacuna Aftosa">Vacuna Aftosa</option>
          <option value="Oxitetraciclina">Oxitetraciclina</option>
        </select>
      </div>

      {/* Dosis y Unidad */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>Dosis</label>
          <input
            type="number"
            className={styles.controlInput}
            placeholder="Ej. 10"
            value={dose}
            onChange={(e) => onDoseChange(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>Unidad de dosis</label>
          <select
            className={styles.controlInput}
            value={doseUnit}
            onChange={(e) => onDoseUnitChange(e.target.value)}
          >
            <option value="mL">mL</option>
            <option value="mg">mg</option>
            <option value="Dosis">Dosis</option>
          </select>
        </div>
      </div>

      {/* Vía del tratamiento */}
      <div>
        <label className={styles.formLabel}>Vía del tratamiento</label>
        <select
          className={styles.controlInput}
          value={treatmentRoute}
          onChange={(e) => onTreatmentRouteChange(e.target.value)}
        >
          <option value="Subcutánea">Subcutánea</option>
          <option value="Intramuscular">Intramuscular</option>
          <option value="Oral">Oral</option>
          <option value="Tópica">Tópica</option>
        </select>
      </div>

      {/* Alerta de Retiro */}
      <div className={styles.withdrawalAlertBox}>
        <Bell size={20} className={styles.bellIcon} />
        <div>
          <h5 className={styles.alertTitle}>
            La fecha de retiro se calculará automáticamente.
          </h5>
          <p className={styles.alertSub}>
            El animal quedará bloqueado para venta durante el periodo de retiro.
          </p>
        </div>
      </div>
    </div>
  );
};