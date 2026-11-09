import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './VaccinationTab.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

const DAY_MS = 86_400_000;

export const VaccinationTab: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const { records: vaccinations, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'vaccinations',
    '/vaccinations',
    scope,
  );
  const { records: animals } = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);
  const { records: lots } = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const [now] = useState(() => new Date());
  const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
  const monthLabel = selectedMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const today = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    [now],
  );

  const upcoming = useMemo(() => vaccinations.flatMap((vaccination) => {
    const dueDate = String(vaccination.next_due_date ?? '');
    const time = Date.parse(dueDate);
    if (!dueDate || !Number.isFinite(time) || time < today.getTime()) return [];
    const animalId = String(vaccination.animal_id ?? '');
    const animal = animals.find((entry) => entry.id === animalId);
    const lot = lots.find((entry) => entry.id === animal?.lot_id);
    return [{
      id: String(vaccination.id),
      animalId,
      name: String(vaccination.vaccine_name ?? 'Vacuna'),
      date: new Date(`${dueDate.slice(0, 10)}T00:00:00`),
      animalTag: String(animal?.tag_number ?? animal?.identifier_tag ?? animalId),
      animalName: String(animal?.name ?? 'Sin nombre'),
      lotName: String(lot?.name ?? 'Sin lote'),
    }];
  }).sort((left, right) => left.date.getTime() - right.date.getTime()), [animals, lots, today, vaccinations]);

  const calendarDays = useMemo(() => {
    const offset = (monthStart.getDay() + 6) % 7;
    const daysInMonth = monthEnd.getDate();
    const total = Math.ceil((offset + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, index) => {
      const day = index - offset + 1;
      if (day < 1 || day > daysInMonth) return null;
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      const hasDueVaccination = upcoming.some((item) =>
        item.date.getFullYear() === date.getFullYear()
        && item.date.getMonth() === date.getMonth()
        && item.date.getDate() === date.getDate(),
      );
      return { day, hasDueVaccination };
    });
  }, [monthEnd, monthStart, selectedMonth, upcoming]);
  const monthOptions = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`,
      label: date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
    };
  });
  const selectedMonthValue = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth()).padStart(2, '0')}`;
  const nextThirtyDays = upcoming.filter((item) =>
    item.date.getTime() < today.getTime() + 30 * DAY_MS,
  );

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-7">
        <div className={styles.cardBox}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className={styles.dbLabel}>CALENDARIO SANITARIO</span>
              <h2 className={styles.cardTitle}>Próximas vacunas</h2>
            </div>
            <select
              className={styles.monthSelect}
              value={selectedMonthValue}
              onChange={(event) => {
                const [year, month] = event.target.value.split('-').map(Number);
                setSelectedMonth(new Date(year, month, 1));
              }}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <p className="text-secondary text-capitalize">{monthLabel}</p>
          <div className={styles.calendarGrid}>
            {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((day) => (
              <div key={day} className={styles.dayHeader}>{day}</div>
            ))}
            {calendarDays.map((date, index) => (
              <div
                key={`${selectedMonthValue}-${index}`}
                className={`${styles.calendarCell} ${date?.hasDueVaccination ? styles.cellHasDot : ''}`}
              >
                {date?.day}
                {date?.hasDueVaccination && <span className={styles.dot} />}
              </div>
            ))}
          </div>
          {error && <p role="alert" className="text-danger mt-3">{error}</p>}
        </div>
      </div>

      <div className="col-12 col-lg-5">
        <div className={styles.cardBox}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className={styles.dbLabel}>PRÓXIMOS 30 DÍAS</span>
              <h2 className={styles.cardTitle}>Vacunaciones programadas</h2>
            </div>
            <span className={styles.animalPill}>{nextThirtyDays.length} dosis</span>
          </div>

          <div className="d-flex flex-column gap-3">
            {nextThirtyDays.map((item) => (
              <div key={item.id} className={styles.scheduledCard}>
                <div className={styles.dateBlock}>
                  <span className={styles.dateDay}>{item.date.getDate()}</span>
                  <span className={styles.dateMonth}>
                    {item.date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()}
                  </span>
                </div>
                <div className={styles.vaccineInfo}>
                  <div className={styles.vaccineTitle}>{item.name}</div>
                  <div className={styles.vaccineSubtitle}>
                    {item.animalTag} · {item.animalName} · {item.lotName}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.registerBtn}
                  onClick={() => navigate(`/salud/vacunacion?animalId=${encodeURIComponent(item.animalId)}&vaccineName=${encodeURIComponent(item.name)}`)}
                >
                  Registrar
                </button>
              </div>
            ))}
            {!isLoading && nextThirtyDays.length === 0 && (
              <p className="text-secondary mb-0">
                {error ?? 'No hay dosis programadas en los próximos 30 días.'}
              </p>
            )}
            {isLoading && <p role="status" className="text-secondary mb-0">Cargando vacunaciones…</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationTab;
