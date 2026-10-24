import React from 'react';
import { Check } from 'lucide-react';
import styles from './StepBar.module.css';

interface StepBarProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, title: 'Animal' },
  { number: 2, title: 'Peso' },
  { number: 3, title: 'Tratamiento' },
];

export const StepBar: React.FC<StepBarProps> = ({ currentStep }) => {
  // Cálculo del progreso de la barra
  const progressWidth = `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`;

  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepList}>
        <div className={styles.connectorLine}>
          <div className={styles.connectorProgress} style={{ width: progressWidth }} />
        </div>

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className={styles.stepItem}>
              <div
                className={`${styles.circleBadge} ${
                  isCompleted
                    ? styles.completedCircle
                    : isActive
                    ? styles.activeCircle
                    : ''
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
              </div>
              <span
                className={`${styles.stepTitle} ${
                  !isActive && !isCompleted ? styles.stepTitleInactive : ''
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};