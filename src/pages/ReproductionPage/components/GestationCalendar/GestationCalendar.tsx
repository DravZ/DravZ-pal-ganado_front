import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './GestationCalendar.module.css';

interface GestationCalendarProps {
  onOpenModal: () => void;
}

export const GestationCalendar: React.FC<GestationCalendarProps> = ({ onOpenModal }) => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className={styles.cardCalendar}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className={styles.kicker}>CALENDARIO DE GESTACIONES</div>
          <h2 className={styles.title}>Partos esperados</h2>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button type="button" className={styles.monthNavBtn} aria-label="Mes anterior">
            <ChevronLeft size={18} />
          </button>
          <span className={styles.monthTitle}>Junio 2025</span>
          <button type="button" className={styles.monthNavBtn} aria-label="Mes siguiente">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className={styles.calendarGrid}>
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((d) => (
          <div key={d} className={styles.dayHeader}>
            {d}
          </div>
        ))}

        {[27, 28, 29, 30, 31].map((d) => (
          <div key={`prev-${d}`} className={styles.dayCell} style={{ opacity: 0.4 }}>
            <span className={styles.dayNumber}>{d}</span>
          </div>
        ))}

        {days.map((day) => (
          <div key={day} className={styles.dayCell}>
            <span className={styles.dayNumber}>{day}</span>

            {day === 4 && (
              <div className={`${styles.eventBadge} ${styles.badgeOrange}`}>
                2 partos
              </div>
            )}
            {day === 11 && (
              <div
                className={styles.eventBadge}
                style={{ backgroundColor: '#1e4b27', height: '100%', minHeight: '22px' }}
              />
            )}
            {day === 14 && (
              <div className={`${styles.eventBadge} ${styles.badgeDarkGreen}`}>
                1 parto
              </div>
            )}
            {day === 21 && (
              <div className={`${styles.eventBadge} ${styles.badgeBlue}`}>
                3 partos
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mt-auto pt-3 gap-3">
        <div className={styles.legendRow}>
          <div className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotOrange}`} />
            <span>En 7 días</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotGreen}`} />
            <span>Confirmado</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotBlue}`} />
            <span>Proyectado</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.btnSecondaryOutline}
          onClick={onOpenModal}
        >
          Agregar evento
        </button>
      </div>
    </div>
  );
};