import React from 'react';
import styles from './DoseKeypad.module.css';

interface DoseKeypadProps {
  value: string;
  unit: string;
  onChange: (val: string) => void;
}

export const DoseKeypad: React.FC<DoseKeypadProps> = ({ value, unit, onChange }) => {
  const handleDigit = (digit: string) => {
    if (digit === '.' && value.includes('.')) return;
    if (value === '0' && digit !== '.') {
      onChange(digit);
    } else {
      onChange(value + digit);
    }
  };

  const handleDelete = () => {
    if (value.length <= 1) {
      onChange('0');
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('0');
  };

  return (
    <div className={styles.keypadCard}>
      {/* Visualizador de la dosis */}
      <div className={styles.displayHeader}>
        <span className={styles.displayLabel}>DOSIS POR APLICACIÓN</span>
        <div className={styles.valueRow}>
          <span className={styles.displayValue}>{value || '0'}</span>
          <span className={styles.displayUnit}>{unit}</span>
        </div>
      </div>

      {/* Grid Numérico Táctil */}
      <div className={styles.grid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            className={styles.keyBtn}
            onClick={() => handleDigit(num)}
          >
            {num}
          </button>
        ))}

        <button type="button" className={styles.keyBtn} onClick={() => handleDigit('.')}>
          .
        </button>
        <button type="button" className={styles.keyBtn} onClick={() => handleDigit('0')}>
          0
        </button>
        <button type="button" className={`${styles.keyBtn} ${styles.btnDelete}`} onClick={handleDelete}>
          Borrar
        </button>
      </div>

      <button type="button" className={styles.btnClear} onClick={handleClear}>
        LIMPIAR
      </button>
    </div>
  );
};

export default DoseKeypad;