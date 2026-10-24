import React from 'react';
import { Scale, WifiOff } from 'lucide-react';
import styles from './Step4InitialWeight.module.css';

interface Step4Props {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Step4InitialWeight: React.FC<Step4Props> = ({ formData, onChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeaderGroup}>
        <div className={styles.stepIconBadge}>
          <Scale size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>Peso inicial</h2>
          <p className={styles.stepSubtitle}>
            Registra el peso más reciente para iniciar su curva de crecimiento.
          </p>
        </div>
      </div>

      <div className={styles.greenBox}>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className={styles.formLabel}>
              Peso actual <span className={styles.fieldTag}>(animals.current_weight)</span>
            </label>
            <div className="position-relative">
              <input
                type="number"
                className={`${styles.formControl} ${styles.formControlBig}`}
                placeholder="0"
                value={formData.currentWeight || ''}
                onChange={(e) => onChange('currentWeight', e.target.value)}
              />
              <span
                className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary font-weight-bold"
                style={{ fontSize: '1rem' }}
              >
                kg
              </span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <label className={styles.formLabel}>
              Fecha de medición <span className={styles.fieldTag}>(current_weight_date)</span>
            </label>
            <input
              type="date"
              className={styles.formControl}
              value={formData.currentWeightDate}
              onChange={(e) => onChange('currentWeightDate', e.target.value)}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className={styles.formLabel}>Método de medición</label>
            <select
              className={styles.formControl}
              value={formData.measurementMethod}
              onChange={(e) => onChange('measurementMethod', e.target.value)}
            >
              <option value="Báscula digital">Báscula digital</option>
              <option value="Cinta pesimétrica">Cinta pesimétrica</option>
              <option value="Estimación visual">Estimación visual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen del registro */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryKicker}>RESUMEN DEL REGISTRO</span>
          <span className={styles.pendingBadge}>Pendiente de guardar</span>
        </div>

        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className={styles.summaryLabel}>Sexo</div>
            <div className={styles.summaryValue}>{formData.sex}</div>
          </div>

          <div className="col-6 col-md-3">
            <div className={styles.summaryLabel}>Especie</div>
            <div className={styles.summaryValue}>{formData.species}</div>
          </div>

          <div className="col-6 col-md-3">
            <div className={styles.summaryLabel}>Identificadores</div>
            <div className={styles.summaryValue}>1</div>
          </div>

          <div className="col-6 col-md-3">
            <div className={styles.summaryLabel}>Ubicación</div>
            <div className={styles.summaryValue}>{formData.loteId}</div>
          </div>
        </div>
      </div>

      {/* Banner de Sincronización Offline */}
      <div className={styles.offlineBanner}>
        <WifiOff size={20} className={styles.offlineIcon} />
        <div>
          <h4 className={styles.offlineTitle}>Este registro funciona sin conexión</h4>
          <p className={styles.offlineSub}>
            Se guardará localmente en sync_queue y se sincronizará al recuperar señal.
          </p>
        </div>
      </div>
    </div>
  );
};