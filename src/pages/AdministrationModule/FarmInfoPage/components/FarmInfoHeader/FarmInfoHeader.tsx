import React from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import styles from '../../../shared/InfoHeader.module.css';

interface FarmInfoHeaderProps {
  farmName: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
  isDeleting: boolean;
}

export const FarmInfoHeader: React.FC<FarmInfoHeaderProps> = ({
  farmName,
  onBack,
  onEdit,
  onDelete,
  canDelete,
  isDeleting,
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

      <div className={styles.headerActions}>
        {canDelete && (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 size={16} className="d-none d-sm-inline" />
            <span>{isDeleting ? 'Eliminando…' : 'Eliminar finca'}</span>
          </button>
        )}
        <button type="button" className={styles.editBtn} onClick={onEdit}>
          <Pencil size={16} className="d-none d-sm-inline" />
          <span>Editar finca</span>
        </button>
      </div>
    </div>
  </div>
);

export default FarmInfoHeader;
