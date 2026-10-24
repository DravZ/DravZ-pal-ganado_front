import React, { useState } from 'react';
import styles from './CreateProductModal.module.css';
import { X, WifiOff } from 'lucide-react';
import type { Product, SyncQueueEntry } from '../../../../../types/database.types';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('CAT-001');
  const [category, setCategory] = useState('Sanidad');
  const [productType, setProductType] = useState('Ej. Medicamento');
  const [unit, setUnit] = useState('unidad');
  const [currentStock, setCurrentStock] = useState('0');
  const [minimumStock, setMinimumStock] = useState('0');
  const [reorderPoint, setReorderPoint] = useState('0');
  const [averageCost, setAverageCost] = useState('0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productId = crypto.randomUUID();

    const productPayload: Product = {
      id: productId,
      organization_id: 'org-1',
      name,
      sku,
      category,
      product_type: productType,
      unit,
      current_stock: parseFloat(currentStock) || 0,
      minimum_stock: parseFloat(minimumStock) || 0,
      reorder_point: parseFloat(reorderPoint) || 0,
      average_cost: parseFloat(averageCost) || 0,
      status: 'active'
    };

    const syncEntry: SyncQueueEntry<Product> = {
      id: crypto.randomUUID(),
      entity_name: 'products',
      entity_id: productId,
      operation_type: 'CREATE',
      payload: productPayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Crear Producto:', productPayload);
    console.log('[Sync Queue]:', syncEntry);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.dbLabel}>PRODUCTS · CATÁLOGO</span>
            <h2 className={styles.title}>Nuevo producto</h2>
            <p className={styles.subtitle}>
              Configura la unidad, existencias y punto de reposición.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className={styles.label}>Nombre</label>
              <input
                type="text"
                placeholder="Nombre del producto"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>SKU</label>
              <input
                type="text"
                className={styles.input}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Categoría</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Sanidad">Sanidad</option>
                <option value="Nutrición">Nutrición</option>
                <option value="Alimentación">Alimentación</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Tipo de producto</label>
              <input
                type="text"
                placeholder="Ej. Medicamento"
                className={styles.input}
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Unidad</label>
              <select
                className={styles.select}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="unidad">unidad</option>
                <option value="bultos">bultos</option>
                <option value="dosis">dosis</option>
                <option value="ton">ton</option>
                <option value="litros">litros</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Stock actual</label>
              <input
                type="number"
                className={styles.input}
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Stock mínimo</label>
              <input
                type="number"
                className={styles.input}
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Punto de reposición</label>
              <input
                type="number"
                className={styles.input}
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className={styles.label}>Costo promedio</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>$</span>
                <input
                  type="number"
                  className={styles.inputPrefixed}
                  value={averageCost}
                  onChange={(e) => setAverageCost(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.offlineBanner}>
            <WifiOff size={18} className={styles.offlineIcon} />
            <div>
              <div className={styles.offlineTitle}>Disponible sin conexión</div>
              <div className={styles.offlineSubtitle}>
                Si no hay señal, se guardará en sync_queue.
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn}>
              Guardar producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;