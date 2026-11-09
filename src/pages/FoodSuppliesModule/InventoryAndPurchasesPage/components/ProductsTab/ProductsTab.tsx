import React, { useState } from 'react';
import styles from './ProductsTab.module.css';
import { Package, Syringe, Search, Plus, ArrowUpDown } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

interface ProductsTabProps {
  onOpenProductModal: () => void;
  onOpenPurchaseModal: () => void;
}

const numberValue = (value: unknown) => Number(value ?? 0) || 0;
const money = (value: number) => value.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

export const ProductsTab: React.FC<ProductsTabProps> = ({
  onOpenPurchaseModal,
}) => {
  const { scope } = useFarmScope();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'products',
    '/products',
    scope,
  );
  const activeProducts = records.filter((product) =>
    String(product.status ?? 'active').toLowerCase() !== 'inactive',
  );
  const isLowStock = (product: Record<string, unknown>) => numberValue(product.minimum_stock) > 0
    && numberValue(product.current_stock) <= numberValue(product.minimum_stock);
  const lowStockProducts = activeProducts.filter(isLowStock);
  const inventoryValue = activeProducts.reduce((sum, product) =>
    sum + numberValue(product.current_stock) * numberValue(product.average_cost), 0);
  const categories = new Set(activeProducts.map((product) => String(product.category ?? '')).filter(Boolean));
  const filtered = activeProducts.filter((product) => {
    const category = String(product.category ?? '');
    const stockStatus = isLowStock(product)
      ? 'Bajo mínimo'
      : 'Disponible';
    const matchesText = String(product.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      || String(product.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesText
      && (selectedCategory === 'ALL' || category === selectedCategory)
      && (selectedStatus === 'ALL' || stockStatus === selectedStatus);
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div className={styles.kpiCardContainer}>
        <div className="row g-0 align-items-center">
          <div className="col-12 col-md-4 p-3 border-end">
            <span className={styles.kpiLabel}>VALOR DEL INVENTARIO</span>
            <div className={styles.kpiValue}>{money(inventoryValue)}</div>
            <span className={styles.kpiSubtext}>Calculado desde existencias locales</span>
          </div>
          <div className="col-12 col-md-4 p-3 border-end">
            <span className={styles.kpiLabel}>PRODUCTOS ACTIVOS</span>
            <div className={styles.kpiValue}>{activeProducts.length}</div>
            <span className={styles.kpiSubtext}>{categories.size} categorías</span>
          </div>
          <div className="col-12 col-md-4 p-3">
            <span className={styles.kpiLabel}>BAJO MÍNIMO</span>
            <div className={`${styles.kpiValue} text-danger`}>{lowStockProducts.length}</div>
            <span className={styles.kpiSubtext}>Requieren reposición</span>
          </div>
        </div>
        <div className={styles.btnRow}>
          <button type="button" className={styles.registerPurchaseBtn} onClick={onOpenPurchaseModal}>
            <Plus size={16} /><span>Registrar compra</span>
          </button>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar producto o SKU..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-3 col-lg-3">
          <select className={styles.filterSelect} value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="ALL">Todas las categorías</option>
            {[...categories].sort().map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-3 col-lg-4">
          <select className={styles.filterSelect} value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
            <option value="ALL">Todos los estados</option>
            <option value="Bajo mínimo">Bajo mínimo</option>
            <option value="Disponible">Disponible</option>
          </select>
        </div>
      </div>

      <div className={styles.cardBox}>
        {error && <p role="alert" className="text-danger">{error}</p>}
        <div className={styles.tableResponsiveContainer}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th><div className="d-flex align-items-center gap-1">PRODUCTO <ArrowUpDown size={14} /></div></th>
                <th><div className="d-flex align-items-center gap-1">CATEGORÍA <ArrowUpDown size={14} /></div></th>
                <th><div className="d-flex align-items-center gap-1">STOCK ACTUAL <ArrowUpDown size={14} /></div></th>
                <th><div className="d-flex align-items-center gap-1">STOCK MÍNIMO <ArrowUpDown size={14} /></div></th>
                <th><div className="d-flex align-items-center gap-1">COSTO PROMEDIO <ArrowUpDown size={14} /></div></th>
                <th><div className="d-flex align-items-center gap-1">ESTADO <ArrowUpDown size={14} /></div></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const stock = numberValue(product.current_stock);
                const minimum = numberValue(product.minimum_stock);
                const isLow = isLowStock(product);
                return (
                  <tr key={String(product.id)}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={styles.avatarIcon}>
                          {String(product.category ?? '').toLowerCase().includes('sanidad')
                            ? <Syringe size={18} color="#1e4b27" />
                            : <Package size={18} color="#1e4b27" />}
                        </div>
                        <div>
                          <div className="fw-bold">{String(product.name ?? '')}</div>
                          <div className={styles.subText}>{String(product.sku ?? 'Sin SKU')} · {String(product.product_type ?? 'Sin tipo')}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.categoryBadge}>{String(product.category ?? 'Sin categoría')}</span></td>
                    <td>
                      <div className="fw-bold">{stock} {String(product.unit ?? '')}</div>
                      <div className={styles.stockBarContainer}>
                        <div
                          className={`${styles.stockBarFill} ${isLow ? styles.barLow : styles.barOk}`}
                          style={{ width: `${Math.min(stock / (minimum * 1.5 || 1) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td>{minimum} {String(product.unit ?? '')}</td>
                    <td className="fw-bold">{money(numberValue(product.average_cost))}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${isLow ? styles.badgeLow : styles.badgeOk}`}>
                        {isLow ? 'Bajo mínimo' : 'Disponible'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-secondary py-4">{error ?? 'No hay productos que coincidan con los filtros.'}</td></tr>
              )}
              {isLoading && <tr><td colSpan={6} role="status" className="text-center text-secondary py-4">Cargando productos…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationRow}>
          <span className={styles.paginationText}>Mostrando {filtered.length} productos locales</span>
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
