import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { StepBar } from './components/StepBar/StepBar';
import { Step1BasicData } from './components/Step1BasicData/Step1BasicData';
import { Step2Identifiers } from './components/Step2Identifiers/Step2Identifiers';
import { Step3LocationGenealogy } from './components/Step3LocationGenealogy/Step3LocationGenealogy';
import { Step4InitialWeight } from './components/Step4InitialWeight/Step4InitialWeight';
import styles from './RegisterAnimalPage.module.css';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { queueHatoWrite, useHatoCollection } from '../../../services/hatoDataService';
import useNotification from '../../../hooks/useNotification';
import type { AnimalFormData } from './types';

export const RegisterAnimalPage: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lots = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const paddocks = useHatoCollection<Record<string, unknown>>(
    'paddocks',
    '/paddocks',
    scope,
  );
  const { records: rawAnimals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const text = (value: unknown): string => typeof value === 'string' ? value : '';

  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    sex: 'Hembra',
    species: 'Bovino',
    breed: '',
    birthDate: '',
    birthWeight: '',
    acquisitionDate: '',
    acquisitionCost: '',
    identifierType: 'SINIGA',
    identifierCode: '',
    isOfficial: true,
    isCurrent: true,
    loteId: '',
    potreroId: '',
    sireId: '',
    damId: '',
    currentWeight: '0',
    currentWeightDate: new Date().toISOString().slice(0, 10),
    measurementMethod: 'Báscula digital',
  });

  const handleFieldChange = <K extends keyof AnimalFormData>(
    field: K,
    value: AnimalFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    if (!formData.identifierCode.trim()) {
      setCurrentStep(2);
      setSubmitError('El identificador del animal es obligatorio.');
      return;
    }

    const weight = Number(formData.currentWeight);
    if (!Number.isFinite(weight) || weight < 0) {
      setCurrentStep(4);
      setSubmitError('El peso debe ser un número mayor o igual a cero.');
      return;
    }

    setSubmitError(null);
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        organization_id: scope.organizationId,
        farm_id: scope.farmId,
        name: formData.name.trim() || undefined,
        gender: formData.sex,
        species: formData.species,
        breed: formData.breed || undefined,
        tag_number: formData.identifierCode.trim(),
        identifier_type: formData.identifierType,
        identifier_code: formData.identifierCode.trim(),
        is_official: formData.isOfficial,
        is_current: formData.isCurrent,
        lot_id: formData.loteId || undefined,
        paddock_id: formData.potreroId || undefined,
        sire_id: formData.sireId || undefined,
        dam_id: formData.damId || undefined,
        birth_date: formData.birthDate || undefined,
        weight_at_birth: formData.birthWeight ? Number(formData.birthWeight) : undefined,
        acquisition_date: formData.acquisitionDate || undefined,
        acquisition_cost: formData.acquisitionCost ? Number(formData.acquisitionCost) : undefined,
        current_weight: weight || undefined,
        current_weight_date: weight ? formData.currentWeightDate : undefined,
      };
      const result = await queueHatoWrite(scope, 'animals', 'CREATE', payload);
      let pending = result.pending;
      let lastError = result.lastError;
      if (weight > 0) {
        const weightResult = await queueHatoWrite(scope, 'weight_records', 'CREATE', {
          animal_id: result.recordId,
          weigh_date: formData.currentWeightDate,
          weight_kg: weight,
          method: formData.measurementMethod,
        });
        pending ||= weightResult.pending;
        lastError = weightResult.lastError ?? lastError;
      }

      showNotification({
        type: pending ? 'alert' : 'success',
        title: pending ? 'Cambios pendientes de sincronización' : 'Animal registrado',
        message: pending
          ? lastError ?? 'El registro quedó en la cola y se enviará cuando haya conexión.'
          : 'El animal y su peso inicial se registraron correctamente.',
      });
      navigate('/hato/animales');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el animal.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo registrar el animal', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    setSubmitError(null);
    if (currentStep < 4) {
      if (currentStep === 2 && !formData.identifierCode.trim()) {
        setSubmitError('El identificador del animal es obligatorio.');
        return;
      }
      setCurrentStep((prev) => prev + 1);
    } else {
      void handleSave();
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
            <Step3LocationGenealogy
              formData={formData}
              onChange={handleFieldChange}
              lots={lots.records.map((lot) => ({ id: text(lot.id), name: text(lot.name) }))}
              lotsLoading={lots.isLoading}
              lotsError={lots.error}
              paddocks={paddocks.records.map((paddock) => ({
                id: text(paddock.id),
                name: text(paddock.name),
              }))}
              paddocksLoading={paddocks.isLoading}
              paddocksError={paddocks.error}
              animals={rawAnimals.map((animal) => ({
                id: text(animal.id),
                tag: text(animal.identifier_tag) || text(animal.tag_number),
                name: text(animal.name) || 'Sin nombre',
                sex: text(animal.gender) || text(animal.sex),
                status: text(animal.status),
              }))}
            />
          )}
          {currentStep === 4 && (
            <Step4InitialWeight formData={formData} onChange={handleFieldChange} />
          )}
        </div>
        {submitError && <p role="alert" className="text-danger px-4">{submitError}</p>}

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
              disabled={isSaving}
            >
              <span>{isSaving ? 'Guardando…' : currentStep === 4 ? 'Guardar animal' : 'Continuar'}</span>
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