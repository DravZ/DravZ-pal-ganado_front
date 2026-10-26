import React, { useState } from 'react';
import styles from './MovementForm.module.css';
import { ArrowLeftRight, Plus, X, Check, Beef } from 'lucide-react';
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
    id: 'lot-1',
    farm_id: 'farm-1',
    name: 'Novillos levante',
    code: 'LOT-LEV-01',
    lot_type: 'Levante',
    purpose: 'Ceba',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    animal_count: 63
  },
  {
    id: 'lot-2',
    farm_id: 'farm-1',
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
    id: 'a-1',
    farm_id: 'farm-1',
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
    id: 'a-2',
    farm_id: 'farm-1',
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
    id: 'a-3',
    farm_id: 'farm-1',
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

    const movementId = crypto.randomUUID();

    const movementPayload: CreateMovementDTO = {
      farm_id: 'farm-1',
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

    console.log('[Action Log]: Registrando Movimiento:', movementPayload);
    console.log('[Sync Queue]:', syncQueueEntry);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formCard}>
      {/* SECCIÓN MOVEMENTS */}
      <div className={styles.sectionHeader}>
        <span className={styles.dbLabel}>MOVEMENTS</span>
        <h2 className={styles.sectionTitle}>Ruta y motivo del movimiento</h2>
      </div>

      <div className="row g-3 mb-3 align-items-center">
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

        <div className="col-12 col-md-2 text-center pt-md-4">
          <div className={styles.swapIcon}>
            <ArrowLeftRight size={18} />
          </div>
        </div>

        <div className="col-12 col-md-5">
          <label className={styles.label}>Lote de destino</label>
          <select
            className={styles.select}
            value={destinationLotId}
            onChange={(e) => setDestinationLotId(e.target.value)}
          >
            {MOCK_LOTS.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name} · {lot.animal_count} animales
              </option>
            ))}
          </select>
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
          </select>
        </div>

        <div className="col-12 col-md-4">
          <label className={styles.label}>Motivo</label>
          <input
            type="text"
            className={styles.input}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Cambio de etapa productiva"
          />
        </div>
      </div>

      {/* SECCIÓN MOVEMENT_ANIMALS */}
      <div className={styles.sectionHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>MOVEMENT_ANIMALS</span>
          <h2 className={styles.sectionTitle}>Animales seleccionados</h2>
        </div>
        <button type="button" className={styles.addAnimalBtn} onClick={handleAddAnimal}>
          <Plus size={16} />
          <span>Agregar animales</span>
        </button>
      </div>

      <div className="d-flex flex-column gap-2 mb-4">
        {selectedAnimals.map(({ animal, weight }) => (
          <div key={animal.id} className={styles.animalRow}>
            <div className="d-flex align-items-center gap-3">
              <div className={styles.avatarIcon}>
                <Beef size={18} color="#1e4b27" />
              </div>
              <div>
                <div className="fw-bold">
                  {animal.identifier_tag} · {animal.name}
                </div>
                <div className={styles.subText}>
                  {animal.breed} · {animal.sex}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 ms-auto">
              <span className={styles.subText}>Peso individual</span>
              <div className={styles.weightBox}>
                <input
                  type="number"
                  className={styles.weightInput}
                  value={weight}
                  onChange={(e) =>
                    handleWeightChange(animal.id, parseFloat(e.target.value) || 0)
                  }
                />
                <span className={styles.unitText}>kg</span>
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemoveAnimal(animal.id)}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RESUMEN Y BOTÓN GUARDAR */}
      <div className={styles.footerFlex}>
        <div>
          <span className={styles.dbLabel}>
            {selectedAnimals.length} ANIMALES SELECCIONADOS
          </span>
          <div className={styles.totalWeightText}>
            {totalKg.toLocaleString('es-CO')} kg totales
          </div>
        </div>

        <button type="submit" className={styles.saveBtn}>
          <Check size={18} />
          <span>Guardar movimiento</span>
        </button>
      </div>
    </form>
  );
};

export default MovementForm;