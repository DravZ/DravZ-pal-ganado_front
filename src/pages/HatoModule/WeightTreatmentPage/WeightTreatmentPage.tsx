import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { StepBar } from './components/StepBar/StepBar';
import { Step1SelectAnimal } from './components/Step1SelectAnimal/Step1SelectAnimal';
import { Step2WeightKeypad } from './components/Step2WeightKeypad/Step2WeightKeypad';
import { Step3TreatmentDetails } from './components/Step3TreatmentDetails/Step3TreatmentDetails';
import styles from './WeightTreatmentPage.module.css';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { queueHatoWrite, useHatoCollection } from '../../../services/hatoDataService';
import type { AnimalOption } from './components/Step1SelectAnimal/Step1SelectAnimal';
import useNotification from '../../../hooks/useNotification';

export const WeightTreatmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const initialAnimalId = searchParams.get('animalId') ?? '';
  const { records: rawAnimals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const { records: rawMedications } = useHatoCollection<Record<string, unknown>>(
    'medications',
    '/medications',
    scope,
  );
  const animals = useMemo<AnimalOption[]>(() => rawAnimals.map((animal) => ({
    id: String(animal.id ?? ''),
    tag: String(animal.identifier_tag ?? animal.tag_number ?? ''),
    name: String(animal.name ?? 'Sin nombre'),
    breed: String(animal.breed ?? 'Sin raza'),
    sex: String(animal.gender ?? animal.sex ?? ''),
    lote: String(animal.lot_name ?? 'Sin lote'),
    status: String(animal.status ?? ''),
  })), [rawAnimals]);
  const medications = rawMedications
    .filter((medication) => medication.status !== 'inactive')
    .map((medication) => ({
      id: String(medication.id ?? ''),
      name: String(medication.name ?? ''),
    }))
    .filter((medication) => medication.id && medication.name);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedAnimalId, setSelectedAnimalId] = useState(initialAnimalId);
  const selectedAnimal = animals.find((animal) => animal.id === selectedAnimalId) ?? null;
  const [weightValue, setWeightValue] = useState<string>('');
  const [weightDate, setWeightDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [measurementMethod, setMeasurementMethod] = useState<string>('Báscula digital');
  const [medication, setMedication] = useState<string>('');
  const [dose, setDose] = useState<string>('');
  const [doseUnit, setDoseUnit] = useState<string>('mL');
  const [treatmentRoute, setTreatmentRoute] = useState<string>('Subcutánea');
  const [errors, setErrors] = useState<{ animal?: string; weight?: string; treatment?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validateStep = () => {
    const newErrors: { animal?: string; weight?: string; treatment?: string } = {};

    if (currentStep === 1 && !selectedAnimalId) {
      newErrors.animal = 'Debes seleccionar un animal para continuar.';
    }

    if (currentStep === 2) {
      const numWeight = parseFloat(weightValue);
      if (!weightValue || isNaN(numWeight) || numWeight <= 0) {
        newErrors.weight = 'Ingresa un peso válido mayor a 0 kg.';
      }
    }
    if (currentStep === 3 && medication && (!Number.isFinite(Number(dose)) || Number(dose) <= 0)) {
      newErrors.treatment = 'Ingresa una dosis mayor a cero o selecciona “Sin tratamiento adicional”.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (!scope || !selectedAnimal) {
        setSubmitError('Selecciona un animal de la finca activa.');
        return;
      }
      setIsSaving(true);
      setSubmitError(null);
      try {
        let pending = false;
        let lastError: string | undefined;
        const weightResult = await queueHatoWrite(scope, 'weight_records', 'CREATE', {
          animal_id: selectedAnimal.id,
          weigh_date: weightDate.slice(0, 10),
          measured_at: weightDate,
          weight_kg: Number(weightValue),
          method: measurementMethod,
        });
        pending = weightResult.pending;
        lastError = weightResult.lastError;

        if (medication) {
          const treatmentResult = await queueHatoWrite(scope, 'treatments', 'CREATE', {
            animal_id: selectedAnimal.id,
            medication_id: medication,
            start_date: weightDate,
            dose: Number(dose),
            dose_unit: doseUnit,
            route: treatmentRoute,
            status: 'ACTIVO',
          });
          pending ||= treatmentResult.pending;
          lastError = treatmentResult.lastError ?? lastError;
        }

        showNotification({
          type: pending ? 'alert' : 'success',
          title: pending ? 'Cambios pendientes de sincronización' : 'Registro guardado',
          message: pending
            ? lastError ?? 'El peso y el tratamiento quedaron en la cola de sincronización.'
            : 'El peso y el tratamiento se guardaron correctamente.',
        });
        navigate(`/hato/animales/${selectedAnimal.id}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo guardar el registro.';
        setSubmitError(message);
        showNotification({ type: 'error', title: 'No se pudo guardar el registro', message });
      } finally {
        setIsSaving(false);
      }
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
              selectedAnimalId={selectedAnimalId}
              onSelectAnimal={(animal) => setSelectedAnimalId(animal.id)}
              animals={animals}
              error={errors.animal}
            />
          )}

          {currentStep === 2 && (
            <Step2WeightKeypad
              animalTag={selectedAnimal?.tag ?? ''}
              animalName={selectedAnimal?.name ?? ''}
              animalBreed={selectedAnimal?.breed ?? ''}
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
              medications={medications}
              dose={dose}
              onDoseChange={setDose}
              doseUnit={doseUnit}
              onDoseUnitChange={setDoseUnit}
              treatmentRoute={treatmentRoute}
              onTreatmentRouteChange={setTreatmentRoute}
            />
          )}
        </div>
        {errors.treatment && currentStep === 3 && (
          <p role="alert" className="text-danger px-4">{errors.treatment}</p>
        )}
        {submitError && <p role="alert" className="text-danger px-4">{submitError}</p>}

        {/* Pie de Página */}
        <div className={styles.bottomBarFooter}>
          <button type="button" className={styles.btnCancel} onClick={handleBack}>
            {currentStep === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          <button type="button" className={styles.btnPrimary} onClick={() => void handleNext()} disabled={isSaving}>
            <span>
              {isSaving ? 'Guardando…' : currentStep === 3 ? 'Guardar registro' : 'Continuar'}
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