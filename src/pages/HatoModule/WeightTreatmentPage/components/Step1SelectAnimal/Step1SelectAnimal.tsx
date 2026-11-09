import React from 'react';
import { Scan, Beef } from 'lucide-react';
import styles from './Step1SelectAnimal.module.css';

export interface AnimalOption {
  id: string;
  tag: string;
  name: string;
  breed: string;
  sex: string;
  lote: string;
  status: string;
}

interface Step1Props {
  selectedAnimalId: string;
  onSelectAnimal: (animal: AnimalOption) => void;
  animals: AnimalOption[];
  error?: string;
}

export const Step1SelectAnimal: React.FC<Step1Props> = ({
  selectedAnimalId,
  onSelectAnimal,
  animals,
  error,
}) => {
  const currentAnimal = animals.find((animal) => animal.id === selectedAnimalId);

  const handleOpenScanner = () => {
    console.log('[Action Log]: Abriendo cámara para escaneo de arete...');
  };

  return (
    <div className={styles.stepContainer}>
      {/* Bloque Escanear Arete */}
      <div className={styles.scannerCard}>
        <div className={styles.scannerInfoGroup}>
          <div className={styles.scanIconBox}>
            <Scan size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className={styles.scanTitle}>Escanear arete</h3>
            <p className={styles.scanSub}>Usa la cámara para identificar al animal.</p>
          </div>
        </div>
        <button type="button" className={styles.btnScan} onClick={handleOpenScanner}>
          Abrir escáner
        </button>
      </div>

      {/* Separador Horizontal */}
      <div className={styles.dividerWrapper}>
        <span className={styles.dividerText}>O SELECCIONA MANUALMENTE</span>
      </div>

      {/* Select Manual */}
      <div>
        <label className={styles.formLabel}>Animal o número de arete</label>
        <select
          className={styles.selectControl}
          value={selectedAnimalId}
          onChange={(e) => {
            const found = animals.find((animal) => animal.id === e.target.value);
            if (found) onSelectAnimal(found);
          }}
        >
          <option value="">Selecciona un animal</option>
          {animals.map((a) => (
            <option key={a.id} value={a.id}>
              {a.tag} · {a.breed} · {a.sex}
            </option>
          ))}
        </select>
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
      {animals.length === 0 && <p role="status">No hay animales disponibles en esta finca.</p>}

      {/* Tarjeta del Animal Seleccionado */}
      {currentAnimal && (
        <div className={styles.selectedAnimalCard}>
          <div className="d-flex align-items-center gap-3 min-w-0">
            <div className={styles.animalIconBadge}>
              <Beef size={22} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h4 className={styles.animalTagTitle}>{currentAnimal.tag}</h4>
              <p className={styles.animalDetailsSub}>
                {currentAnimal.breed} · {currentAnimal.sex} · {currentAnimal.lote}
              </p>
            </div>
          </div>
          <span className={styles.statusPill}>{currentAnimal.status}</span>
        </div>
      )}
    </div>
  );
};