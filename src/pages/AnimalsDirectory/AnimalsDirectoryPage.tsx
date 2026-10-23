import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AnimalStats } from './components/AnimalStats/AnimalStats';
import { AnimalFilters } from './components/AnimalFilters/AnimalFilters';
import { AnimalTable, type AnimalItem } from './components/AnimalTable/AnimalTable';
import styles from './AnimalsDirectoryPage.module.css';

// Datos estáticos
const MOCK_ANIMALS: AnimalItem[] = [
  {
    id: '1',
    tag: 'BR-1042',
    name: 'Esperanza',
    breed: 'Nelore',
    sex: 'Hembra',
    weight: 482,
    date: '12 jun 2025',
    lote: 'Vacas de cría',
    potrero: 'Potrero Norte',
    status: 'Activo',
  },
  {
    id: '2',
    tag: 'BR-1088',
    name: 'Magnate',
    breed: 'Angus',
    sex: 'Macho',
    weight: 536,
    date: '12 jun 2025',
    lote: 'Ceba final',
    potrero: 'La Quebrada',
    status: 'Tratamiento',
  },
  {
    id: '3',
    tag: 'BR-1124',
    name: 'Canela',
    breed: 'Braford',
    sex: 'Hembra',
    weight: 418,
    date: '12 jun 2025',
    lote: 'Hembras reemplazo',
    potrero: 'Loma Alta',
    status: 'Activo',
  },
  {
    id: '4',
    tag: 'BR-1131',
    name: 'Trueno',
    breed: 'Nelore',
    sex: 'Macho',
    weight: 391,
    date: '12 jun 2025',
    lote: 'Novillos levante',
    potrero: 'Potrero Norte',
    status: 'Activo',
  },
];

export const AnimalsDirectoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLote, setSelectedLote] = useState('');
  const [selectedPotrero, setSelectedPotrero] = useState('');
  const [selectedSexo, setSelectedSexo] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  const handleRegisterAnimal = () => {
    console.log('[Router Log]: Navegando a registro de animal');
    navigate('/hato/nuevo');
  };

  const handleSelectAnimal = (id: string) => {
    console.log(`[Router Log]: Ver detalle del animal -> ${id}`);
    navigate(`/hato/animales/${id}`);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Encabezado de Página */}
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div>
          <div className={styles.kicker}>GANADO · ANIMALS</div>
          <h1 className={styles.pageTitle}>Directorio de animales</h1>
          <p className={styles.pageSubtitle}>
            Consulta, filtra y administra 1,284 animales registrados.
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
      <AnimalStats />

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
      />

      {/* 3. Tabla / Lista de Tarjetas */}
      <AnimalTable
        animals={MOCK_ANIMALS}
        onSelectAnimal={handleSelectAnimal}
      />
    </div>
  );
};

export default AnimalsDirectoryPage;