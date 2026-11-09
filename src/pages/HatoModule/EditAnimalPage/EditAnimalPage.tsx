import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../RegisterAnimalPage/RegisterAnimalPage.module.css';
import { useFarmScope } from '../../../context/FarmScopeContext';
import {
  queueHatoWrite,
  useHatoCollection,
  useHatoRecord,
} from '../../../services/hatoDataService';
import useNotification from '../../../hooks/useNotification';

interface AnimalDraft {
  tagNumber: string;
  name: string;
  gender: string;
  species: string;
  breed: string;
  birthDate: string;
  sireId: string;
  damId: string;
  notes: string;
}

function text(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function dateValue(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 10) : '';
}

export default function EditAnimalPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { scope } = useFarmScope();
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
    sireId: text(record.sire_id),
    damId: text(record.dam_id),
    notes: text(record.notes),
  };
  const values = draft ?? initialDraft;
  const setField = (field: keyof AnimalDraft, value: string) => {
    setDraft((current) => ({ ...(current ?? initialDraft), [field]: value }));
  };
  const selectableAnimals = animals.filter((animal) => animal.id !== id);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!scope) return;
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
        sire_id: values.sireId || undefined,
        dam_id: values.damId || undefined,
        notes: values.notes || undefined,
      }, id);

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
              <label className="form-label" htmlFor="animal-tag">Identificador</label>
              <input id="animal-tag" className="form-control" value={values.tagNumber}
                onChange={(event) => setField('tagNumber', event.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="animal-name">Nombre</label>
              <input id="animal-name" className="form-control" value={values.name}
                onChange={(event) => setField('name', event.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="animal-gender">Sexo</label>
              <select id="animal-gender" className="form-select" value={values.gender}
                onChange={(event) => setField('gender', event.target.value)} required>
                <option value="">Selecciona el sexo</option>
                <option value="Hembra">Hembra</option>
                <option value="Macho">Macho</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="animal-species">Especie</label>
              <input id="animal-species" className="form-control" value={values.species}
                onChange={(event) => setField('species', event.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="animal-breed">Raza</label>
              <input id="animal-breed" className="form-control" value={values.breed}
                onChange={(event) => setField('breed', event.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="animal-birth-date">Fecha de nacimiento</label>
              <input id="animal-birth-date" type="date" className="form-control" value={values.birthDate}
                onChange={(event) => setField('birthDate', event.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="animal-sire">Padre</label>
              <select id="animal-sire" className="form-select" value={values.sireId}
                onChange={(event) => setField('sireId', event.target.value)}>
                <option value="">Sin cambio</option>
                {selectableAnimals.map((animal) => (
                  <option key={String(animal.id)} value={String(animal.id)}>
                    {String(animal.tag_number ?? animal.identifier_tag ?? animal.name ?? animal.id)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="animal-dam">Madre</label>
              <select id="animal-dam" className="form-select" value={values.damId}
                onChange={(event) => setField('damId', event.target.value)}>
                <option value="">Sin cambio</option>
                {selectableAnimals.map((animal) => (
                  <option key={String(animal.id)} value={String(animal.id)}>
                    {String(animal.tag_number ?? animal.identifier_tag ?? animal.name ?? animal.id)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="animal-notes">Notas</label>
              <textarea id="animal-notes" className="form-control" rows={3} value={values.notes}
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
