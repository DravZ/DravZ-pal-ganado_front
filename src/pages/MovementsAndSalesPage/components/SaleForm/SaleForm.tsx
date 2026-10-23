import React, { useState } from 'react';
import styles from './SaleForm.module.css';
import { Plus, Trash2, CheckCircle, WifiOff } from 'lucide-react';

import type {
  Customer,
  CreateSaleDTO,
  SyncQueueEntry
} from '../../../../types/database.types';

interface UIItemLine {
  id: string;
  item_type: 'ANIMAL' | 'LOT';
  entity_id: string;
  display_name: string;
  quantity: number;
  weight: number;
  unit_price: number;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1111111-0000-0000-0000-111111111111',
    organization_id: 'org-123',
    name: 'Frigorífico Central',
    tax_id: '900.882.114',
    status: 'active'
  },
  {
    id: 'c2222222-0000-0000-0000-222222222222',
    organization_id: 'org-123',
    name: 'Cooperativa del Valle',
    tax_id: '800.123.456',
    status: 'active'
  }
];

export const SaleForm: React.FC = () => {
  const [customerId, setCustomerId] = useState<string>(MOCK_CUSTOMERS[0].id);
  const [saleDate, setSaleDate] = useState<string>('2025-06-16');
  const [saleNumber, setSaleNumber] = useState<string>('VEN-2025-0048');

  const [lines, setLines] = useState<UIItemLine[]>([
    {
      id: '1',
      item_type: 'ANIMAL',
      entity_id: 'a2022222-0000-0000-0000-222222222222',
      display_name: 'BR-1088 · Magnate',
      quantity: 1,
      weight: 536,
      unit_price: 9800
    },
    {
      id: '2',
      item_type: 'LOT',
      entity_id: '8a11e8a2-23bf-4d80-8772-23fa00100002',
      display_name: 'Lote Ceba final',
      quantity: 24,
      weight: 12840,
      unit_price: 9800
    }
  ]);

  const handleAddLine = () => {
    const newLine: UIItemLine = {
      id: crypto.randomUUID(),
      item_type: 'ANIMAL',
      entity_id: 'a1011111-0000-0000-0000-111111111111',
      display_name: 'BR-1042 · Esperanza',
      quantity: 1,
      weight: 482,
      unit_price: 9800
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleUpdateLine = (id: string, field: keyof UIItemLine, value: any) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const totalWeight = lines.reduce((acc, curr) => acc + (curr.weight || 0), 0);
  const totalAmount = lines.reduce((acc, curr) => acc + (curr.weight * curr.unit_price || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const farmId = 'f9d12345-0000-0000-0000-000000000001';
    const saleId = crypto.randomUUID();

    const salePayload: CreateSaleDTO = {
      farm_id: farmId,
      customer_id: customerId,
      sale_number: saleNumber,
      sale_date: saleDate,
      subtotal: totalAmount,
      tax: 0,
      total: totalAmount,
      payment_status: 'Pendiente',
      lines: lines.map((l) => ({
        item_type: l.item_type,
        animal_id: l.item_type === 'ANIMAL' ? l.entity_id : undefined,
        lot_id: l.item_type === 'LOT' ? l.entity_id : undefined,
        quantity: l.quantity,
        weight: l.weight,
        unit_price: l.unit_price,
        subtotal: l.weight * l.unit_price
      }))
    };

    const syncQueueEntry: SyncQueueEntry<CreateSaleDTO> = {
      id: crypto.randomUUID(),
      entity_name: 'sales',
      entity_id: saleId,
      operation_type: 'CREATE',
      payload: salePayload,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Guardando Venta comercial:', salePayload);
    console.log('[Sync Queue Payload]:', syncQueueEntry);
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
          >
            {MOCK_CUSTOMERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · NIT {c.tax_id}
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
                  value={line.display_name}
                  onChange={(e) => handleUpdateLine(line.id, 'display_name', e.target.value)}
                >
                  <option value="BR-1088 · Magnate">BR-1088 · Magnate</option>
                  <option value="Lote Ceba final">Lote Ceba final</option>
                  <option value="BR-1042 · Esperanza">BR-1042 · Esperanza</option>
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

          <button type="submit" className={`${styles.saveBtn} mt-2`}>
            <CheckCircle size={18} />
            <span>Registrar venta</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SaleForm;