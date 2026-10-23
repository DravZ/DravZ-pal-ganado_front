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

const PREGNANT_FEMALES: FemalePregnant[] = [
  {
    id: 'BR-1042',
    tag: 'BR-1042',
    name: 'Esperanza',
    sire: 'Toro BR-0721',
    daysRemaining: 3,
    expectedDate: '19 jun',
    progressPercent: 98,
  },
  {
    id: 'BR-1170',
    tag: 'BR-1170',
    name: 'Bonita',
    sire: 'Toro BR-0721',
    daysRemaining: 6,
    expectedDate: '22 jun',
    progressPercent: 95,
  },
  {
    id: 'BR-0982',
    tag: 'BR-0982',
    name: 'Princesa',
    sire: 'Toro BR-0721',
    daysRemaining: 12,
    expectedDate: '28 jun',
    progressPercent: 88,
  },
  {
    id: 'BR-1124',
    tag: 'BR-1124',
    name: 'Canela',
    sire: 'Toro BR-0721',
    daysRemaining: 18,
    expectedDate: '04 jul',
    progressPercent: 80,
  },
];

export const UpcomingBirths: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateDetail = (animalId: string) => {
    console.log(`[Router Log]: Navegando al detalle del animal gestante ${animalId}`);
    navigate(`/hato/animales/${animalId}`);
  };

  const handleViewAll = () => {
    console.log('[Router Log]: Redirigiendo a lista completa de gestantes...');
    navigate('/reproduccion/gestantes');
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
        {PREGNANT_FEMALES.map((animal) => (
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
              <div className={styles.dateSub}>{animal.expectedDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};