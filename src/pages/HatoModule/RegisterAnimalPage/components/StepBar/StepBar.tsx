import React from 'react';
import { Check } from 'lucide-react';
import styles from './StepBar.module.css';

interface StepBarProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, label: 'PASO 1', title: 'Datos básicos' },
  { number: 2, label: 'PASO 2', title: 'Identificadores' },
  { number: 3, label: 'PASO 3', title: 'Ubicación y genealogía' },
  { number: 4, label: 'PASO 4', title: 'Peso inicial' },
];

export const StepBar: React.FC<StepBarProps> = ({ currentStep }) => {
  // Porcentaje de progreso de la línea
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
              <div className={styles.stepTextWrapper}>
                <span className={styles.stepLabel}>{step.label}</span>
                <span
                  className={`${styles.stepTitle} ${
                    !isActive && !isCompleted ? styles.stepTitleInactive : ''
                  }`}
                >
                  {step.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};