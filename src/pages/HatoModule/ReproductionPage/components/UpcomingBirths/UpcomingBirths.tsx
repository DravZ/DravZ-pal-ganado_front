import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, ChevronRight } from 'lucide-react';
import styles from './UpcomingBirths.module.css';

interface FemalePregnant {
  id: string;
  tag: string;
  name: string;
  sire: string;
  daysRemaining: number;
  expectedDate: string;
  progressPercent: number;
}

export const UpcomingBirths: React.FC<{ births: FemalePregnant[] }> = ({ births }) => {
  const navigate = useNavigate();

  const handleNavigateDetail = (animalId: string) => {
    navigate(`/hato/animales/${animalId}`);
  };

  const handleViewAll = () => {
    navigate('/hato/reproduccion');
  };

  return (
    <div className={styles.cardUpcoming}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className={styles.kicker}>PRÓXIMOS PARTOS</div>
          <h2 className={styles.title}>Hembras gestantes</h2>
        </div>
        <button type="button" className={styles.viewAllBtn} onClick={handleViewAll}>
          Ver todas
        </button>
      </div>

      <div className={styles.birthList}>
        {births.map((animal) => (
          <div
            key={animal.id}
            className={styles.birthCard}
            onClick={() => handleNavigateDetail(animal.id)}
          >
            <div className={styles.iconAvatar}>
              <Beef size={22} strokeWidth={2.2} />
            </div>

            <div className="flex-grow-1 min-w-0">
              <div className={styles.animalNameRow}>
                <span className={styles.animalTag}>
                  {animal.tag} · {animal.name}
                </span>
                <span className={styles.gestaBadge}>Gesta</span>
              </div>

              <div className={styles.subDetailText}>
                Inseminación · {animal.sire}
              </div>

              <div className={styles.pregnancyProgressBar}>
                <div
                  className={styles.pregnancyProgressFill}
                  style={{ width: `${animal.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="text-end flex-shrink-0">
              <div className="d-flex align-items-center gap-1 justify-content-end">
                <span className={styles.daysCount}>{animal.daysRemaining} días</span>
                <ChevronRight size={16} className="text-secondary" />
              </div>
              <div className={styles.dateSub}>
                {new Date(`${animal.expectedDate}T00:00:00`).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                })}
              </div>
            </div>
          </div>
        ))}
        {births.length === 0 && (
          <p className="text-secondary mb-0">No hay partos próximos registrados.</p>
        )}
      </div>
    </div>
  );
};