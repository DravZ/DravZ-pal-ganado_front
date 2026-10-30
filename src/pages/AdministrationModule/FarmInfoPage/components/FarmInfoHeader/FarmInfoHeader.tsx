import React from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import styles from './FarmInfoHeader.module.css';

interface FarmInfoHeaderProps {
  farmName: string;
  onBack: () => void;
  onEdit: () => void;
}

export const FarmInfoHeader: React.FC<FarmInfoHeaderProps> = ({
  farmName,
  onBack,
  onEdit
}) => (
  <div className={styles.headerWrapper}>
    <button type="button" className={styles.backBtn} onClick={onBack}>
      <ArrowLeft size={18} />
      <span>Volver a fincas</span>
    </button>

    <div className={styles.headerFlex}>
      <div>
        <span className={styles.sectionSubtitle}>ADMINISTRACIÓN · FARMS</span>
        <h1 className={styles.sectionTitle}>{farmName}</h1>
        <p className={styles.sectionDescription}>
          Información registrada para esta finca.
        </p>
      </div>

      <button type="button" className={styles.editBtn} onClick={onEdit}>
        <Pencil size={16} className="d-none d-sm-inline" />
        <span>Editar finca</span>
      </button>
    </div>
  </div>
);

export default FarmInfoHeader;