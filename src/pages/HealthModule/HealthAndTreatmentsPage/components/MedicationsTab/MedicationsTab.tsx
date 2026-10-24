import React, { useState } from 'react';
import styles from './MedicationsTab.module.css';
import { Search, Syringe, MoreHorizontal } from 'lucide-react';
import type { Medication } from '../../../../../types/database.types';

type MedicationWithUI = Medication & {
  category_name: string;
  presentation_detail: string;
  withdrawal_meat_days: number;
  withdrawal_milk_days: number;
};

const MOCK_MEDICATIONS: MedicationWithUI[] = [
  {
    id: 'm1',
    name: 'Ivermectina 1%',
    category_name: 'IVERMECTINA',
    presentation_detail: 'Frasco 500 mL · 10 mg/mL',
    route: 'Subcutánea',
    withdrawal_meat_days: 35,
    withdrawal_milk_days: 28,
    status: 'active'
  },
  {
    id: 'm2',
    name: 'Oxitetraciclina LA',
    category_name: 'OXITETRACICLINA',
    presentation_detail: 'Frasco 250 mL · 200 mg/mL',
    route: 'Intramuscular',
    withdrawal_meat_days: 28,
    withdrawal_milk_days: 7,
    status: 'active'
  },
  {
    id: 'm3',
    name: 'Flunixin 5%',
    category_name: 'FLUNIXIN MEGLUMINE',
    presentation_detail: 'Frasco 100 mL · 50 mg/mL',
    route: 'Intravenosa',
    withdrawal_meat_days: 4,
    withdrawal_milk_days: 2,
    status: 'active'
  },
  {
    id: 'm4',
    name: 'Albendazol 10%',
    category_name: 'ALBENDAZOL',
    presentation_detail: 'Bidón 1 L · 100 mg/mL',
    route: 'Oral',
    withdrawal_meat_days: 14,
    withdrawal_milk_days: 4,
    status: 'active'
  }
];

export const MedicationsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('ALL');

  const filtered = MOCK_MEDICATIONS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoute = routeFilter === 'ALL' || m.route === routeFilter;
    return matchesSearch && matchesRoute;
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* BARRA DE BÚSQUEDA Y FILTRO */}
      <div className={styles.filterRow}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre o principio activo..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className={styles.routeSelect}
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
          >
            <option value="ALL">Todas las vías</option>
            <option value="Subcutánea">Subcutánea</option>
            <option value="Intramuscular">Intramuscular</option>
            <option value="Intravenosa">Intravenosa</option>
            <option value="Oral">Oral</option>
          </select>
          <span className={styles.countInfo}>{filtered.length} medicamentos</span>
        </div>
      </div>

      {/* GRID DE MEDICATION CARDS */}
      <div className="row g-3">
        {filtered.map((med) => (
          <div key={med.id} className="col-12 col-md-6 col-xl-3">
            <div className={styles.medCard}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className={styles.medIcon}>
                  <Syringe size={20} color="#1e4b27" />
                </div>
                <button type="button" className={styles.moreBtn}>
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <span className={styles.categoryLabel}>{med.category_name}</span>
              <h3 className={styles.medName}>{med.name}</h3>
              <p className={styles.presentationText}>{med.presentation_detail}</p>

              <hr className={styles.cardDivider} />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className={styles.viaLabel}>Vía</span>
                <span className={styles.viaValue}>{med.route}</span>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <div className={styles.withdrawalBox}>
                    <span className={styles.wLabel}>RETIRO CARNE</span>
                    <span className={styles.wDays}>{med.withdrawal_meat_days} días</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className={styles.withdrawalBox}>
                    <span className={styles.wLabel}>RETIRO LECHE</span>
                    <span className={styles.wDays}>{med.withdrawal_milk_days} días</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationsTab;