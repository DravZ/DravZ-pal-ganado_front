import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, ChevronRight } from 'lucide-react';
import styles from './DataAndGenealogy.module.css';

interface DataAndGenealogyProps {
  animalId: string;
  animal: Record<string, unknown>;
  animals: Record<string, unknown>[];
}

export const DataAndGenealogy: React.FC<DataAndGenealogyProps> = ({ animalId, animal, animals }) => {
  const navigate = useNavigate();
  const tag = String(animal.identifier_tag ?? animal.tag_number ?? animalId);
  const name = String(animal.name ?? 'Sin nombre');
  const fatherId = String(animal.sire_id ?? '');
  const motherId = String(animal.dam_id ?? '');
  const father = animals.find((item) => item.id === fatherId);
  const mother = animals.find((item) => item.id === motherId);
  const offspring = animals.filter((item) => item.dam_id === animalId || item.sire_id === animalId);
  const display = (value: unknown, fallback = 'No registrado') =>
    value === null || value === undefined || value === '' ? fallback : String(value);

  // Navegación para editar el animal
  const handleEditAnimal = () => {
    console.log(`[Router Log]: Redirigiendo a edición del animal ${animalId}`);
    navigate(`/hato/animales/${animalId}/editar`);
  };

  // Navegación hacia la ficha de un pariente o cría
  const handleNavigateToAnimal = (targetId: string) => {
    console.log(`[Router Log]: Navegando a la ficha del pariente/cría ${targetId}`);
    navigate(`/hato/animales/${targetId}`);
  };

  return (
    <div className={`row g-3 ${styles.tabContent}`}>
      {/* Columna Izquierda: Datos Generales e Identificadores */}
      <div className="col-12 col-lg-5">
        <div className={`${styles.card} mb-3`}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className={styles.kicker}>FICHA DEL ANIMAL</div>
              <h2 className={styles.title}>Datos generales</h2>
            </div>
            <button
              type="button"
              className={styles.editBtn}
              onClick={handleEditAnimal}
            >
              Editar datos
            </button>
          </div>

          <table className={styles.dataTable}>
            <tbody>
              <tr>
                <td>
                  <span className={styles.fieldLabel}>Nombre</span>
                  <span className={styles.fieldVal}>{display(animal.name)}</span>
                </td>
                <td>
                  <span className={styles.fieldLabel}>Especie</span>
                  <span className={styles.fieldVal}>{display(animal.species)}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className={styles.fieldLabel}>Sexo</span>
                  <span className={styles.fieldVal}>{display(animal.gender ?? animal.sex)}</span>
                </td>
                <td>
                  <span className={styles.fieldLabel}>Raza</span>
                  <span className={styles.fieldVal}>{display(animal.breed)}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className={styles.fieldLabel}>Fecha de nacimiento</span>
                  <span className={styles.fieldVal}>{display(animal.birth_date)}</span>
                </td>
                <td>
                  <span className={styles.fieldLabel}>Peso al nacer</span>
                  <span className={styles.fieldVal}>
                    {animal.weight_at_birth ?? animal.birth_weight
                      ? `${display(animal.weight_at_birth ?? animal.birth_weight)} kg`
                      : 'No registrado'}
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className={styles.fieldLabel}>Lote actual</span>
                  <span className={styles.fieldVal}>{display(animal.lot_name)}</span>
                </td>
                <td>
                  <span className={styles.fieldLabel}>Potrero actual</span>
                  <span className={styles.fieldVal}>{display(animal.paddock_name)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bloque Identificadores */}
        <div className={styles.card}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span className={styles.kicker}>IDENTIFICADORES</span>
            <span className={styles.badgePill}>{animal.identifier_tag ? '1 activo' : '0 activos'}</span>
          </div>

          <div className="d-flex flex-column gap-2">
            {animal.identifier_tag
              ? <div className="d-flex align-items-center justify-content-between py-1">
                <span className={styles.fieldVal}>{String(animal.identifier_tag)}</span>
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Identificador actual</span>
              </div>
              : <span className="text-secondary">No hay identificadores disponibles.</span>}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Genealogía y Descendencia */}
      <div className="col-12 col-lg-7">
        <div className={styles.card}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className={styles.kicker}>GENEALOGÍA</div>
              <h2 className={styles.title}>Árbol familiar</h2>
            </div>
            <span className="badge bg-light text-dark font-weight-bold p-2" style={{ borderRadius: '20px' }}>
              Genealogía disponible
            </span>
          </div>

          {/* Diagrama del Árbol */}
          <div className={styles.treeBox}>
            <div className={styles.centerAnimalNode}>
              <div className={styles.nodeAvatar}>
                <Beef size={22} />
              </div>
              <div className={styles.fieldVal} style={{ marginTop: '0.35rem' }}>
                {tag}
              </div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                {name}
              </div>
            </div>

            <div className="row g-3">
              {/* Padre */}
              <div className="col-12 col-md-6">
                <div className={styles.kicker} style={{ marginBottom: '0.35rem' }}>
                  PADRE · SIRE_ID
                </div>
                {fatherId ? (
                  <button
                    type="button"
                    className={styles.parentCard}
                    onClick={() => handleNavigateToAnimal(fatherId)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className={`${styles.genderCircle} ${styles.maleCircle}`}>♂</span>
                      <div>
                        <div className={styles.fieldVal}>
                          {display(father?.identifier_tag ?? father?.tag_number, fatherId)}
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {display(father?.name)} · {display(father?.breed)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-secondary" />
                  </button>
                ) : <div className={styles.parentCard}>Sin padre registrado</div>}
              </div>

              {/* Madre */}
              <div className="col-12 col-md-6">
                <div className={styles.kicker} style={{ marginBottom: '0.35rem' }}>
                  MADRE · DAM_ID
                </div>
                {motherId ? (
                  <button
                    type="button"
                    className={styles.parentCard}
                    onClick={() => handleNavigateToAnimal(motherId)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className={`${styles.genderCircle} ${styles.femaleCircle}`}>♀</span>
                      <div>
                        <div className={styles.fieldVal}>
                          {display(mother?.identifier_tag ?? mother?.tag_number, motherId)}
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {display(mother?.name)} · {display(mother?.breed)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-secondary" />
                  </button>
                ) : <div className={styles.parentCard}>Sin madre registrada</div>}
              </div>
            </div>
          </div>

          {/* Descendencia con navegación */}
          <div className="mt-4">
            <div className={styles.kicker}>DESCENDENCIA</div>
            <div className={styles.title} style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              {offspring.length} crías registradas
            </div>

            <div className="row g-2">
              {offspring.map((child) => (
                <div className="col-12 col-md-6" key={String(child.id)}>
                  <button
                    type="button"
                    className={styles.offspringCard}
                    onClick={() => handleNavigateToAnimal(String(child.id))}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className={`${styles.genderCircle} ${
                        ['Hembra', 'hembra'].includes(String(child.gender ?? child.sex))
                          ? styles.femaleCircle
                          : styles.maleCircle
                      }`}>
                        {['Hembra', 'hembra'].includes(String(child.gender ?? child.sex)) ? '♀' : '♂'}
                      </span>
                      <div>
                        <div className={styles.fieldVal}>
                          {display(child.identifier_tag ?? child.tag_number, String(child.id))}
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {display(child.name)} · {display(child.breed)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-secondary" />
                  </button>
                </div>
              ))}
              {offspring.length === 0 && (
                <div className="col-12 text-secondary">No hay descendencia registrada.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};