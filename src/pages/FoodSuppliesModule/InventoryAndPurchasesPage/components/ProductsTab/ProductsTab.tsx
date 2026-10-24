import React, { useState } from 'react';
import styles from './ProductsTab.module.css';
import { Package, Syringe, Search, Plus, ArrowUpDown } from 'lucide-react';
import type { Product } from '../../../../../types/database.types';

interface ProductsTabProps {
  onOpenProductModal: () => void;
  onOpenPurchaseModal: () => void;
}

type ProductUI = Product & {
  formatted_avg_cost: string;
  stock_status: 'Bajo mínimo' | 'Disponible';
};

const MOCK_PRODUCTS: ProductUI[] = [
  {
    id: 'p-1',
    organization_id: 'org-1',
    name: 'Sal mineralizada 8%',
    sku: 'NUT-008',
    category: 'Nutrición',
    product_type: 'Suplemento',
    unit: 'bultos',
    current_stock: 18,
    minimum_stock: 25,
    reorder_point: 30,
    average_cost: 74200,
    status: 'active',
    formatted_avg_cost: '$74.200',
    stock_status: 'Bajo mínimo'
  },
  {
    id: 'p-2',
    organization_id: 'org-1',
    name: 'Ivermectina 1%',
    sku: 'MED-009',
    category: 'Sanidad',
    product_type: 'Medicamento',
    unit: 'dosis',
    current_stock: 42,
    minimum_stock: 20,
    reorder_point: 25,
    average_cost: 8900,
    status: 'active',
    formatted_avg_cost: '$8.900',
    stock_status: 'Disponible'
  },
  {
    id: 'p-3',
    organization_id: 'org-1',
    name: 'Maíz ensilado',
    sku: 'ALI-114',
    category: 'Alimentación',
    product_type: 'Forraje',
    unit: 'ton',
    current_stock: 12.4,
    minimum_stock: 8,
    reorder_point: 10,
    average_cost: 318000,
    status: 'active',
    formatted_avg_cost: '$318.000',
    stock_status: 'Disponible'
  },
  {
    id: 'p-4',
    organization_id: 'org-1',
    name: 'Vacuna Clostridial',
    sku: 'VAC-021',
    category: 'Sanidad',
    product_type: 'Vacuna',
    unit: 'dosis',
    current_stock: 8,
    minimum_stock: 15,
    reorder_point: 20,
    average_cost: 12500,
    status: 'active',
    formatted_avg_cost: '$12.500',
    stock_status: 'Bajo mínimo'
  }
];

export const ProductsTab: React.FC<ProductsTabProps> = ({
  onOpenPurchaseModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  return (
    <div className="d-flex flex-column gap-4">
      {/* TARJETAS KPI DE RESUMEN */}
      <div className={styles.kpiCardContainer}>
        <div className="row g-0 align-items-center">
          <div className="col-12 col-md-4 p-3 border-end">
            <span className={styles.kpiLabel}>VALOR DEL INVENTARIO</span>
            <div className={styles.kpiValue}>$18.4 M</div>
            <span className={styles.kpiSubtext}>Actualizado hoy</span>
          </div>

          <div className="col-12 col-md-4 p-3 border-end">
            <span className={styles.kpiLabel}>PRODUCTOS ACTIVOS</span>
            <div className={styles.kpiValue}>48</div>
            <span className={styles.kpiSubtext}>5 categorías</span>
          </div>

          <div className="col-12 col-md-4 p-3">
            <span className={styles.kpiLabel}>BAJO MÍNIMO</span>
            <div className={`${styles.kpiValue} text-danger`}>4</div>
            <span className={styles.kpiSubtext}>Requieren reposición</span>
          </div>
        </div>

        {/* FILA INFERIOR PARA EL BOTÓN */}
        <div className={styles.btnRow}>
          <button
            type="button"
            className={styles.registerPurchaseBtn}
            onClick={onOpenPurchaseModal}
          >
            <Plus size={16} />
            <span>Registrar compra</span>
          </button>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar producto o SKU..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-12 col-md-3 col-lg-3">
          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">Todas las categorías</option>
            <option value="Nutrición">Nutrición</option>
            <option value="Sanidad">Sanidad</option>
            <option value="Alimentación">Alimentación</option>
          </select>
        </div>

        <div className="col-12 col-md-3 col-lg-4">
          <select
            className={styles.filterSelect}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Todos los estados</option>
            <option value="Bajo mínimo">Bajo mínimo</option>
            <option value="Disponible">Disponible</option>
          </select>
        </div>
      </div>

      {/* TABLA / TARJETAS RESPONSIVAS */}
      <div className={styles.cardBox}>
        <div className={styles.tableResponsiveContainer}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    PRODUCTO <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    CATEGORÍA <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    STOCK ACTUAL <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    STOCK MÍNIMO <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    COSTO PROMEDIO <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>
                  <div className="d-flex align-items-center gap-1">
                    ESTADO <ArrowUpDown size={14} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PRODUCTS.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className={styles.avatarIcon}>
                        {prod.category === 'Sanidad' ? (
                          <Syringe size={18} color="#1e4b27" />
                        ) : (
                          <Package size={18} color="#1e4b27" />
                        )}
                      </div>
                      <div>
                        <div className="fw-bold">{prod.name}</div>
                        <div className={styles.subText}>
                          {prod.sku} · {prod.product_type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>{prod.category}</span>
                  </td>
                  <td>
                    <div className="fw-bold">
                      {prod.current_stock} {prod.unit}
                    </div>
                    <div className={styles.stockBarContainer}>
                      <div
                        className={`${styles.stockBarFill} ${
                          prod.stock_status === 'Bajo mínimo'
                            ? styles.barLow
                            : styles.barOk
                        }`}
                        style={{
                          width: `${Math.min(
                            (prod.current_stock / ((prod.minimum_stock ?? 0) * 1.5 || 1)) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    {prod.minimum_stock} {prod.unit}
                  </td>
                  <td className="fw-bold">{prod.formatted_avg_cost}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        prod.stock_status === 'Bajo mínimo'
                          ? styles.badgeLow
                          : styles.badgeOk
                      }`}
                    >
                      {prod.stock_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINADOR */}
        <div className={styles.paginationRow}>
          <span className={styles.paginationText}>Mostrando 1–4 de 48 productos</span>
          <div className={styles.paginationBtns}>
            <button type="button" className={styles.pageBtnDisabled} disabled>
              Anterior
            </button>
            <button type="button" className={styles.pageBtnActive}>
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
    </div>
  );
};

export default ProductsTab;