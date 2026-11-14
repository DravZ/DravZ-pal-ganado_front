import React, { useMemo, useState } from 'react';
import styles from './SaleForm.module.css';
import { Plus, Trash2, CheckCircle, WifiOff, AlertTriangle } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useFormExitGuard } from '../../../../../context/FormExitGuardContext';
import { queueHatoWrite, useHatoCollection } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

interface UIItemLine {
  id: string;
  item_type: 'ANIMAL' | 'LOT';
  entity_id: string;
  display_name: string;
  quantity: number;
  weight: number;
  unit_price: number;
}

export const SaleForm: React.FC = () => {
  const { scope } = useFarmScope();
  const { markCurrentFormsSaved } = useFormExitGuard();
  const { showNotification } = useNotification();
  const { records: customers } = useHatoCollection<Record<string, unknown>>(
    'customers',
    '/customers',
    scope,
  );
  const { records: rawAnimals } = useHatoCollection<Record<string, unknown>>(
    'animals',
    '/animals',
    scope,
  );
  const { records: rawLots } = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const animals = useMemo(() => rawAnimals.map((animal) => ({
    id: String(animal.id ?? ''),
    name: String(animal.name ?? 'Sin nombre'),
    tag: String(animal.identifier_tag ?? animal.tag_number ?? ''),
    weight: Number(animal.current_weight ?? 0),
    lotId: String(animal.lot_id ?? ''),
    status: String(animal.status ?? ''),
  })), [rawAnimals]);
  const lots = rawLots.map((lot) => ({ id: String(lot.id ?? ''), name: String(lot.name ?? '') }));
  const options = [
    ...animals.filter((animal) => animal.status === 'active').map((animal) => ({
      value: `ANIMAL:${animal.id}`,
      label: `${animal.tag} · ${animal.name}`,
      type: 'ANIMAL' as const,
      id: animal.id,
      quantity: 1,
      weight: animal.weight,
    })),
    ...lots
      .filter((lot) => animals.some((animal) => animal.lotId === lot.id && animal.status === 'active'))
      .map((lot) => {
        const members = animals.filter((animal) => animal.lotId === lot.id && animal.status === 'active');
        return {
          value: `LOT:${lot.id}`,
          label: `Lote ${lot.name} · ${members.length} ${members.length === 1 ? 'animal activo' : 'animales activos'}`,
          type: 'LOT' as const,
          id: lot.id,
          quantity: members.length,
          weight: members.reduce((total, animal) => total + animal.weight, 0),
        };
      }),
  ];
  const [customerId, setCustomerId] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleNumber, setSaleNumber] = useState('');
  const [lines, setLines] = useState<UIItemLine[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddLine = () => {
    const option = options[0];
    if (!option) return;
    const newLine: UIItemLine = {
      id: crypto.randomUUID(),
      item_type: option.type,
      entity_id: option.id,
      display_name: option.label,
      quantity: option.quantity,
      weight: option.weight,
      unit_price: 0,
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleUpdateLine = <K extends keyof UIItemLine>(
    id: string,
    field: K,
    value: UIItemLine[K]
  ) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };
  const handleSelectLine = (lineId: string, value: string) => {
    const option = options.find((item) => item.value === value);
    if (!option) return;
    setLines((current) => current.map((line) => line.id === lineId
      ? {
        ...line,
        item_type: option.type,
        entity_id: option.id,
        display_name: option.label,
        quantity: option.quantity,
        weight: option.weight,
      }
      : line));
  };

  const totalWeight = lines.reduce((acc, curr) => acc + (curr.weight || 0), 0);
  const totalAmount = lines.reduce((acc, curr) => acc + (curr.weight * curr.unit_price || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget;

    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    if (!customerId || !lines.length) {
      setSubmitError('Selecciona un cliente y agrega al menos una línea de venta.');
      return;
    }
    if (lines.some((line) => line.quantity <= 0 || line.weight <= 0 || line.unit_price <= 0)) {
      setSubmitError('Las cantidades, pesos y precios deben ser mayores a cero.');
      return;
    }
    if (new Set(lines.map((line) => `${line.item_type}:${line.entity_id}`)).size !== lines.length) {
      setSubmitError('No repitas el mismo animal o lote en varias líneas.');
      return;
    }

    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'sales_records', 'CREATE', {
        organization_id: scope.organizationId,
        farm_id: scope.farmId,
        customer_id: customerId,
        sale_number: saleNumber.trim() || undefined,
        sale_date: saleDate,
        subtotal: totalAmount,
        tax: 0,
        total: totalAmount,
        payment_status: 'Pendiente',
        lines: lines.map((line) => ({
          item_type: line.item_type,
          animal_id: line.item_type === 'ANIMAL' ? line.entity_id : undefined,
          lot_id: line.item_type === 'LOT' ? line.entity_id : undefined,
          quantity: line.quantity,
          weight: line.weight,
          unit_price: line.unit_price,
          subtotal: line.weight * line.unit_price,
        })),
      });
      markCurrentFormsSaved(formElement);
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Venta pendiente de sincronización' : 'Venta registrada',
        message: result.lastError ?? (result.pending
          ? 'La venta quedó guardada en la cola local.'
          : 'La venta y sus líneas fueron confirmadas por el servidor.'),
      });
      setLines([]);
      setCustomerId('');
      setSaleNumber('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar la venta.';
      setSubmitError(message);
      showNotification({ type: 'error', title: 'No se pudo registrar la venta', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formCard}>
      {/* SECCIÓN SALES */}
      <div className={styles.sectionHeader}>
        <span className={styles.dbLabel}>SALES</span>
        <h2 className={styles.sectionTitle}>Información de la venta</h2>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-5">
          <label className={styles.label}>Cliente</label>
          <select
            className={styles.select}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Selecciona un cliente</option>
            {customers.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {String(c.name ?? 'Sin nombre')}
                {c.tax_id ? ` · NIT ${String(c.tax_id)}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-3">
          <label className={styles.label}>Fecha de venta</label>
          <input
            type="date"
            className={styles.input}
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            required
          />
        </div>

        <div className="col-12 col-md-4">
          <label className={styles.label}>Número de venta</label>
          <input
            type="text"
            className={styles.input}
            value={saleNumber}
            onChange={(e) => setSaleNumber(e.target.value)}
          />
        </div>
      </div>

      <hr className={styles.divider} />

      {/* SECCIÓN SALE_LINES (Encabezado Responsive Flex) */}
      <div className={styles.sectionHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>SALE_LINES</span>
          <h2 className={styles.sectionTitleNoMargin}>Detalle de la venta</h2>
        </div>
        <button type="button" className={styles.addLineBtn} onClick={handleAddLine}>
          <Plus size={18} />
          <span>Agregar línea</span>
        </button>
      </div>

      {/* TABLA O TARJETAS APILADAS DE LÍNEAS */}
      <div className={`${styles.linesTableContainer} mt-3`}>
        {/* Encabezados solo para Escritorio */}
        <div className={styles.linesHeaderRow}>
          <div style={{ flex: 2 }}>ANIMAL O LOTE</div>
          <div style={{ flex: 0.8 }}>CANTIDAD</div>
          <div style={{ flex: 1.2 }}>PESO (KG)</div>
          <div style={{ flex: 1.4 }}>PRECIO UNITARIO</div>
          <div style={{ flex: 1.2, textAlign: 'right' }}>SUBTOTAL</div>
          <div style={{ width: '110px', textAlign: 'center' }}>ACCIONES</div>
        </div>

        {lines.map((line) => {
          const subtotal = line.weight * line.unit_price;
          return (
            <div key={line.id} className={styles.lineRowCard}>
              {/* Selección de Animal o Lote */}
              <div className={styles.fieldBlock} style={{ flex: 2 }}>
                <span className={styles.fieldMicroLabel}>Item a vender</span>
                <select
                  className={styles.selectCompact}
                  value={`${line.item_type}:${line.entity_id}`}
                  onChange={(e) => handleSelectLine(line.id, e.target.value)}
                >
                  <option value="">Selecciona animal o lote</option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Cantidad */}
              <div className={styles.fieldBlock} style={{ flex: 0.8 }}>
                <span className={styles.fieldMicroLabel}>Cantidad</span>
                <input
                  type="number"
                  className={styles.inputCompact}
                  value={line.quantity}
                  onChange={(e) => handleUpdateLine(line.id, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  step="1"
                  required
                />
              </div>

              {/* Peso Total */}
              <div className={styles.fieldBlock} style={{ flex: 1.2 }}>
                <span className={styles.fieldMicroLabel}>Peso total</span>
                <div className={styles.unitInputGroup}>
                  <input
                    type="number"
                    className={styles.inputCompact}
                    value={line.weight}
                    onChange={(e) => handleUpdateLine(line.id, 'weight', parseFloat(e.target.value) || 0)}
                    min="0.001"
                    step="0.01"
                    required
                  />
                  <span className={styles.unitText}>kg</span>
                </div>
              </div>

              {/* Precio Unitario por KG */}
              <div className={styles.fieldBlock} style={{ flex: 1.4 }}>
                <span className={styles.fieldMicroLabel}>Precio / kg</span>
                <div className={styles.unitInputGroup}>
                  <span className={styles.currencyPrefix}>$</span>
                  <input
                    type="number"
                    className={`${styles.inputCompact} ps-4`}
                    value={line.unit_price}
                    onChange={(e) => handleUpdateLine(line.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Subtotal */}
              <div className={styles.subtotalBlock} style={{ flex: 1.2 }}>
                <span className={styles.fieldMicroLabel}>Subtotal</span>
                <span className={styles.subtotalAmount}>${subtotal.toLocaleString('es-CO')}</span>
              </div>

              {/* BOTÓN EXPLÍCITO DE ELIMINACIÓN */}
              <div className={styles.actionBlock} style={{ width: '110px' }}>
                <button
                  type="button"
                  className={styles.removeLineBtnExplicit}
                  onClick={() => handleRemoveLine(line.id)}
                  title="Eliminar esta línea de la venta"
                >
                  <Trash2 size={16} />
                  <span>Quitar línea</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {lines.some((line) => line.item_type === 'LOT') && (
        <div className={`${styles.offlineBanner} mt-3`}>
          <AlertTriangle size={20} className={styles.offlineIcon} />
          <div>
            <div className={styles.offlineTitle}>Venta de lote completo</div>
            <div className={styles.offlineSubtitle}>
              Al registrar la venta, todos los animales activos del lote se marcarán como vendidos.
            </div>
          </div>
        </div>
      )}

      {/* BANNER OFFLINE Y FOOTER TOTALES */}
      <div className="row align-items-center mt-4 g-3">
        <div className="col-12 col-md-6">
          <div className={styles.offlineBanner}>
            <WifiOff size={20} className={styles.offlineIcon} />
            <div>
              <div className={styles.offlineTitle}>Venta disponible sin conexión</div>
              <div className={styles.offlineSubtitle}>
                Se sincronizará cuando se recupere la señal.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 d-flex flex-column align-items-end gap-2">
          <div className="d-flex justify-content-between w-100 max-w-300">
            <span className={styles.totalLabel}>Peso total</span>
            <span className={styles.totalValue}>{totalWeight.toLocaleString('es-CO')} kg</span>
          </div>

          <div className="d-flex justify-content-between w-100 max-w-300 align-items-center">
            <span className={styles.totalLabel}>Total de la venta</span>
            <span className={styles.grandTotalValue}>${totalAmount.toLocaleString('es-CO')}</span>
          </div>

          <button type="submit" className={`${styles.saveBtn} mt-2`} disabled={isSaving}>
            <CheckCircle size={18} />
            <span>{isSaving ? 'Guardando…' : 'Registrar venta'}</span>
          </button>
        </div>
      </div>
      {(submitError || !options.length) && (
        <p role={submitError ? 'alert' : 'status'} className="text-danger">
          {submitError ?? 'No hay animales o lotes disponibles para vender en esta finca.'}
        </p>
      )}
    </form>
  );
};

export default SaleForm;