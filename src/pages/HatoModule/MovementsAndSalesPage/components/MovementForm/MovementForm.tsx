import React, { useState } from 'react';
import styles from './MovementForm.module.css';
import { ArrowLeftRight, Plus, Trash2, CheckCircle, Beef } from 'lucide-react';
import type {
  Lot,
  Animal,
  CreateMovementDTO,
  SyncQueueEntry
} from '../../../../../types/database.types';

interface AnimalSelectionItem {
  animal: Animal & { identifier_tag: string };
  weight: number;
}

const MOCK_LOTS: (Lot & { animal_count: number })[] = [
  {
    id: '8a11e8a2-23bf-4d80-8772-23fa00100001',
    farm_id: 'f9d12345-0000-0000-0000-000000000001',
    name: 'Novillos levante',
    code: 'LOT-LEV-01',
    lot_type: 'Levante',
    purpose: 'Ceba',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    animal_count: 63
  },
  {
    id: '8a11e8a2-23bf-4d80-8772-23fa00100002',
    farm_id: 'f9d12345-0000-0000-0000-000000000001',
    name: 'Ceba final',
    code: 'LOT-CEB-02',
    lot_type: 'Engorde',
    purpose: 'Venta',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    animal_count: 24
  }
];

const MOCK_AVAILABLE_ANIMALS: (Animal & { identifier_tag: string })[] = [
  {
    id: 'a1011111-0000-0000-0000-111111111111',
    farm_id: 'f9d12345-0000-0000-0000-000000000001',
    name: 'Esperanza',
    identifier_tag: 'BR-1042',
    sex: 'Hembra',
    species: 'bovino',
    breed: 'Nelore',
    current_weight: 482,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a2022222-0000-0000-0000-222222222222',
    farm_id: 'f9d12345-0000-0000-0000-000000000001',
    name: 'Magnate',
    identifier_tag: 'BR-1088',
    sex: 'Macho',
    species: 'bovino',
    breed: 'Angus',
    current_weight: 536,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a3033333-0000-0000-0000-333333333333',
    farm_id: 'f9d12345-0000-0000-0000-000000000001',
    name: 'Canela',
    identifier_tag: 'BR-1124',
    sex: 'Hembra',
    species: 'bovino',
    breed: 'Braford',
    current_weight: 418,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const MovementForm: React.FC = () => {
  const [originLotId, setOriginLotId] = useState<string>(MOCK_LOTS[0].id);
  const [destinationLotId, setDestinationLotId] = useState<string>(MOCK_LOTS[1].id);
  const [movementDate, setMovementDate] = useState<string>('2025-06-16');
  const [movementType, setMovementType] = useState<string>('Transferencia interna');
  const [reason, setReason] = useState<string>('Cambio de etapa productiva');

  const [selectedAnimals, setSelectedAnimals] = useState<AnimalSelectionItem[]>([
    { animal: MOCK_AVAILABLE_ANIMALS[0], weight: 482 },
    { animal: MOCK_AVAILABLE_ANIMALS[1], weight: 536 },
    { animal: MOCK_AVAILABLE_ANIMALS[2], weight: 418 }
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleAddAnimal = () => {
    const unselected = MOCK_AVAILABLE_ANIMALS.find(
      (item) => !selectedAnimals.some((sa) => sa.animal.id === item.id)
    );
    if (unselected) {
      setSelectedAnimals([
        ...selectedAnimals,
        { animal: unselected, weight: unselected.current_weight || 0 }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (originLotId === destinationLotId) {
      newErrors.destinationLotId = 'El lote de destino debe ser diferente al de origen.';
    }
    if (selectedAnimals.length === 0) {
      newErrors.animals = 'Debe seleccionar al menos un animal para mover.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const farmId = 'f9d12345-0000-0000-0000-000000000001';
    const movementId = crypto.randomUUID();

    const movementPayload: CreateMovementDTO = {
      farm_id: farmId,
      origin_lot_id: originLotId,
      destination_lot_id: destinationLotId,
      movement_date: new Date(movementDate).toISOString(),
      movement_type: movementType,
      reason: reason,
      animals: selectedAnimals.map((sa) => ({
        animal_id: sa.animal.id,
        weight: sa.weight
      }))
    };

    const syncQueueEntry: SyncQueueEntry<CreateMovementDTO> = {
      id: crypto.randomUUID(),
      entity_name: 'movements',
      entity_id: movementId,
      operation_type: 'CREATE',
      payload: movementPayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Registrando Movimiento de Ganado:', movementPayload);
    console.log('[Sync Queue Payload]:', syncQueueEntry);
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
            value={originLotId}
            onChange={(e) => setOriginLotId(e.target.value)}
          >
            {MOCK_LOTS.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name} · {lot.animal_count} animales
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
            value={destinationLotId}
            onChange={(e) => setDestinationLotId(e.target.value)}
          >
            {MOCK_LOTS.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name} · {lot.animal_count} animales
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
        <button type="button" className={styles.addAnimalBtn} onClick={handleAddAnimal}>
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
                <div className={styles.animalTitle}>
                  {animal.identifier_tag} · {animal.name}
                </div>
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

        <button type="submit" className={styles.saveBtn}>
          <CheckCircle size={18} />
          <span>Guardar movimiento</span>
        </button>
      </div>
    </form>
  );
};

export default MovementForm;