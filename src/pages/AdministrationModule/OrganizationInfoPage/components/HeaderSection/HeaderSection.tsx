import React from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import styles from './HeaderSection.module.css';

interface HeaderSectionProps {
  onBack: () => void;
  onEdit: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ onBack, onEdit }) => (
  <div className={styles.headerWrapper}>
    <button type="button" className={styles.backBtn} onClick={onBack}>
      <ArrowLeft size={18} />
      <span>Volver a configuración</span>
    </button>

    <div className={styles.headerFlex}>
      <div>
        <span className={styles.sectionSubtitle}>CONFIGURACIÓN · ORGANIZACIÓN</span>
        <h1 className={styles.sectionTitle}>Información general</h1>
        <p className={styles.sectionDescription}>
          Datos registrados para la organización actual.
        </p>
      </div>

      <button type="button" className={styles.editBtn} onClick={onEdit}>
        <Pencil size={16} className="d-none d-sm-inline" />
        <span>Editar información</span>
      </button>
    </div>
  </div>
);

export default HeaderSection;