import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { StepBar } from './components/StepBar/StepBar';
import { Step1SelectAnimal } from './components/Step1SelectAnimal/Step1SelectAnimal';
import { Step2WeightKeypad } from './components/Step2WeightKeypad/Step2WeightKeypad';
import { Step3TreatmentDetails } from './components/Step3TreatmentDetails/Step3TreatmentDetails';
import styles from './WeightTreatmentPage.module.css';

export const WeightTreatmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Permite iniciar directo en el animal indicado por URL si proviene del detalle
  const initialAnimalId = searchParams.get('animalId') || 'BR-1042';

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Estados del Formulario
  const [selectedAnimal, setSelectedAnimal] = useState({
    id: initialAnimalId,
    tag: initialAnimalId,
    name: 'Esperanza',
    breed: 'Nelore',
    sex: 'Hembra',
    lote: 'Vacas de cría',
    status: 'Activo',
  });

  const [weightValue, setWeightValue] = useState<string>('482');
  const [weightDate, setWeightDate] = useState<string>('2025-06-16T10:42');
  const [measurementMethod, setMeasurementMethod] = useState<string>('Báscula digital');

  const [medication, setMedication] = useState<string>('Ivermectina 1%');
  const [dose, setDose] = useState<string>('10');
  const [doseUnit, setDoseUnit] = useState<string>('mL');
  const [treatmentRoute, setTreatmentRoute] = useState<string>('Subcutánea');

  // Estado de Errores de Validación
  const [errors, setErrors] = useState<{ animal?: string; weight?: string }>({});

  const validateStep = () => {
    const newErrors: { animal?: string; weight?: string } = {};

    if (currentStep === 1 && !selectedAnimal.id) {
      newErrors.animal = 'Debes seleccionar un animal para continuar.';
    }

    if (currentStep === 2) {
      const numWeight = parseFloat(weightValue);
      if (!weightValue || isNaN(numWeight) || numWeight <= 0) {
        newErrors.weight = 'Ingresa un peso válido mayor a 0 kg.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Envío Final y Simulación para Backend
      const payload = {
        animal_id: selectedAnimal.id,
        weight_record: {
          weight_kg: parseFloat(weightValue),
          date: weightDate,
          method: measurementMethod,
        },
        treatment_record: medication
          ? {
              medication,
              dose: parseFloat(dose) || 0,
              dose_unit: doseUnit,
              route: treatmentRoute,
            }
          : null,
      };

      console.log('[Action Log]: JSON preparado para el backend ->', payload);
      navigate(`/hato/animales/${selectedAnimal.id}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate('/hato/animales');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Encabezado */}
      <div>
        <div className={styles.kickerText}>
          ACCIÓN DE CAMPO · PASO {currentStep} DE 3
        </div>
        <h1 className={styles.pageTitle}>Registrar peso y tratamiento</h1>
      </div>

      {/* Contenedor Principal */}
      <div className={styles.cardContainer}>
        {/* Stepper Bar */}
        <StepBar currentStep={currentStep} />

        {/* Formulario según el paso activo */}
        <div className={styles.formContentArea}>
          {currentStep === 1 && (
            <Step1SelectAnimal
              selectedAnimalId={selectedAnimal.id}
              onSelectAnimal={setSelectedAnimal}
              error={errors.animal}
            />
          )}

          {currentStep === 2 && (
            <Step2WeightKeypad
              animalTag={selectedAnimal.tag}
              animalName={selectedAnimal.name}
              animalBreed={selectedAnimal.breed}
              weightValue={weightValue}
              onWeightChange={setWeightValue}
              weightDate={weightDate}
              onWeightDateChange={setWeightDate}
              measurementMethod={measurementMethod}
              onMethodChange={setMeasurementMethod}
              onChangeAnimal={() => setCurrentStep(1)}
              error={errors.weight}
            />
          )}

          {currentStep === 3 && (
            <Step3TreatmentDetails
              medication={medication}
              onMedicationChange={setMedication}
              dose={dose}
              onDoseChange={setDose}
              doseUnit={doseUnit}
              onDoseUnitChange={setDoseUnit}
              treatmentRoute={treatmentRoute}
              onTreatmentRouteChange={setTreatmentRoute}
            />
          )}
        </div>

        {/* Pie de Página */}
        <div className={styles.bottomBarFooter}>
          <button type="button" className={styles.btnCancel} onClick={handleBack}>
            {currentStep === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          <button type="button" className={styles.btnPrimary} onClick={handleNext}>
            <span>
              {currentStep === 3 ? 'Guardar localmente' : 'Continuar'}
            </span>
            {currentStep === 3 ? (
              <Check size={18} strokeWidth={2.5} />
            ) : (
              <ChevronRight size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeightTreatmentPage;