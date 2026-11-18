import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Beef, Scale, ArrowRightLeft, Syringe } from 'lucide-react';
import { animalPhotoSource } from '../../../RegisterAnimalPage/components/AnimalPhotoField/animalPhotoUtils';
import styles from './AnimalHeader.module.css';

interface AnimalHeaderProps {
  animalId: string;
  animal: Record<string, unknown>;
}

export const AnimalHeader: React.FC<AnimalHeaderProps> = ({ animalId, animal }) => {
  const navigate = useNavigate();
  const tag = String(animal.identifier_tag ?? animal.tag_number ?? animalId);
  const name = String(animal.name ?? 'Sin nombre');
  const breed = String(animal.breed ?? 'Sin raza');
  const sex = String(animal.gender ?? animal.sex ?? 'Sin sexo');
  const status = String(animal.status ?? 'Sin estado');
  const photoBase64 = String(animal.photo_base64 ?? animal.photoBase64 ?? '');
  const weight = Number(animal.current_weight ?? 0);
  const weightDate = String(animal.current_weight_date ?? '');

  // Redirecciones hacia los flujos de acción
  const handleRegisterWeight = () => {
    navigate(`/hato/pesajes?animalId=${encodeURIComponent(animalId)}`);
  };

  const handleMoveLot = () => {
    navigate(`/hato/traslados?animalId=${encodeURIComponent(animalId)}`);
  };

  const handleApplyTreatment = () => {
    navigate(`/salud/tratamientos?animalId=${encodeURIComponent(animalId)}`);
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
                {photoBase64
                  ? <img className={styles.avatarPhoto} src={animalPhotoSource(photoBase64)} alt={`Foto de ${name}`} />
                  : <Beef size={26} strokeWidth={2.2} />}
              </div>
              <div>
                <div className={styles.kickerTag}>IDENTIFICACIÓN</div>
                <div className={styles.tagTitleGroup}>
                  <h1 className={styles.tagTitle}>{tag}</h1>
                  <span className={styles.statusPill}>{status}</span>
                </div>
                <div className={styles.subDetailsText}>{name} · {breed} · {sex}</div>
              </div>
            </div>

            <div className={`d-none d-md-block ${styles.divider}`} />

            <div className="d-none d-md-block">
              <div className={styles.kickerTag}>PESO ACTUAL</div>
              <div className={styles.metricValue}>
                {weight.toLocaleString('es-CO')} <span className={styles.metricUnit}>kg</span>
              </div>
              <div className={styles.subDetailsText}>{weightDate || 'Sin fecha de medición'}</div>
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