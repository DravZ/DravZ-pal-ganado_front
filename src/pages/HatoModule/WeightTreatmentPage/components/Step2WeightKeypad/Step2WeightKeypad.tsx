import React from 'react';
import styles from './Step2WeightKeypad.module.css';

interface Step2Props {
  animalTag: string;
  animalName: string;
  animalBreed: string;
  weightValue: string;
  onWeightChange: (val: string) => void;
  weightDate: string;
  onWeightDateChange: (val: string) => void;
  measurementMethod: string;
  onMethodChange: (val: string) => void;
  onChangeAnimal: () => void;
  error?: string;
}

export const Step2WeightKeypad: React.FC<Step2Props> = ({
  animalTag,
  animalName,
  animalBreed,
  weightValue,
  onWeightChange,
  weightDate,
  onWeightDateChange,
  measurementMethod,
  onMethodChange,
  onChangeAnimal,
  error,
}) => {
  const handleKeyPress = (digit: string) => {
    if (digit === '.') {
      if (!weightValue.includes('.')) {
        onWeightChange(weightValue === '' ? '0.' : weightValue + '.');
      }
      return;
    }

    if (weightValue === '0') {
      onWeightChange(digit);
    } else {
      onWeightChange(weightValue + digit);
    }
  };

  const handleBackspace = () => {
    onWeightChange(weightValue.slice(0, -1));
  };

  const handleClearAll = () => {
    onWeightChange('');
  };

  return (
    <div className={styles.stepContainer}>
      {/* Barra de Animal Seleccionado adaptada para evitar solapamiento */}
      <div className={styles.animalBarCard}>
        <div className={styles.checkBadge}>✓</div>
        
        <div className={styles.animalContentWrapper}>
          <div className={styles.animalHeaderRow}>
            <span className={styles.animalBarKicker}>ANIMAL SELECCIONADO</span>
            <button type="button" className={styles.changeBtn} onClick={onChangeAnimal}>
              Cambiar
            </button>
          </div>
          <div className={styles.animalBarTitle}>
            {animalTag} · {animalName} · {animalBreed}
          </div>
        </div>
      </div>

      {/* Visualizador de Peso y Teclado Táctil */}
      <div className={styles.weightKeypadWrapper}>
        <div className={styles.weightHeaderDisplay}>
          <div>
            <span className={styles.weightDisplayKicker}>PESO DEL ANIMAL</span>
            <div className={styles.weightValueText}>{weightValue || '0'}</div>
          </div>
          <span className={styles.unitText}>kg</span>
        </div>

        <div className={styles.keypadGrid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              className={styles.keyBtn}
              onClick={() => handleKeyPress(num)}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            className={styles.keyBtn}
            onClick={() => handleKeyPress('.')}
          >
            .
          </button>

          <button
            type="button"
            className={styles.keyBtn}
            onClick={() => handleKeyPress('0')}
          >
            0
          </button>

          <button
            type="button"
            className={`${styles.keyBtn} ${styles.keyBtnRed}`}
            onClick={handleBackspace}
          >
            Borrar
          </button>

          <button
            type="button"
            className={styles.clearRowBtn}
            onClick={handleClearAll}
          >
            LIMPIAR
          </button>
        </div>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Fecha y Método */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>Fecha y hora</label>
          <input
            type="datetime-local"
            className={styles.controlInput}
            value={weightDate}
            onChange={(e) => onWeightDateChange(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className={styles.formLabel}>Método</label>
          <select
            className={styles.controlInput}
            value={measurementMethod}
            onChange={(e) => onMethodChange(e.target.value)}
          >
            <option value="Báscula digital">Báscula digital</option>
            <option value="Cinta métrica">Cinta métrica</option>
            <option value="Estimación visual">Estimación visual</option>
          </select>
        </div>
      </div>

      {/* Tarjeta de Último Registro */}
      <div className={styles.lastRecordCard}>
        <div className={styles.lastRecordMain}>
          <span className={styles.lastRecordKicker}>ÚLTIMO REGISTRO</span>
          <span className={styles.lastRecordValue}>468 kg</span>
        </div>
        <div className={styles.lastRecordSub}>
          14 mar 2025 · Ganancia estimada: +14 kg
        </div>
      </div>
    </div>
  );
};