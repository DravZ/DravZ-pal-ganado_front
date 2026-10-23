import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, ChevronRight } from 'lucide-react';
import styles from './DataAndGenealogy.module.css';

interface DataAndGenealogyProps {
  animalId: string;
}

export const DataAndGenealogy: React.FC<DataAndGenealogyProps> = ({ animalId }) => {
  const navigate = useNavigate();

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
                  <span className={styles.fieldVal}>Esperanza</span>
                </td>
                <td>
                  <span className={styles.fieldLabel}>Especie</span>
                  <span className={styles.fieldVal}>Bovino</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className={styles.fieldLabel}>Sexo</span>
                  <span className={styles.fieldVal}>Hembra</span>
                </td>
                <td>
                  <span className={styles.fieldLabel}>Raza</span>
                  <span className={styles.fieldVal}>Nelore</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className={styles.fieldLabel}>Fecha de nacimiento</span>
                  <span className={styles.fieldVal}>18 ago 2022</span>
                </td>
                <td>
                  <span className={styles.fieldLabel}>Peso al nacer</span>
                  <span className={styles.fieldVal}>34 kg</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className={styles.fieldLabel}>Lote actual</span>
                  <span className={styles.fieldVal}>Vacas de cría</span>
                </td>
                <td>
                  <span className={styles.fieldLabel}>Potrero actual</span>
                  <span className={styles.fieldVal}>Potrero Norte</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bloque Identificadores */}
        <div className={styles.card}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span className={styles.kicker}>IDENTIFICADORES</span>
            <span className={styles.badgePill}>2 activos</span>
          </div>

          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
              <span className={styles.fieldVal}>BR-1042</span>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Siniga · Oficial
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-between py-1">
              <span className={styles.fieldVal}>MC-991-84201</span>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Microchip · Actual
              </span>
            </div>
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
              3 generaciones
            </span>
          </div>

          {/* Diagrama del Árbol */}
          <div className={styles.treeBox}>
            <div className={styles.centerAnimalNode}>
              <div className={styles.nodeAvatar}>
                <Beef size={22} />
              </div>
              <div className={styles.fieldVal} style={{ marginTop: '0.35rem' }}>
                BR-1042
              </div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                Esperanza
              </div>
            </div>

            <div className="row g-3">
              {/* Padre */}
              <div className="col-12 col-md-6">
                <div className={styles.kicker} style={{ marginBottom: '0.35rem' }}>
                  PADRE · SIRE_ID
                </div>
                <button
                  type="button"
                  className={styles.parentCard}
                  onClick={() => handleNavigateToAnimal('BR-0721')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className={`${styles.genderCircle} ${styles.maleCircle}`}>♂</span>
                    <div>
                      <div className={styles.fieldVal}>BR-0721</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        Imperador · Nelore
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-secondary" />
                </button>

                <div className={styles.grandparentsRow}>
                  <div className={styles.grandparentCell}>
                    <div className={styles.fieldVal}>BR-0318</div>
                    <div className="text-secondary">Abuelo paterno</div>
                  </div>
                  <div className={styles.grandparentCell}>
                    <div className={styles.fieldVal}>BR-0440</div>
                    <div className="text-secondary">Abuela paterna</div>
                  </div>
                </div>
              </div>

              {/* Madre */}
              <div className="col-12 col-md-6">
                <div className={styles.kicker} style={{ marginBottom: '0.35rem' }}>
                  MADRE · DAM_ID
                </div>
                <button
                  type="button"
                  className={styles.parentCard}
                  onClick={() => handleNavigateToAnimal('BR-0546')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className={`${styles.genderCircle} ${styles.femaleCircle}`}>♀</span>
                    <div>
                      <div className={styles.fieldVal}>BR-0546</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        Estrella · Nelore
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-secondary" />
                </button>

                <div className={styles.grandparentsRow}>
                  <div className={styles.grandparentCell}>
                    <div className={styles.fieldVal}>BR-0229</div>
                    <div className="text-secondary">Abuelo materno</div>
                  </div>
                  <div className={styles.grandparentCell}>
                    <div className={styles.fieldVal}>BR-0381</div>
                    <div className="text-secondary">Abuela materna</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descendencia con navegación */}
          <div className="mt-4">
            <div className={styles.kicker}>DESCENDENCIA</div>
            <div className={styles.title} style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              2 crías registradas
            </div>

            <div className="row g-2">
              <div className="col-12 col-md-6">
                <button
                  type="button"
                  className={styles.offspringCard}
                  onClick={() => handleNavigateToAnimal('BR-1288')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className={`${styles.genderCircle} ${styles.femaleCircle}`}>♀</span>
                    <div>
                      <div className={styles.fieldVal}>BR-1288</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        Lucero · 8 meses
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-secondary" />
                </button>
              </div>

              <div className="col-12 col-md-6">
                <button
                  type="button"
                  className={styles.offspringCard}
                  onClick={() => handleNavigateToAnimal('BR-1310')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className={`${styles.genderCircle} ${styles.maleCircle}`}>♂</span>
                    <div>
                      <div className={styles.fieldVal}>BR-1310</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        Bravo · 5 meses
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-secondary" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};