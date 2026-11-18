import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { StepBar } from './components/StepBar/StepBar';
import { Step1BasicData } from './components/Step1BasicData/Step1BasicData';
import { Step2Identifiers } from './components/Step2Identifiers/Step2Identifiers';
import { Step3LocationGenealogy } from './components/Step3LocationGenealogy/Step3LocationGenealogy';
import { Step4AnimalPhoto } from './components/Step4AnimalPhoto/Step4AnimalPhoto';
import { Step4InitialWeight } from './components/Step4InitialWeight/Step4InitialWeight';
import styles from './RegisterAnimalPage.module.css';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../context/FormExitGuardContext';
import { queueHatoWrite, useHatoCollection } from '../../../services/hatoDataService';
import useNotification from '../../../hooks/useNotification';
import { todayLocalDate } from '../../../utils/dates';
import { createIdentifierDraft, resolveCurrentIdentifier } from './identifierDrafts';
import type { AnimalFormData } from './types';

export const RegisterAnimalPage: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
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
    identifiers: [createIdentifierDraft(true)],
    loteId: '',
    potreroId: '',
    sireId: '',
    damId: '',
    currentWeight: '',
    currentWeightDate: todayLocalDate(),
    measurementMethod: 'Báscula digital',
    notes: '',
    photoBase64: '',
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
    const currentIdentifier = resolveCurrentIdentifier(formData.identifiers);
    if (!currentIdentifier) {
      setCurrentStep(2);
      setSubmitError('El identificador del animal es obligatorio.');
      return;
    }
    const identifierCodes = formData.identifiers
      .map((identifier) => identifier.code.trim().toLowerCase())
      .filter((code) => code !== '');
    if (new Set(identifierCodes).size !== identifierCodes.length) {
      setCurrentStep(2);
      setSubmitError('No puedes repetir el mismo código en dos identificadores.');
      return;
    }
    if (!formData.photoBase64.trim()) {
      setCurrentStep(4);
      setSubmitError('La fotografía del animal es obligatoria.');
      return;
    }

    const today = todayLocalDate();
    if (formData.birthDate && formData.birthDate > today) {
      setCurrentStep(1);
      setSubmitError('La fecha de nacimiento no puede ser futura.');
      return;
    }
    if (formData.acquisitionDate) {
      if (formData.acquisitionDate > today) {
        setCurrentStep(1);
        setSubmitError('La fecha de adquisición no puede ser futura.');
        return;
      }
      if (formData.birthDate && formData.acquisitionDate < formData.birthDate) {
        setCurrentStep(1);
        setSubmitError('La fecha de adquisición no puede ser anterior a la fecha de nacimiento.');
        return;
      }
    }

    const weightText = formData.currentWeight.trim();
    const weight = weightText === '' ? 0 : Number(weightText);
    if (weightText !== '' && (!Number.isFinite(weight) || weight <= 0)) {
      setCurrentStep(5);
      setSubmitError('Si registras un peso inicial, debe ser mayor que cero.');
      return;
    }
    if (weight > 0) {
      if (formData.currentWeightDate > today) {
        setCurrentStep(5);
        setSubmitError('La fecha de medición no puede ser futura.');
        return;
      }
      if (formData.birthDate && formData.currentWeightDate < formData.birthDate) {
        setCurrentStep(5);
        setSubmitError('La fecha de medición no puede ser anterior a la fecha de nacimiento.');
        return;
      }
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
        tag_number: currentIdentifier.code.trim(),
        identifier_type: currentIdentifier.type,
        identifier_code: currentIdentifier.code.trim(),
        is_official: currentIdentifier.isOfficial,
        is_current: true,
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
        notes: formData.notes.trim() || undefined,
        photo_base64: formData.photoBase64,
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

      const additionalIdentifiers = formData.identifiers.filter(
        (identifier) => identifier.id !== currentIdentifier.id && identifier.code.trim() !== '',
      );
      for (const identifier of additionalIdentifiers) {
        const identifierResult = await queueHatoWrite(scope, 'animal_identifiers', 'CREATE', {
          animal_id: result.recordId,
          identifier_type: identifier.type,
          identifier: identifier.code.trim(),
          is_current: false,
          is_official: identifier.isOfficial,
        });
        pending ||= identifierResult.pending;
        lastError = identifierResult.lastError ?? lastError;
      }

      markCurrentFormsSaved();
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
    if (currentStep < 5) {
      if (currentStep === 2 && !resolveCurrentIdentifier(formData.identifiers)) {
        setSubmitError('El identificador del animal es obligatorio.');
        return;
      }
      if (currentStep === 4 && !formData.photoBase64.trim()) {
        setSubmitError('La fotografía del animal es obligatoria.');
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
        return 'Fotografía del animal';
      case 5:
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
      <div className={styles.mainCardContainer} data-unsaved-form="animal-registration">
        {/* Barra del Stepper Wizard */}
        <StepBar currentStep={currentStep} />

        {/* Contenido Dinámico según el paso */}
        <div className={styles.formContentArea}>
          {currentStep === 1 && (
            <div data-draft-step="basic">
              <Step1BasicData formData={formData} onChange={handleFieldChange} />
            </div>
          )}
          {currentStep === 2 && (
            <div data-draft-step="identifiers">
              <Step2Identifiers formData={formData} onChange={handleFieldChange} />
            </div>
          )}
          {currentStep === 3 && (
            <div data-draft-step="location-genealogy">
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
            </div>
          )}
          {currentStep === 4 && (
            <div data-draft-step="animal-photo">
              <Step4AnimalPhoto
                value={formData.photoBase64}
                onChange={(photoBase64) => handleFieldChange('photoBase64', photoBase64)}
              />
            </div>
          )}
          {currentStep === 5 && (
            <div data-draft-step="initial-weight">
              <Step4InitialWeight formData={formData} onChange={handleFieldChange} />
            </div>
          )}
        </div>
        {submitError && <p role="alert" className="text-danger px-4">{submitError}</p>}

        {/* Pie de Navegación de la Página */}
        <div className={styles.bottomBarFooter}>
          <div className={styles.stepCounterText}>
            PASO {currentStep} DE 5
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
              <span>{isSaving ? 'Guardando…' : currentStep === 5 ? 'Guardar animal' : 'Continuar'}</span>
              {currentStep === 5 ? (
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