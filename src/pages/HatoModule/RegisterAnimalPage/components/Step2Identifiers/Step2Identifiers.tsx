import React from 'react';
import { Scan, Plus } from 'lucide-react';
import styles from './Step2Identifiers.module.css';

interface Step2Props {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Step2Identifiers: React.FC<Step2Props> = ({ formData, onChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeaderGroup}>
        <div className={styles.stepIconBadge}>
          <Scan size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>Identificadores</h2>
          <p className={styles.stepSubtitle}>
            Agrega uno o varios aretes, códigos oficiales o microchips.
          </p>
        </div>
      </div>

      {/* Tarjeta del primer identificador */}
      <div className={styles.identifierCard}>
        <div className={styles.cardTopHeader}>
          <div className={styles.badgeNumber}>1</div>
          <div>
            <h3 className={styles.cardTitle}>Identificador 1</h3>
            <p className={styles.cardSubtitle}>Principal</p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label className={styles.formLabel}>
                Tipo <span className={styles.fieldTag}>(identifier_type)</span>
              </label>
              <select
                className={styles.formControl}
                value={formData.identifierType}
                onChange={(e) => onChange('identifierType', e.target.value)}
              >
                <option value="Siniga">Siniga</option>
                <option value="Arete Visual">Arete Visual</option>
                <option value="Microchip">Microchip</option>
                <option value="Tatuaje">Tatuaje</option>
              </select>
            </div>

            <div className="col-12 col-md-7">
              <label className={styles.formLabel}>
                Código <span className={styles.fieldTag}>(identifier)</span>
              </label>
              <input
                type="text"
                className={styles.formControl}
                value={formData.identifierCode}
                onChange={(e) => onChange('identifierCode', e.target.value)}
                placeholder="BR-"
              />
            </div>
          </div>

          <div className={styles.cardFooterToggles}>
            <label className={styles.toggleLabelGroup}>
              <input
                type="checkbox"
                className="form-check-input mt-0"
                checked={formData.isOfficial}
                onChange={(e) => onChange('isOfficial', e.target.checked)}
              />
              <div>
                <div className={styles.toggleTextTitle}>Identificador oficial</div>
                <div className={styles.toggleTextSub}>Emitido por una autoridad</div>
              </div>
            </label>

            <div className="d-flex align-items-center gap-3">
              <div className="text-end d-none d-sm-block">
                <div className={styles.toggleTextTitle}>Identificador actual</div>
                <div className={styles.toggleTextSub}>Visible como identificación principal</div>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={formData.isCurrent}
                  onChange={(e) => onChange('isCurrent', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" className={styles.addBtn}>
        <Plus size={18} strokeWidth={2.5} />
        <span>Agregar otro identificador</span>
      </button>
    </div>
  );
};