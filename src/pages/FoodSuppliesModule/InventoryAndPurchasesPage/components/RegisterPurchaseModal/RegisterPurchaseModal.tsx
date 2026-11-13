import React, { useState } from 'react';
import styles from '../CreateProductModal/CreateProductModal.module.css';
import { X, Plus, RefreshCw, WifiOff } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import { queueHatoWrite, useHatoCollection } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

interface RegisterPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PurchaseLineForm {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export const RegisterPurchaseModal: React.FC<RegisterPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { records: suppliers } = useHatoCollection<Record<string, unknown>>('suppliers', '/suppliers', scope);
  const { records: products } = useHatoCollection<Record<string, unknown>>('products', '/products', scope);
  const [supplierId, setSupplierId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [lines, setLines] = useState<PurchaseLineForm[]>([
    { product_id: '', quantity: 1, unit_price: 0 },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddLine = () => {
    setLines([...lines, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (
    index: number,
    field: keyof PurchaseLineForm,
    value: string | number
  ) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const calculatedSubtotal = lines.reduce(
    (acc, l) => acc + (l.quantity || 0) * (l.unit_price || 0),
    0
  );
  const calculatedTax = calculatedSubtotal * 0.19;
  const calculatedTotal = calculatedSubtotal + calculatedTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    if (!supplierId) {
      setSubmitError('Selecciona un proveedor.');
      return;
    }
    if (lines.length === 0 || lines.some((line) => !line.product_id || line.quantity <= 0 || line.unit_price <= 0)) {
      setSubmitError('Agrega al menos un producto con cantidad y precio válidos.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'purchase_records', 'CREATE', {
        organization_id: scope.organizationId,
        farm_id: scope.farmId,
        supplier_id: supplierId,
        purchase_date: purchaseDate,
        invoice_number: invoiceNumber.trim() || undefined,
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        total: calculatedTotal,
        payment_status: 'Pagada',
        lines: lines.map((line) => ({
          product_id: line.product_id,
          quantity: line.quantity,
          unit_price: line.unit_price,
          subtotal: line.quantity * line.unit_price,
        })),
      });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Compra pendiente de sincronización' : 'Compra registrada',
        message: result.lastError ?? (result.pending
          ? 'La compra quedó guardada localmente y se sincronizará al recuperar la conexión.'
          : 'La compra se guardó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo registrar la compra.';
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
            <span className={styles.dbLabel}>PURCHASES + PURCHASE_LINES</span>
            <h2 className={styles.title}>Registrar compra</h2>
            <p className={styles.subtitle}>
              La compra generará entradas de inventario automáticamente.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-5">
              <label className={styles.label}>Proveedor</label>
              <select
                className={styles.select}
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Selecciona un proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={String(supplier.id)} value={String(supplier.id)}>{String(supplier.name ?? supplier.id)}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className={styles.label}>Fecha de compra</label>
              <input
                type="date"
                className={styles.input}
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className={styles.label}>Número de factura</label>
              <input
                type="text"
                placeholder="Ej. FV-88211"
                className={styles.input}
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.dbLabel}>PURCHASE_LINES</span>
              <h3 className={styles.sectionTitle}>Productos de la compra</h3>
            </div>
            <button
              type="button"
              className={styles.addLineBtn}
              onClick={handleAddLine}
            >
              <Plus size={16} />
              <span>Agregar línea</span>
            </button>
          </div>

          <div className="d-flex flex-column gap-3 mb-4">
            {lines.map((line, idx) => (
              <div key={idx} className={styles.lineRow}>
                <div className="row g-2 align-items-center flex-grow-1">
                  <div className="col-12 col-md-5">
                    <label className={styles.miniLabel}>PRODUCTO</label>
                    <select
                      className={styles.select}
                      value={line.product_id}
                      onChange={(e) =>
                        handleLineChange(idx, 'product_id', e.target.value)
                      }
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map((product) => (
                        <option key={String(product.id)} value={String(product.id)}>{String(product.name ?? product.id)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-3">
                    <label className={styles.miniLabel}>CANTIDAD</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={line.quantity}
                      onChange={(e) =>
                        handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      min="0.001"
                      step="0.001"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className={styles.miniLabel}>PRECIO UNITARIO</label>
                    <div className={styles.inputWithPrefix}>
                      <span className={styles.prefix}>$</span>
                      <input
                        type="number"
                        className={styles.inputPrefixed}
                        value={line.unit_price}
                        onChange={(e) =>
                          handleLineChange(
                            idx,
                            'unit_price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <span className={styles.subtotalText}>
                    ${((line.quantity || 0) * (line.unit_price || 0)).toLocaleString('es-CO')}
                  </span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemoveLine(idx)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* BANNER ENTRADA AUTOMÁTICA & TOTALES */}
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-7">
              <div className={styles.autoEntryBanner}>
                <RefreshCw size={20} className={styles.autoEntryIcon} />
                <div>
                  <div className={styles.autoEntryTitle}>
                    Entrada automática de inventario
                  </div>
                  <div className={styles.autoEntrySubtitle}>
                    Se crearán {lines.length} registros en inventory_movements.
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-5">
              <div className={styles.totalsBox}>
                <div className="d-flex justify-content-between mb-1">
                  <span>Subtotal</span>
                  <span className="fw-bold">${calculatedSubtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Impuesto (19%)</span>
                  <span>${calculatedTax.toLocaleString('es-CO')}</span>
                </div>
                <div className="d-flex justify-content-between font-size-16 fw-extrabold border-top pt-1 mt-1">
                  <span>Total</span>
                  <span>${calculatedTotal.toLocaleString('es-CO')}</span>
                </div>
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
              {isSaving ? 'Guardando…' : 'Guardar compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPurchaseModal;