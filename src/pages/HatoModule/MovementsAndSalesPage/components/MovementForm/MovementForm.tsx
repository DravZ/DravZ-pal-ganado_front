import React, { useMemo, useState } from 'react';
import styles from './MovementForm.module.css';
import { ArrowLeftRight, Plus, Trash2, CheckCircle, Beef } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import { queueHatoWrite, useHatoCollection } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

interface HatoAnimal {
  id: string;
  identifier_tag: string;
  name: string;
  breed: string;
  sex: string;
  current_weight: number;
  lot_id: string;
  status: string;
}

interface AnimalSelectionItem {
  animal: HatoAnimal;
  weight: number;
}

export const MovementForm: React.FC = () => {
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { records: rawLots } = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const { records: rawAnimals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const lots = rawLots.map((lot) => ({
    id: String(lot.id ?? ''),
    name: String(lot.name ?? ''),
  })).filter((lot) => lot.id && lot.name);
  const animals = useMemo<HatoAnimal[]>(() => rawAnimals.map((animal) => ({
    id: String(animal.id ?? ''),
    identifier_tag: String(animal.identifier_tag ?? animal.tag_number ?? ''),
    name: String(animal.name ?? 'Sin nombre'),
    breed: String(animal.breed ?? 'Sin raza'),
    sex: String(animal.gender ?? animal.sex ?? ''),
    current_weight: Number(animal.current_weight ?? 0),
    lot_id: String(animal.lot_id ?? ''),
    status: String(animal.status ?? ''),
  })), [rawAnimals]);
  const [originLotId, setOriginLotId] = useState('');
  const [destinationLotId, setDestinationLotId] = useState('');
  const originId = originLotId || lots[0]?.id || '';
  const destinationId = destinationLotId || lots.find((lot) => lot.id !== originId)?.id || '';
  const availableAnimals = animals.filter((animal) =>
    animal.status === 'active' && animal.lot_id === originId,
  );
  const [movementDate, setMovementDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [movementType, setMovementType] = useState<string>('Transferencia interna');
  const [reason, setReason] = useState<string>('');
  const [selectedAnimals, setSelectedAnimals] = useState<AnimalSelectionItem[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddAnimal = () => {
    const unselected = availableAnimals.find(
      (item) => !selectedAnimals.some((selected) => selected.animal.id === item.id),
    );
    if (unselected) {
      setSelectedAnimals([
        ...selectedAnimals,
        { animal: unselected, weight: unselected.current_weight },
      ]);
    }
  };

  const handleRemoveAnimal = (id: string) => {
    setSelectedAnimals(selectedAnimals.filter((sa) => sa.animal.id !== id));
  };

  const handleWeightChange = (id: string, newWeight: number) => {
    setSelectedAnimals(
      selectedAnimals.map((sa) => (sa.animal.id === id ? { ...sa, weight: newWeight } : sa))
    );
  };

  const totalKg = selectedAnimals.reduce((acc, curr) => acc + (curr.weight || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const newErrors: { [key: string]: string } = {};

    const activeScope = scope;
    if (!activeScope) {
      setErrors({ scope: 'No hay una finca autorizada seleccionada.' });
      return;
    }
    if (!originId || !destinationId) newErrors.destinationLotId = 'Selecciona los lotes de origen y destino.';
    if (originId === destinationId) {
      newErrors.destinationLotId = 'El lote de destino debe ser diferente al de origen.';
    }
    if (selectedAnimals.length === 0) {
      newErrors.animals = 'Debe seleccionar al menos un animal para mover.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedAnimals.some((selected) => selected.animal.lot_id !== originId)) {
      setErrors({ animals: 'Todos los animales deben pertenecer al lote de origen.' });
      return;
    }

    setErrors({});
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(activeScope, 'movements', 'CREATE', {
        farm_id: activeScope.farmId,
        origin_lot_id: originId,
        destination_lot_id: destinationId,
        movement_date: `${movementDate}T00:00:00`,
        movement_type: movementType,
        reason: reason || undefined,
        animals: selectedAnimals.map(({ animal, weight }) => ({
          animal_id: animal.id,
          weight,
        })),
      });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Movimiento pendiente de sincronización' : 'Movimiento registrado',
        message: result.lastError ?? (result.pending
          ? 'El movimiento quedó guardado en la cola local.'
          : 'El movimiento y el cambio de lote se confirmaron en el servidor.'),
      });
      setSelectedAnimals([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar el movimiento.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo registrar el movimiento', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formCard}>
      {/* SECCIÓN MOVEMENTS */}
      <div className={styles.sectionHeader}>
        <span className={styles.dbLabel}>MOVEMENTS</span>
        <h2 className={styles.sectionTitle}>Ruta y motivo del movimiento</h2>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-5">
          <label className={styles.label}>Lote de origen</label>
          <select
            className={styles.select}
            value={originId}
            onChange={(e) => {
              setOriginLotId(e.target.value);
              setSelectedAnimals([]);
            }}
            required
          >
            <option value="">Selecciona lote de origen</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name} · {animals.filter((animal) => animal.lot_id === lot.id).length} animales
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-2 d-flex align-items-end justify-content-center pb-2">
          <div className={styles.swapIconContainer}>
            <ArrowLeftRight size={20} />
          </div>
        </div>

        <div className="col-12 col-md-5">
          <label className={styles.label}>Lote de destino</label>
          <select
            className={`${styles.select} ${errors.destinationLotId ? styles.inputError : ''}`}
            value={destinationId}
            onChange={(e) => setDestinationLotId(e.target.value)}
            required
          >
            <option value="">Selecciona lote de destino</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name}
              </option>
            ))}
          </select>
          {errors.destinationLotId && (
            <span className={styles.errorText}>{errors.destinationLotId}</span>
          )}
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <label className={styles.label}>Fecha</label>
          <input
            type="date"
            className={styles.input}
            value={movementDate}
            onChange={(e) => setMovementDate(e.target.value)}
            required
          />
        </div>

        <div className="col-12 col-md-4">
          <label className={styles.label}>Tipo de movimiento</label>
          <select
            className={styles.select}
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
          >
            <option value="Transferencia interna">Transferencia interna</option>
            <option value="Reubicación por pastoreo">Reubicación por pastoreo</option>
            <option value="Aislamiento sanitario">Aislamiento sanitario</option>
          </select>
        </div>

        <div className="col-12 col-md-4">
          <label className={styles.label}>Motivo</label>
          <input
            type="text"
            className={styles.input}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. Cambio de etapa productiva"
          />
        </div>
      </div>

      <hr className={styles.divider} />

      {/* SECCIÓN MOVEMENT_ANIMALS (Encabezado con wrap responsive) */}
      <div className={styles.sectionHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>MOVEMENT_ANIMALS</span>
          <h2 className={styles.sectionTitleNoMargin}>Animales seleccionados</h2>
        </div>
        <button
          type="button"
          className={styles.addAnimalBtn}
          onClick={handleAddAnimal}
          disabled={availableAnimals.every((animal) =>
            selectedAnimals.some((selected) => selected.animal.id === animal.id),
          )}
        >
          <Plus size={18} />
          <span>Agregar animales</span>
        </button>
      </div>

      {errors.animals && <div className={styles.errorBanner}>{errors.animals}</div>}

      <div className="d-flex flex-column gap-3 mb-4 mt-3">
        {selectedAnimals.map(({ animal, weight }) => (
          <div key={animal.id} className={styles.animalRow}>
            {/* Información Básica del Animal */}
            <div className="d-flex align-items-center gap-3 overflow-hidden">
              <div className={styles.avatarIcon}>
                <Beef size={20} color="#1e4b27" />
              </div>
              <div className="text-truncate">
                <div className={styles.animalTitle}>{animal.identifier_tag} · {animal.name}</div>
                <div className={styles.animalSubtitle}>
                  {animal.breed} · {animal.sex}
                </div>
              </div>
            </div>

            {/* Fila de Acciones y Controles de Peso */}
            <div className={styles.actionControlsRow}>
              <div className="d-flex align-items-center gap-2">
                <span className={styles.weightLabel}>Peso</span>
                <div className={styles.weightInputGroup}>
                  <input
                    type="number"
                    className={styles.weightInput}
                    value={weight}
                    onChange={(e) => handleWeightChange(animal.id, parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                    required
                  />
                  <span className={styles.unit}>kg</span>
                </div>
              </div>

              <button
                type="button"
                className={styles.removeBtnExplicit}
                onClick={() => handleRemoveAnimal(animal.id)}
                title="Quitar animal de la lista"
              >
                <Trash2 size={16} />
                <span>Quitar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PIE Y RESUMEN */}
      <div className={styles.summaryFooter}>
        <div>
          <span className={styles.summaryCount}>
            {selectedAnimals.length} ANIMALES SELECCIONADOS
          </span>
          <div className={styles.summaryTotal}>{totalKg.toLocaleString('es-CO')} kg totales</div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={isSaving}>
          <CheckCircle size={18} />
          <span>{isSaving ? 'Guardando…' : 'Guardar movimiento'}</span>
        </button>
      </div>
      {(errors.scope || submitError) && (
        <p role="alert" className="text-danger">
          {errors.scope ?? submitError}
        </p>
      )}
    </form>
  );
};

export default MovementForm;