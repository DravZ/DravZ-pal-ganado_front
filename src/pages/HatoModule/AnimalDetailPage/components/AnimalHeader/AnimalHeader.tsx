import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Beef, Scale, ArrowRightLeft, Syringe } from 'lucide-react';
import styles from './AnimalHeader.module.css';

interface AnimalHeaderProps {
  animalId: string;
}

export const AnimalHeader: React.FC<AnimalHeaderProps> = ({ animalId }) => {
  const navigate = useNavigate();

  // Redirecciones hacia los flujos de acción
  const handleRegisterWeight = () => {
    console.log(`[Router Log]: Redirigiendo a registro de peso para animal ${animalId}`);
    navigate(`/hato/pesajes/nuevo?animalId=${animalId}`);
  };

  const handleMoveLot = () => {
    console.log(`[Router Log]: Redirigiendo a mover lote para animal ${animalId}`);
    navigate(`/hato/traslados/nuevo?animalId=${animalId}`);
  };

  const handleApplyTreatment = () => {
    console.log(`[Router Log]: Redirigiendo a tratamiento para animal ${animalId}`);
    navigate(`/salud/tratamientos/nuevo?animalId=${animalId}`);
  };

  return (
    <div className={styles.headerWrapper}>
      {/* Redirección al directorio principal usando <Link> */}
      <Link to="/hato/animales" className={styles.backLink}>
        <ArrowLeft size={18} />
        <span>Volver al directorio</span>
      </Link>

      <div className={styles.headerCard}>
        <div className={`d-flex align-items-center justify-content-between ${styles.headerCardFlex}`}>
          <div className="d-flex align-items-center">
            <div className={styles.leftInfoGroup}>
              <div className={styles.avatarBadge}>
                <Beef size={26} strokeWidth={2.2} />
              </div>
              <div>
                <div className={styles.kickerTag}>ARETE OFICIAL · SINIGA</div>
                <div className={styles.tagTitleGroup}>
                  <h1 className={styles.tagTitle}>BR-1042</h1>
                  <span className={styles.statusPill}>Activo</span>
                </div>
                <div className={styles.subDetailsText}>Esperanza · Nelore · Hembra</div>
              </div>
            </div>

            <div className={`d-none d-md-block ${styles.divider}`} />

            <div className="d-none d-md-block">
              <div className={styles.kickerTag}>PESO ACTUAL</div>
              <div className={styles.metricValue}>
                482 <span className={styles.metricUnit}>kg</span>
              </div>
              <div className={styles.subDetailsText}>Medido el 12 jun 2025</div>
            </div>
          </div>

          {/* Botones de acción rápida con navegación */}
          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.btnActionPrimary}
              onClick={handleRegisterWeight}
            >
              <Scale size={18} strokeWidth={2.2} />
              <span>Registrar peso</span>
            </button>

            <button
              type="button"
              className={styles.btnActionSecondary}
              onClick={handleMoveLot}
            >
              <ArrowRightLeft size={18} strokeWidth={2.2} />
              <span>Mover lote</span>
            </button>

            <button
              type="button"
              className={styles.btnActionSecondary}
              onClick={handleApplyTreatment}
            >
              <Syringe size={18} strokeWidth={2.2} />
              <span>Aplicar tratamiento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};