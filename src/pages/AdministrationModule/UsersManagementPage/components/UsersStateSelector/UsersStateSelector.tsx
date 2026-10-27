import React from 'react';
import styles from './UsersStateSelector.module.css';
import type { UserPageState } from '../../UsersManagementPage';

interface UsersStateSelectorProps {
  currentState: UserPageState;
  onChangeState: (state: UserPageState) => void;
}

export const UsersStateSelector: React.FC<UsersStateSelectorProps> = ({
  currentState,
  onChangeState
}) => (
  <div className={styles.selectorCard}>
    <span className={styles.label}>Estados:</span>
    <div className={styles.btnGroup}>
      {(['LIST', 'LOADING', 'EMPTY', 'ERROR'] as UserPageState[]).map((state) => (
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

export default UsersStateSelector;