import React from 'react';
import { Beef } from 'lucide-react';
import styles from './Step1BasicData.module.css';

interface Step1Props {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Step1BasicData: React.FC<Step1Props> = ({ formData, onChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeaderGroup}>
        <div className={styles.stepIconBadge}>
          <Beef size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>Información básica</h2>
          <p className={styles.stepSubtitle}>
            Datos principales para identificar al animal dentro del hato.
          </p>
        </div>
      </div>

      <div className="row g-3">
        {/* Nombre */}
        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>
            Nombre <span className={styles.fieldTag}>(animals.name)</span>
          </label>
          <input
            type="text"
            className={styles.formControl}
            placeholder="Ej. Esperanza"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>

        {/* Sexo (Hembra / Macho Toggle) */}
        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>
            Sexo <span className={styles.fieldTag}>(animals.sex)</span>
          </label>
          <div className={styles.sexToggleGroup}>
            <button
              type="button"
              className={`${styles.sexToggleBtn} ${
                formData.sex === 'Hembra' ? styles.sexToggleActiveHembra : ''
              }`}
              onClick={() => onChange('sex', 'Hembra')}
            >
              <span>♀ Hembra</span>
            </button>

            <button
              type="button"
              className={`${styles.sexToggleBtn} ${
                formData.sex === 'Macho' ? styles.sexToggleActiveMacho : ''
              }`}
              onClick={() => onChange('sex', 'Macho')}
            >
              <span>♂ Macho</span>
            </button>
          </div>
        </div>

        {/* Especie */}
        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>
            Especie <span className={styles.fieldTag}>(animals.species)</span>
          </label>
          <select
            className={styles.formControl}
            value={formData.species}
            onChange={(e) => onChange('species', e.target.value)}
          >
            <option value="Bovino">Bovino</option>
            <option value="Bubalino">Bubalino</option>
            <option value="Ovino">Ovino</option>
          </select>
        </div>

        {/* Raza */}
        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>
            Raza <span className={styles.fieldTag}>(animals.breed)</span>
          </label>
          <select
            className={styles.formControl}
            value={formData.breed}
            onChange={(e) => onChange('breed', e.target.value)}
          >
            <option value="Nelore">Nelore</option>
            <option value="Angus">Angus</option>
            <option value="Brahman">Brahman</option>
            <option value="Gyr">Gyr</option>
            <option value="Braford">Braford</option>
          </select>
        </div>

        {/* Fecha de nacimiento */}
        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>
            Fecha de nacimiento <span className={styles.fieldTag}>(animals.birth_date)</span>
          </label>
          <input
            type="date"
            className={styles.formControl}
            value={formData.birthDate}
            onChange={(e) => onChange('birthDate', e.target.value)}
          />
        </div>

        {/* Peso al nacer */}
        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>
            Peso al nacer <span className={styles.fieldTag}>(animals.birth_weight)</span>
          </label>
          <div className="position-relative">
            <input
              type="number"
              className={styles.formControl}
              placeholder="0"
              value={formData.birthWeight || ''}
              onChange={(e) => onChange('birthWeight', e.target.value)}
            />
            <span
              className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              kg
            </span>
          </div>
        </div>
      </div>

      {/* Bloque: Datos de Adquisición */}
      <div className={styles.optionalCard}>
        <div className={styles.optionalHeader}>
          <span className={styles.optionalTitle}>DATOS DE ADQUISICIÓN</span>
          <span className={styles.optionalBadge}>Opcional</span>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className={styles.formLabel}>Fecha de adquisición</label>
            <input
              type="date"
              className={styles.formControl}
              value={formData.acquisitionDate}
              onChange={(e) => onChange('acquisitionDate', e.target.value)}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.formLabel}>Costo de adquisición</label>
            <div className="position-relative">
              <span
                className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary"
                style={{ fontSize: '0.9rem' }}
              >
                $
              </span>
              <input
                type="number"
                className={styles.formControl}
                style={{ paddingLeft: '2.25rem' }}
                placeholder="0.00"
                value={formData.acquisitionCost || ''}
                onChange={(e) => onChange('acquisitionCost', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};