import React from 'react';
import { Home, Beef } from 'lucide-react';
import styles from './Step3LocationGenealogy.module.css';
import type { AnimalFormChange, AnimalFormData } from '../../types';
import FarmLocationFields from '../FarmLocationFields/FarmLocationFields';

interface Step3Props {
  formData: AnimalFormData;
  onChange: AnimalFormChange;
  lots: { id: string; name: string }[];
  lotsLoading: boolean;
  lotsError: string | null;
  paddocks: { id: string; name: string }[];
  paddocksLoading: boolean;
  paddocksError: string | null;
  animals: { id: string; tag: string; name: string; sex: string; status: string }[];
}

export const Step3LocationGenealogy: React.FC<Step3Props> = ({
  formData,
  onChange,
  lots,
  lotsLoading,
  lotsError,
  paddocks,
  paddocksLoading,
  paddocksError,
  animals,
}) => {
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
          <span className={styles.badgeOptional}>Opcional</span>
        </div>

        <div className="row g-3">
          <FarmLocationFields
            lotId={formData.loteId}
            paddockId={formData.potreroId}
            onLotChange={(id) => onChange('loteId', id)}
            onPaddockChange={(id) => onChange('potreroId', id)}
            lots={lots}
            lotsLoading={lotsLoading}
            lotsError={lotsError}
            paddocks={paddocks}
            paddocksLoading={paddocksLoading}
            paddocksError={paddocksError}
          />
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
              {animals.filter((animal) =>
                animal.status.toLowerCase() === 'active'
                && ['macho', 'male'].includes(animal.sex.trim().toLowerCase()),
              ).map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag} · {animal.name}
                </option>
              ))}
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
              {animals.filter((animal) =>
                animal.status.toLowerCase() === 'active'
                && ['hembra', 'female'].includes(animal.sex.trim().toLowerCase()),
              ).map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag} · {animal.name}
                </option>
              ))}
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