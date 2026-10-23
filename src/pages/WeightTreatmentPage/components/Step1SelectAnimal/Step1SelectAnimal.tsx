import React from 'react';
import { Scan, Beef } from 'lucide-react';
import styles from './Step1SelectAnimal.module.css';

interface AnimalOption {
  id: string;
  tag: string;
  name: string;
  breed: string;
  sex: string;
  lote: string;
  status: string;
}

const MOCK_ANIMALS: AnimalOption[] = [
  {
    id: 'BR-1042',
    tag: 'BR-1042',
    name: 'Esperanza',
    breed: 'Nelore',
    sex: 'Hembra',
    lote: 'Vacas de cría',
    status: 'Activo',
  },
  {
    id: 'BR-1088',
    tag: 'BR-1088',
    name: 'Magnate',
    breed: 'Angus',
    sex: 'Macho',
    lote: 'Ceba final',
    status: 'Activo',
  },
  {
    id: 'BR-1124',
    tag: 'BR-1124',
    name: 'Canela',
    breed: 'Braford',
    sex: 'Hembra',
    lote: 'Hembras reemplazo',
    status: 'Activo',
  },
];

interface Step1Props {
  selectedAnimalId: string;
  onSelectAnimal: (animal: AnimalOption) => void;
  error?: string;
}

export const Step1SelectAnimal: React.FC<Step1Props> = ({
  selectedAnimalId,
  onSelectAnimal,
  error,
}) => {
  const currentAnimal = MOCK_ANIMALS.find((a) => a.id === selectedAnimalId) || MOCK_ANIMALS[0];

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
            const found = MOCK_ANIMALS.find((a) => a.id === e.target.value);
            if (found) onSelectAnimal(found);
          }}
        >
          {MOCK_ANIMALS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.tag} · {a.breed} · {a.sex}
            </option>
          ))}
        </select>
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

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