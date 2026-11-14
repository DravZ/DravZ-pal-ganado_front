import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../RegisterAnimalPage/RegisterAnimalPage.module.css';
import basicStyles from '../RegisterAnimalPage/components/Step1BasicData/Step1BasicData.module.css';
import locationStyles from '../RegisterAnimalPage/components/Step3LocationGenealogy/Step3LocationGenealogy.module.css';
import { breedsBySpecies } from '../RegisterAnimalPage/animalOptions';
import FarmLocationFields from '../RegisterAnimalPage/components/FarmLocationFields/FarmLocationFields';
import { AnimalPhotoField } from '../RegisterAnimalPage/components/AnimalPhotoField/AnimalPhotoField';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../context/FormExitGuardContext';
import {
  queueHatoWrite,
  useHatoCollection,
  useHatoRecord,
} from '../../../services/hatoDataService';
import useNotification from '../../../hooks/useNotification';
import { todayLocalDate } from '../../../utils/dates';

interface AnimalDraft {
  tagNumber: string;
  name: string;
  gender: string;
  species: string;
  breed: string;
  birthDate: string;
  lotId: string;
  paddockId: string;
  sireId: string;
  damId: string;
  notes: string;
  photoBase64: string;
}

function text(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function dateValue(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 10) : '';
}

function normalized(value: unknown): string {
  return text(value).trim().toLocaleLowerCase();
}

function speciesKey(value: string): string {
  const species = normalized(value);
  if (['bovino', 'bovina', 'bovine', 'cattle'].includes(species)) return 'bovino';
  if (['bubalino', 'bufalino', 'bufalo', 'búfalo', 'buffalo'].includes(species)) return 'bubalino';
  if (['ovino', 'ovina', 'sheep'].includes(species)) return 'ovino';
  return species;
}

function isActiveAnimal(animal: Record<string, unknown>): boolean {
  return !['inactive', 'inactivo', 'baja', 'sold', 'vendido', 'deceased', 'muerto', 'eliminado']
    .includes(normalized(animal.status));
}

export default function EditAnimalPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { record, isLoading, error } = useHatoRecord<Record<string, unknown>>(
    'animals',
    `/animals/${encodeURIComponent(id)}`,
    id,
    scope,
  );
  const { records: animals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const lots = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const paddocks = useHatoCollection<Record<string, unknown>>('paddocks', '/paddocks', scope);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draft, setDraft] = useState<AnimalDraft | null>(null);

  if (isLoading) {
    return <p role="status">Cargando datos del animal…</p>;
  }
  if (!record || !scope) {
    return (
      <section className={styles.pageWrapper}>
        <p role="alert">{error ?? 'No se encontró el animal dentro de la finca activa.'}</p>
        <button type="button" className={styles.btnSecondary} onClick={() => navigate(-1)}>
          Volver
        </button>
      </section>
    );
  }

  const initialDraft: AnimalDraft = {
    tagNumber: text(record.tag_number ?? record.identifier_tag),
    name: text(record.name),
    gender: text(record.gender ?? record.sex),
    species: text(record.species),
    breed: text(record.breed),
    birthDate: dateValue(record.birth_date),
    lotId: text(record.lot_id),
    paddockId: text(record.paddock_id),
    sireId: text(record.sire_id),
    damId: text(record.dam_id),
    notes: text(record.notes),
    photoBase64: text(record.photo_base64 ?? record.photoBase64),
  };
  const values = draft ?? initialDraft;
  const setField = (field: keyof AnimalDraft, value: string) => {
    setDraft((current) => ({ ...(current ?? initialDraft), [field]: value }));
  };
  const selectableAnimals = animals.filter((animal) => animal.id !== id && isActiveAnimal(animal));
  const sires = selectableAnimals.filter((animal) =>
    ['macho', 'male'].includes(normalized(animal.gender ?? animal.sex)),
  );
  const dams = selectableAnimals.filter((animal) =>
    ['hembra', 'female'].includes(normalized(animal.gender ?? animal.sex)),
  );
  const currentSpeciesKey = speciesKey(values.species);
  const breeds = breedsBySpecies[currentSpeciesKey] ?? [];
  const existingBreedIsCustom = values.breed.length > 0 && !breeds.includes(values.breed);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!scope) return;
    if (values.birthDate && values.birthDate > todayLocalDate()) {
      setSubmitError('La fecha de nacimiento no puede ser futura.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'animals', 'UPDATE', {
        farm_id: scope.farmId,
        tag_number: values.tagNumber.trim() || undefined,
        name: values.name.trim() || undefined,
        gender: values.gender || undefined,
        species: values.species || undefined,
        breed: values.breed || undefined,
        birth_date: values.birthDate || undefined,
        lot_id: values.lotId || undefined,
        paddock_id: values.paddockId || undefined,
        sire_id: values.sireId || undefined,
        dam_id: values.damId || undefined,
        notes: values.notes,
        ...(values.photoBase64 !== initialDraft.photoBase64
          ? { photo_base64: values.photoBase64 }
          : {}),
      }, id);

      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Edición pendiente de sincronización' : 'Animal actualizado',
        message: result.lastError ?? (result.pending
          ? 'Los cambios quedaron guardados en la cola local.'
          : 'Los datos del animal se actualizaron correctamente.'),
      });
      navigate(`/hato/animales/${encodeURIComponent(id)}`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo actualizar el animal.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo actualizar el animal', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.pageWrapper}>
      <div>
        <div className={styles.topBreadcrumbKicker}>EXPEDIENTE · EDICIÓN</div>
        <h1 className={styles.pageMainTitle}>Editar animal</h1>
        <p className={styles.pageSubText}>Actualiza los datos del animal seleccionado.</p>
      </div>

      <form className={styles.mainCardContainer} onSubmit={handleSubmit}>
        <div className={styles.formContentArea}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className={basicStyles.formLabel} htmlFor="animal-tag">Identificador</label>
              <input id="animal-tag" className={basicStyles.formControl} value={values.tagNumber}
                onChange={(event) => setField('tagNumber', event.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className={basicStyles.formLabel} htmlFor="animal-name">Nombre</label>
              <input id="animal-name" className={basicStyles.formControl} value={values.name}
                onChange={(event) => setField('name', event.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className={basicStyles.formLabel} htmlFor="animal-gender">Sexo</label>
              <div className={basicStyles.sexToggleGroup}>
                <button
                  type="button"
                  className={`${basicStyles.sexToggleBtn} ${
                    values.gender.toLocaleLowerCase() === 'hembra' ? basicStyles.sexToggleActiveHembra : ''
                  }`}
                  onClick={() => setField('gender', 'Hembra')}
                >
                  ♀ Hembra
                </button>
                <button
                  type="button"
                  className={`${basicStyles.sexToggleBtn} ${
                    values.gender.toLocaleLowerCase() === 'macho' ? basicStyles.sexToggleActiveMacho : ''
                  }`}
                  onClick={() => setField('gender', 'Macho')}
                >
                  ♂ Macho
                </button>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <label className={basicStyles.formLabel} htmlFor="animal-species">Especie</label>
              <select
                id="animal-species"
                className={basicStyles.formControl}
                value={values.species}
                onChange={(event) => {
                  setField('species', event.target.value);
                  setField('breed', '');
                }}
              >
                {!['bovino', 'bubalino', 'ovino'].includes(currentSpeciesKey) && values.species && (
                  <option value={values.species}>{values.species}</option>
                )}
                <option value="Bovino">Bovino</option>
                <option value="Bubalino">Bubalino</option>
                <option value="Ovino">Ovino</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className={basicStyles.formLabel} htmlFor="animal-breed">Raza</label>
              <select id="animal-breed" className={basicStyles.formControl} value={values.breed}
                onChange={(event) => setField('breed', event.target.value)}>
                <option value="">Selecciona una raza</option>
                {existingBreedIsCustom && <option value={values.breed}>{values.breed}</option>}
                {breeds.map((breed) => <option key={breed} value={breed}>{breed}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className={basicStyles.formLabel} htmlFor="animal-birth-date">Fecha de nacimiento</label>
              <input id="animal-birth-date" type="date" className={basicStyles.formControl} value={values.birthDate}
                max={todayLocalDate()}
                onChange={(event) => setField('birthDate', event.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className={locationStyles.formLabel} htmlFor="animal-sire">Padre</label>
              <select id="animal-sire" className={locationStyles.formControl} value={values.sireId}
                onChange={(event) => setField('sireId', event.target.value)}>
                <option value="">Sin padre registrado</option>
                {sires.map((animal) => (
                  <option key={String(animal.id)} value={String(animal.id)}>
                    {String(animal.tag_number ?? animal.identifier_tag ?? animal.name ?? animal.id)}
                  </option>
                ))}
              </select>
              <div className={locationStyles.fieldHint}>Solo se muestran animales machos activos.</div>
            </div>
            <div className="col-12 col-md-6">
              <label className={locationStyles.formLabel} htmlFor="animal-dam">Madre</label>
              <select id="animal-dam" className={locationStyles.formControl} value={values.damId}
                onChange={(event) => setField('damId', event.target.value)}>
                <option value="">Sin madre registrada</option>
                {dams.map((animal) => (
                  <option key={String(animal.id)} value={String(animal.id)}>
                    {String(animal.tag_number ?? animal.identifier_tag ?? animal.name ?? animal.id)}
                  </option>
                ))}
              </select>
              <div className={locationStyles.fieldHint}>Solo se muestran animales hembras activas.</div>
            </div>
            <FarmLocationFields
              lotId={values.lotId}
              paddockId={values.paddockId}
              onLotChange={(lotId) => setField('lotId', lotId)}
              onPaddockChange={(paddockId) => setField('paddockId', paddockId)}
              lots={lots.records.map((lot) => ({
                id: String(lot.id ?? ''),
                name: String(lot.name ?? ''),
              }))}
              lotsLoading={lots.isLoading}
              lotsError={lots.error}
              paddocks={paddocks.records.map((paddock) => ({
                id: String(paddock.id ?? ''),
                name: String(paddock.name ?? ''),
              }))}
              paddocksLoading={paddocks.isLoading}
              paddocksError={paddocks.error}
            />
            <div className="col-12">
              <label className={basicStyles.formLabel}>Fotografía del animal (opcional)</label>
              <AnimalPhotoField
                value={values.photoBase64}
                onChange={(photoBase64) => setField('photoBase64', photoBase64)}
              />
            </div>
            <div className="col-12">
              <label className={basicStyles.formLabel} htmlFor="animal-notes">Notas</label>
              <textarea id="animal-notes" className={basicStyles.formControl} rows={3} value={values.notes}
                onChange={(event) => setField('notes', event.target.value)} />
            </div>
          </div>
          {submitError && <p role="alert" className="text-danger mt-3 mb-0">{submitError}</p>}
        </div>
        <div className={styles.bottomBarFooter}>
          <button type="button" className={styles.btnSecondary}
            onClick={() => navigate(`/hato/animales/${encodeURIComponent(id)}`)}>
            Cancelar
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  );
}
