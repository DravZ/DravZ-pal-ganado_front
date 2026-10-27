import React from 'react';
import styles from './FarmsStateSelector.module.css';
import type { FarmPageState } from '../../FarmsManagementPage';

interface FarmsStateSelectorProps {
  currentState: FarmPageState;
  onChangeState: (state: FarmPageState) => void;
}

export const FarmsStateSelector: React.FC<FarmsStateSelectorProps> = ({
  currentState,
  onChangeState
}) => (
  <div className={styles.selectorCard}>
    <span className={styles.label}>Estados:</span>
    <div className={styles.btnGroup}>
      {(['LIST', 'LOADING', 'EMPTY', 'ERROR'] as FarmPageState[]).map((state) => (
        <button
          key={state}
          type="button"
          className={`${styles.stateBtn} ${currentState === state ? styles.activeBtn : ''}`}
          onClick={() => onChangeState(state)}
        >
          {state === 'LIST' ? 'Lista' : state === 'LOADING' ? 'Carga' : state === 'EMPTY' ? 'Vacío' : 'Error'}
        </button>
      ))}
    </div>
  </div>
);

export default FarmsStateSelector;