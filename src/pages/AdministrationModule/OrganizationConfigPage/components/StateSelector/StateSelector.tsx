import React from 'react';
import styles from './StateSelector.module.css';
import type { ViewState } from '../../hooks/useOrganizationConfig';

interface StateSelectorProps {
  currentState: ViewState;
  onChangeState: (state: ViewState) => void;
}

export const StateSelector: React.FC<StateSelectorProps> = ({ currentState, onChangeState }) => {
  return (
    <div className={styles.stateSelectorCard}>
      <span className={styles.stateLabel}>Estados:</span>
      <div className={styles.stateButtonsGroup}>
        {(['OVERVIEW', 'LOADING', 'ERROR'] as ViewState[]).map((state) => (
          <button
            key={state}
            type="button"
            className={`${styles.stateBtn} ${currentState === state ? styles.activeStateBtn : ''}`}
            onClick={() => onChangeState(state)}
          >
            {state === 'OVERVIEW' ? 'Overview' : state === 'LOADING' ? 'Carga' : 'Error'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StateSelector;