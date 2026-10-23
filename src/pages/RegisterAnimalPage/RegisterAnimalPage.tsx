import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { StepBar } from './components/StepBar/StepBar';
import { Step1BasicData } from './components/Step1BasicData/Step1BasicData';
import { Step2Identifiers } from './components/Step2Identifiers/Step2Identifiers';
import { Step3LocationGenealogy } from './components/Step3LocationGenealogy/Step3LocationGenealogy';
import { Step4InitialWeight } from './components/Step4InitialWeight/Step4InitialWeight';
import styles from './RegisterAnimalPage.module.css';

export const RegisterAnimalPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Estado unificado del formulario
  const [formData, setFormData] = useState({
    name: 'Esperanza',
    sex: 'Hembra',
    species: 'Bovino',
    breed: 'Nelore',
    birthDate: '',
    birthWeight: '',
    acquisitionDate: '',
    acquisitionCost: '',
    identifierType: 'Siniga',
    identifierCode: 'BR-',
    isOfficial: true,
    isCurrent: true,
    loteId: 'Vacas de cría',
    potreroId: 'Potrero Norte',
    sireId: '',
    damId: '',
    currentWeight: '0',
    currentWeightDate: '2025-06-16',
    measurementMethod: 'Báscula digital',
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log('[Action Log]: Formulario enviado ->', formData);
      navigate('/hato/animales');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate('/hato/animales');
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Datos básicos';
      case 2:
        return 'Identificadores';
      case 3:
        return 'Ubicación y genealogía';
      case 4:
        return 'Peso inicial';
      default:
        return '';
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Encabezado Principal */}
      <div>
        <div className={styles.topBreadcrumbKicker}>NUEVO REGISTRO · ANIMALS</div>
        <h1 className={styles.pageMainTitle}>Registrar animal</h1>
        <p className={styles.pageSubText}>
          Completa la ficha individual y sus identificadores.
        </p>
      </div>

      {/* Tarjeta Principal de la Página */}
      <div className={styles.mainCardContainer}>
        {/* Barra del Stepper Wizard */}
        <StepBar currentStep={currentStep} />

        {/* Contenido Dinámico según el paso */}
        <div className={styles.formContentArea}>
          {currentStep === 1 && (
            <Step1BasicData formData={formData} onChange={handleFieldChange} />
          )}
          {currentStep === 2 && (
            <Step2Identifiers formData={formData} onChange={handleFieldChange} />
          )}
          {currentStep === 3 && (
            <Step3LocationGenealogy formData={formData} onChange={handleFieldChange} />
          )}
          {currentStep === 4 && (
            <Step4InitialWeight formData={formData} onChange={handleFieldChange} />
          )}
        </div>

        {/* Pie de Navegación de la Página */}
        <div className={styles.bottomBarFooter}>
          <div className={styles.stepCounterText}>
            PASO {currentStep} DE 4
            <div className={styles.stepNameBold}>{getStepTitle()}</div>
          </div>

          <div className={styles.actionNavButtons}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleBack}
            >
              {currentStep === 1 ? 'Cancelar' : 'Anterior'}
            </button>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleNext}
            >
              <span>{currentStep === 4 ? 'Guardar animal' : 'Continuar'}</span>
              {currentStep === 4 ? (
                <Check size={18} strokeWidth={2.5} />
              ) : (
                <ChevronRight size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAnimalPage;