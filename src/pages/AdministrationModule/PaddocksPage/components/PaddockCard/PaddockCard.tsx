import React from 'react';
import styles from './PaddockCard.module.css';
import { ChevronRight } from 'lucide-react';
import type { PaddockUI } from '../../PaddocksPage';

interface PaddockCardProps {
  paddock: PaddockUI;
}

export const PaddockCard: React.FC<PaddockCardProps> = ({ paddock }) => {
  const isResting = paddock.badge_status === 'Descanso';

  return (
    <div className={styles.card}>
      {/* BLOQUE IZQUIERDO / SUPERIOR VERDE */}
      <div className={`${styles.badgeBlock} ${isResting ? styles.bgResting : styles.bgInUse}`}>
        <span className={`${styles.badgePill} ${isResting ? styles.badgeResting : styles.badgeInUse}`}>
          {paddock.badge_status}
        </span>
        <div className="text-center">
          <div className={styles.hectaresValue}>{paddock.hectares}</div>
          <div className={styles.hectaresUnit}>ha</div>
        </div>
      </div>

      {/* BLOQUE DERECHO DETALLES */}
      <div className={styles.rightContentBlock}>
        <div>
          <span className={styles.codeText}>{paddock.code}</span>
          <h3 className={styles.paddockName}>{paddock.name}</h3>
          <span className={styles.forageText}>{paddock.forage_type}</span>
        </div>

        <div className={styles.capacitySection}>
          <div className={styles.capacityHeader}>
            <span className={styles.capacityLabel}>Capacidad utilizada</span>
            <span className={styles.capacityValue}>
              {paddock.current_animals} / {paddock.capacity} animales
            </span>
          </div>

          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${paddock.occupancy_percentage}%` }}
            ></div>
          </div>
        </div>

        <div className={styles.footerFlex}>
          <span className={styles.occupancySubtext}>
            {paddock.occupancy_percentage}% ocupado
          </span>
          <button type="button" className={styles.detailBtn}>
            <span>Ver detalle</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaddockCard;