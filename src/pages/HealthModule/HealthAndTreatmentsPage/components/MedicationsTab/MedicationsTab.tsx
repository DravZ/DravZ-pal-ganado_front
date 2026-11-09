import React, { useState } from 'react';
import styles from './MedicationsTab.module.css';
import { Search, Syringe, MoreHorizontal } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

export const MedicationsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const { scope } = useFarmScope();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'medications',
    '/medications',
    scope,
  );
  const medications = records.filter((medication) =>
    String(medication.status ?? 'active').toLowerCase() !== 'inactive',
  );

  const filtered = medications.filter((m) => {
    const matchesSearch =
      String(m.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      || String(m.active_ingredient ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      || String(m.category ?? '').toLowerCase().includes(searchTerm.toLowerCase());
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
          <span className={styles.countInfo}>
            {isLoading ? 'Cargando…' : `${filtered.length} medicamentos`}
          </span>
        </div>
      </div>

      {/* GRID DE MEDICATION CARDS */}
      <div className="row g-3">
        {filtered.map((med) => (
          <div key={String(med.id)} className="col-12 col-md-6 col-xl-3">
            <div className={styles.medCard}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className={styles.medIcon}>
                  <Syringe size={20} color="#1e4b27" />
                </div>
                <button type="button" className={styles.moreBtn}>
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <span className={styles.categoryLabel}>
                {String(med.category ?? med.active_ingredient ?? 'MEDICAMENTO').toLocaleUpperCase()}
              </span>
              <h3 className={styles.medName}>{String(med.name ?? '')}</h3>
              <p className={styles.presentationText}>
                {[med.presentation, med.concentration].filter(Boolean).join(' · ') || 'Sin presentación registrada'}
              </p>

              <hr className={styles.cardDivider} />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className={styles.viaLabel}>Vía</span>
                <span className={styles.viaValue}>{String(med.route ?? 'No especificada')}</span>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <div className={styles.withdrawalBox}>
                    <span className={styles.wLabel}>RETIRO CARNE</span>
                    <span className={styles.wDays}>{Number(med.withdrawal_days_meat ?? 0)} días</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className={styles.withdrawalBox}>
                    <span className={styles.wLabel}>RETIRO LECHE</span>
                    <span className={styles.wDays}>{Number(med.withdrawal_days_milk ?? 0)} días</span>
                  </div>
                  {error && <p role="alert" className="text-danger">{error}</p>}
                  {!isLoading && filtered.length === 0 && (
                    <p className="text-secondary">
                      {error ?? 'No hay medicamentos disponibles para los filtros seleccionados.'}
                    </p>
                  )}
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