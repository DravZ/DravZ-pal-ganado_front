import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './GestationCalendar.module.css';

interface GestationCalendarProps {
  onOpenModal: () => void;
  events: { expectedDate: string }[];
}

export const GestationCalendar: React.FC<GestationCalendarProps> = ({ onOpenModal, events }) => {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const firstDay = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((firstDay + daysInMonth) / 7) * 7 },
    (_, index) => {
      const day = index - firstDay + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    },
  );
  const birthsByDay = new Map<number, number>();
  for (const event of events) {
    const date = new Date(`${event.expectedDate}T00:00:00`);
    if (date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()) {
      birthsByDay.set(date.getDate(), (birthsByDay.get(date.getDate()) ?? 0) + 1);
    }
  }

  return (
    <div className={styles.cardCalendar}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className={styles.kicker}>CALENDARIO DE GESTACIONES</div>
          <h2 className={styles.title}>Partos esperados</h2>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className={styles.monthNavBtn}
            aria-label="Mes anterior"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.monthTitle}>
            {month.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            className={styles.monthNavBtn}
            aria-label="Mes siguiente"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
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

        {cells.map((day, index) => (
          <div key={`${month.getFullYear()}-${month.getMonth()}-${index}`} className={styles.dayCell}>
            {day && <span className={styles.dayNumber}>{day}</span>}
            {day && birthsByDay.has(day) && (
              <div className={`${styles.eventBadge} ${styles.badgeDarkGreen}`}>
                {birthsByDay.get(day)} {birthsByDay.get(day) === 1 ? 'parto' : 'partos'}
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