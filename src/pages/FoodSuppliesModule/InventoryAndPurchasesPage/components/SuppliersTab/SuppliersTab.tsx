import React, { useState } from 'react';
import styles from '../ProductsTab/ProductsTab.module.css';
import { Truck, Search, Plus, Pencil } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

interface SuppliersTabProps {
  onOpenSupplierModal: () => void;
  onEditSupplier: (supplier: Record<string, unknown>) => void;
}

export const SuppliersTab: React.FC<SuppliersTabProps> = ({
  onOpenSupplierModal,
  onEditSupplier,
}) => {
  const { scope } = useFarmScope();
  const [searchTerm, setSearchTerm] = useState('');
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'suppliers',
    '/suppliers',
    scope,
  );
  const filtered = records.filter((supplier) => {
    const term = searchTerm.toLowerCase();
    return String(supplier.name ?? '').toLowerCase().includes(term)
      || String(supplier.contact_name ?? '').toLowerCase().includes(term)
      || String(supplier.tax_id ?? '').toLowerCase().includes(term);
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div className={styles.kpiCardContainer}>
        <div className="row g-0 align-items-center">
          <div className="col-12 col-md-6 p-3 border-end">
            <span className={styles.kpiLabel}>PROVEEDORES REGISTRADOS</span>
            <div className={styles.kpiValue}>{records.length}</div>
            <span className={styles.kpiSubtext}>En la organización activa</span>
          </div>
          <div className="col-12 col-md-6 p-3">
            <span className={styles.kpiLabel}>RESULTADOS DEL FILTRO</span>
            <div className={styles.kpiValue}>{filtered.length}</div>
            <span className={styles.kpiSubtext}>Según la búsqueda actual</span>
          </div>
        </div>
        <div className={styles.btnRow}>
          <button type="button" className={styles.registerPurchaseBtn} onClick={onOpenSupplierModal}>
            <Plus size={16} /><span>Nuevo proveedor</span>
          </button>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar proveedor por nombre, contacto o RUC..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.cardBox}>
        {error && <p role="alert" className="text-danger">{error}</p>}
        <div className={styles.tableResponsiveContainer}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>PROVEEDOR</th>
                <th>CONTACTO</th>
                <th>RUC / IDENTIFICACIÓN</th>
                <th>TELÉFONO</th>
                <th>CORREO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier) => (
                <tr key={String(supplier.id)}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className={styles.avatarIcon}>
                        <Truck size={18} color="#1e4b27" />
                      </div>
                      <div>
                        <div className="fw-bold">{String(supplier.name ?? '')}</div>
                        <div className={styles.subText}>{String(supplier.address ?? 'Sin dirección')}</div>
                      </div>
                    </div>
                  </td>
                  <td>{String(supplier.contact_name ?? '—')}</td>
                  <td>{String(supplier.tax_id ?? '—')}</td>
                  <td>{String(supplier.phone ?? '—')}</td>
                  <td>{String(supplier.email ?? '—')}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      onClick={() => onEditSupplier(supplier)}
                    >
                      <Pencil size={14} />
                      <span className="ms-1">Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-secondary py-4">{error ?? 'No hay proveedores que coincidan con la búsqueda.'}</td></tr>
              )}
              {isLoading && <tr><td colSpan={6} role="status" className="text-center text-secondary py-4">Cargando proveedores…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationRow}>
          <span className={styles.paginationText}>Mostrando {filtered.length} proveedores locales</span>
        </div>
      </div>
    </div>
  );
};

export default SuppliersTab;
