import React from 'react';
import { Home, Beef } from 'lucide-react';
import styles from './Step3LocationGenealogy.module.css';

interface Step3Props {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Step3LocationGenealogy: React.FC<Step3Props> = ({ formData, onChange }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeaderGroup}>
        <div className={styles.stepIconBadge}>
          <Home size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>Ubicación y genealogía</h2>
          <p className={styles.stepSubtitle}>
            Asigna su ubicación actual y registra los padres conocidos.
          </p>
        </div>
      </div>

      {/* Ubicación Actual */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeaderFlex}>
          <span className={styles.sectionKicker}>UBICACIÓN ACTUAL</span>
          <span className={styles.badgeRequired}>Requerido</span>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className={styles.formLabel}>
              Lote <span className={styles.fieldTag}>(current_lot_id)</span>
            </label>
            <select
              className={styles.formControl}
              value={formData.loteId}
              onChange={(e) => onChange('loteId', e.target.value)}
            >
              <option value="Vacas de cría">Vacas de cría · 58 animales</option>
              <option value="Novillos levante">Novillos levante · 32 animales</option>
              <option value="Ceba final">Ceba final · 40 animales</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.formLabel}>
              Potrero <span className={styles.fieldTag}>(current_paddock_id)</span>
            </label>
            <select
              className={styles.formControl}
              value={formData.potreroId}
              onChange={(e) => onChange('potreroId', e.target.value)}
            >
              <option value="Potrero Norte">Potrero Norte · 48 ha</option>
              <option value="La Quebrada">La Quebrada · 35 ha</option>
              <option value="Loma Alta">Loma Alta · 20 ha</option>
            </select>
          </div>
        </div>
      </div>

      {/* Genealogía */}
      <div className={styles.cardSection}>
        <div className={styles.sectionHeaderFlex}>
          <span className={styles.sectionKicker}>GENEALOGÍA</span>
          <span className={styles.badgeOptional}>Opcional</span>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className={styles.formLabel}>
              Padre <span className={styles.fieldTag}>(sire_id)</span>
            </label>
            <select
              className={styles.formControl}
              value={formData.sireId}
              onChange={(e) => onChange('sireId', e.target.value)}
            >
              <option value="">Sin padre registrado</option>
              <option value="BR-900">BR-900 · Toro Apolo</option>
            </select>
            <div className={styles.fieldHint}>Solo se muestran animales machos activos.</div>
          </div>

          <div className="col-12 col-md-6">
            <label className={styles.formLabel}>
              Madre <span className={styles.fieldTag}>(dam_id)</span>
            </label>
            <select
              className={styles.formControl}
              value={formData.damId}
              onChange={(e) => onChange('damId', e.target.value)}
            >
              <option value="">Sin madre registrada</option>
              <option value="BR-100">BR-100 · Vaca Luna</option>
            </select>
            <div className={styles.fieldHint}>Solo se muestran animales hembras activas.</div>
          </div>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className={styles.infoBanner}>
        <Beef size={22} className={styles.infoBannerIcon} />
        <div>
          <h4 className={styles.infoBannerTitle}>
            El árbol genealógico se creará automáticamente
          </h4>
          <p className={styles.infoBannerSub}>
            Podrás consultar ascendencia y descendencia desde la ficha del animal.
          </p>
        </div>
      </div>
    </div>
  );
};