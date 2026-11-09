import React, { useState } from 'react';
import styles from './CreateProductModal.module.css';
import { X, WifiOff } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { queueHatoWrite } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

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
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Sanidad');
  const [productType, setProductType] = useState('');
  const [unit, setUnit] = useState('unidad');
  const [currentStock, setCurrentStock] = useState('0');
  const [minimumStock, setMinimumStock] = useState('0');
  const [reorderPoint, setReorderPoint] = useState('0');
  const [averageCost, setAverageCost] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'products', 'CREATE', {
        organization_id: scope.organizationId,
        name: name.trim(),
        sku: sku.trim() || undefined,
        category,
        product_type: productType.trim() || undefined,
        unit,
        current_stock: Number(currentStock),
        minimum_stock: Number(minimumStock),
        reorder_point: Number(reorderPoint),
        average_cost: Number(averageCost),
        status: 'active',
      });
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Producto pendiente de sincronización' : 'Producto registrado',
        message: result.lastError ?? (result.pending
          ? 'El producto quedó guardado localmente y se sincronizará al recuperar la conexión.'
          : 'El producto se guardó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo registrar el producto.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo guardar', message });
    } finally {
      setIsSaving(false);
    }
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
                min="0"
                step="0.001"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Stock mínimo</label>
              <input
                type="number"
                className={styles.input}
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                min="0"
                step="0.001"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Punto de reposición</label>
              <input
                type="number"
                className={styles.input}
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                min="0"
                step="0.001"
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
                  min="0"
                  step="0.0001"
                />
              </div>
            </div>
          </div>

          <div className={styles.offlineBanner}>
            <WifiOff size={18} className={styles.offlineIcon} />
            <div>
              <div className={styles.offlineTitle}>Disponible sin conexión</div>
              <div className={styles.offlineSubtitle}>
                Si no hay señal, se guardará en la cola local de sincronización.
              </div>
            </div>
          </div>

          {submitError && <p role="alert" className="text-danger">{submitError}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;