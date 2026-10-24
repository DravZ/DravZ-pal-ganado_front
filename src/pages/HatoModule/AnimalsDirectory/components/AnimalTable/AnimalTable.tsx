import React from 'react';
import { Beef, ChevronRight, ArrowUpDown } from 'lucide-react';
import styles from './AnimalTable.module.css';

export interface AnimalItem {
  id: string;
  tag: string;
  name: string;
  breed: string;
  sex: 'Hembra' | 'Macho';
  weight: number;
  date: string;
  lote: string;
  potrero: string;
  status: 'Activo' | 'Tratamiento';
}

interface AnimalTableProps {
  animals: AnimalItem[];
  onSelectAnimal: (id: string) => void;
}

export const AnimalTable: React.FC<AnimalTableProps> = ({ animals, onSelectAnimal }) => {
  return (
    <div className={styles.cardContainer}>
      {/* 1. Vista para Desktop y Tablet */}
      <div className={`d-none d-md-block ${styles.tableResponsive}`}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>
                <div className="d-flex align-items-center gap-1">
                  <span>IDENTIFICACIÓN / NOMBRE</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center gap-1">
                  <span>SEXO</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center gap-1">
                  <span>PESO ACTUAL</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center gap-1">
                  <span>LOTE / POTRERO</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center gap-1">
                  <span>ESTADO</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {animals.map((item) => (
              <tr
                key={item.id}
                className={styles.tableRow}
                onClick={() => onSelectAnimal(item.id)}
              >
                <td>
                  <div className={styles.identityGroup}>
                    <div className={styles.iconBadge}>
                      <Beef size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className={styles.tagId}>{item.tag}</div>
                      <div className={styles.subDetails}>
                        {item.name} · {item.breed}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.genderGroup}>
                    <span
                      className={`${styles.genderBadge} ${
                        item.sex === 'Hembra' ? styles.genderF : styles.genderM
                      }`}
                    >
                      {item.sex === 'Hembra' ? 'F' : 'M'}
                    </span>
                    <span className={styles.genderText}>{item.sex}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.weightMain}>{item.weight} kg</div>
                  <div className={styles.subDetails}>{item.date}</div>
                </td>
                <td>
                  <div className={styles.tagId}>{item.lote}</div>
                  <div className={styles.subDetails}>{item.potrero}</div>
                </td>
                <td>
                  <span
                    className={`${styles.statusPill} ${
                      item.status === 'Activo'
                        ? styles.statusActive
                        : styles.statusTreatment
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="text-end">
                  <ChevronRight size={18} className="text-secondary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Vista en Tarjetas para Móviles */}
      <div className={`d-md-none ${styles.mobileCardsWrapper}`}>
        {animals.map((item) => (
          <div
            key={item.id}
            className={styles.mobileCardItem}
            onClick={() => onSelectAnimal(item.id)}
          >
            <div className={styles.identityGroup}>
              <div className={styles.iconBadge}>
                <Beef size={20} strokeWidth={2.2} />
              </div>
              <div>
                <div className={styles.tagId}>{item.tag}</div>
                <div className={styles.subDetails}>
                  {item.name} · {item.breed}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className={styles.mobileRightInfo}>
                <div className={styles.mobileWeightLabel}>WEIGHT</div>
                <div className={styles.weightMain}>{item.weight} kg</div>
                <div className={styles.subDetails}>{item.date}</div>
              </div>
              <ChevronRight size={18} className="text-secondary ms-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Pie de Paginación */}
      <div className={styles.tableFooter}>
        <span className={styles.counterText + ' d-none d-md-block'}>Mostrando 1–4 de 1,284 animales</span>
        <div className={styles.paginationControls}>
          <button type="button" className={styles.pageBtn} disabled>
            Anterior
          </button>
          <button
            type="button"
            className={`${styles.pageBtn} ${styles.pageBtnActive}`}
          >
            1
          </button>
          <button type="button" className={styles.pageBtn}>
            2
          </button>
          <button type="button" className={styles.pageBtn}>
            3
          </button>
          <button type="button" className={styles.pageBtn}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};