import React, { useState } from 'react';
import styles from '../../../../FoodSuppliesModule/InventoryAndPurchasesPage/components/ProductsTab/ProductsTab.module.css';
import { Users, Search, Plus, Pencil } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

interface CustomersTabProps {
  onOpenCustomerModal: () => void;
  onEditCustomer: (customer: Record<string, unknown>) => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  onOpenCustomerModal,
  onEditCustomer,
}) => {
  const { scope } = useFarmScope();
  const [searchTerm, setSearchTerm] = useState('');
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'customers',
    '/customers',
    scope,
  );
  const filtered = records.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return String(customer.name ?? '').toLowerCase().includes(term)
      || String(customer.tax_id ?? '').toLowerCase().includes(term)
      || String(customer.email ?? '').toLowerCase().includes(term);
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div className={styles.kpiCardContainer}>
        <div className="row g-0 align-items-center">
          <div className="col-12 col-md-6 p-3 border-end">
            <span className={styles.kpiLabel}>CLIENTES REGISTRADOS</span>
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
          <button type="button" className={styles.registerPurchaseBtn} onClick={onOpenCustomerModal}>
            <Plus size={16} /><span>Nuevo cliente</span>
          </button>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar cliente por nombre, identificación o correo..."
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
                <th>CLIENTE</th>
                <th>RUC / IDENTIFICACIÓN</th>
                <th>TELÉFONO</th>
                <th>CORREO</th>
                <th>DIRECCIÓN</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={String(customer.id)}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className={styles.avatarIcon}>
                        <Users size={18} color="#1e4b27" />
                      </div>
                      <div className="fw-bold">{String(customer.name ?? '')}</div>
                    </div>
                  </td>
                  <td>{String(customer.tax_id ?? '—')}</td>
                  <td>{String(customer.phone ?? '—')}</td>
                  <td>{String(customer.email ?? '—')}</td>
                  <td>{String(customer.address ?? '—')}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      onClick={() => onEditCustomer(customer)}
                    >
                      <Pencil size={14} />
                      <span className="ms-1">Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-secondary py-4">{error ?? 'No hay clientes que coincidan con la búsqueda.'}</td></tr>
              )}
              {isLoading && <tr><td colSpan={6} role="status" className="text-center text-secondary py-4">Cargando clientes…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationRow}>
          <span className={styles.paginationText}>Mostrando {filtered.length} clientes locales</span>
        </div>
      </div>
    </div>
  );
};

export default CustomersTab;
