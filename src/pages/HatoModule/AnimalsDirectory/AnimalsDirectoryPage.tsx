import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AnimalStats } from './components/AnimalStats/AnimalStats';
import { AnimalFilters } from './components/AnimalFilters/AnimalFilters';
import { AnimalTable, type AnimalItem } from './components/AnimalTable/AnimalTable';
import styles from './AnimalsDirectoryPage.module.css';
import { useFarmScope } from '../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../services/hatoDataService';

type HatoRecord = Record<string, unknown>;

const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export const AnimalsDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const { records: rawAnimals, isLoading, error } = useHatoCollection<HatoRecord>(
    'animals',
    '/animals?include_photo=true',
    scope,
  );
  const { records: lots } = useHatoCollection<HatoRecord>('lots', '/lots', scope);
  const { records: paddocks } = useHatoCollection<HatoRecord>('paddocks', '/paddocks', scope);
  const animals: AnimalItem[] = rawAnimals.map((animal) => ({
    id: text(animal.id),
    tag: text(animal.identifier_tag, text(animal.tag_number, 'Sin identificador')),
    name: text(animal.name, 'Sin nombre'),
    breed: text(animal.breed, 'Sin raza'),
    sex: ['Hembra', 'hembra'].includes(text(animal.gender, text(animal.sex)))
      ? 'Hembra'
      : 'Macho',
    weight: Number(animal.current_weight ?? 0),
    date: text(animal.current_weight_date, 'Sin fecha'),
    lote: text(animal.lot_name, 'Sin lote'),
    potrero: text(animal.paddock_name, 'Sin potrero'),
    status: text(animal.status) === 'active' ? 'Activo' : text(animal.status, 'Inactivo'),
    lotId: text(animal.lot_id),
    paddockId: text(animal.paddock_id),
    photoBase64: text(animal.photo_base64, text(animal.photoBase64)),
  }));

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLote, setSelectedLote] = useState('');
  const [selectedPotrero, setSelectedPotrero] = useState('');
  const [selectedSexo, setSelectedSexo] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  const handleRegisterAnimal = () => {
    navigate('/hato/nuevo');
  };

  const handleSelectAnimal = (id: string) => {
    navigate(`/hato/animales/${id}`);
  };

  const filteredAnimals = animals.filter((animal) => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return (!query || `${animal.tag} ${animal.name} ${animal.breed}`.toLocaleLowerCase().includes(query))
      && (!selectedLote || animal.lotId === selectedLote)
      && (!selectedPotrero || animal.paddockId === selectedPotrero)
      && (!selectedSexo || animal.sex === selectedSexo)
      && (!selectedEstado || animal.status === selectedEstado);
  });

  return (
    <div className={styles.pageContainer}>
      {/* Encabezado de Página */}
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div>
          <div className={styles.kicker}>GANADO · ANIMALS</div>
          <h1 className={styles.pageTitle}>Directorio de animales</h1>
          <p className={styles.pageSubtitle}>
            Consulta y administra {animals.length.toLocaleString('es-CO')} animales de la finca seleccionada.
          </p>
        </div>

        {/* Botón Registrar Animal (Largo en desktop, botón cuadrado en móvil) */}
        <button
          type="button"
          className={`${styles.registerBtn} d-none d-sm-flex`}
          onClick={handleRegisterAnimal}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Registrar animal</span>
        </button>

        <button
          type="button"
          className={`${styles.registerBtn} ${styles.mobileSquareBtn} d-sm-none`}
          onClick={handleRegisterAnimal}
          aria-label="Registrar animal"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* 1. Métricas / Resumen */}
      <AnimalStats animals={animals} />

      {/* 2. Filtros y Búsqueda */}
      <AnimalFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedLote={selectedLote}
        onLoteChange={setSelectedLote}
        selectedPotrero={selectedPotrero}
        onPotreroChange={setSelectedPotrero}
        selectedSexo={selectedSexo}
        onSexoChange={setSelectedSexo}
        selectedEstado={selectedEstado}
        onEstadoChange={setSelectedEstado}
        lots={lots.map((lot) => ({ id: text(lot.id), name: text(lot.name) }))}
        paddocks={paddocks.map((paddock) => ({ id: text(paddock.id), name: text(paddock.name) }))}
      />

      {/* 3. Tabla / Lista de Tarjetas */}
      <AnimalTable
        animals={filteredAnimals}
        onSelectAnimal={handleSelectAnimal}
      />
      {isLoading && <p role="status">Cargando animales guardados en este dispositivo…</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
};

export default AnimalsDirectoryPage;