import React, { useState } from 'react';
import styles from './SaleForm.module.css';
import { Plus, X, Check, WifiOff } from 'lucide-react';
import type { Sale, SaleLine, SyncQueueEntry } from '../../../../../types/database.types';

interface SaleLineUI {
  id: string;
  item_type: 'ANIMAL' | 'LOT';
  item_id: string;
  quantity: number;
  weight: number;
  unit_price: number;
}

export const SaleForm: React.FC = () => {
  const [customerId, setCustomerId] = useState('c-1');
  const [saleDate, setSaleDate] = useState('2025-06-16');
  const [saleNumber, setSaleNumber] = useState('VEN-2025-0048');

  const [lines, setLines] = useState<SaleLineUI[]>([
    {
      id: 'l-1',
      item_type: 'ANIMAL',
      item_id: 'a-2',
      quantity: 1,
      weight: 536,
      unit_price: 9800
    },
    {
      id: 'l-2',
      item_type: 'LOT',
      item_id: 'lot-2',
      quantity: 24,
      weight: 12840,
      unit_price: 9800
    }
  ]);

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        item_type: 'ANIMAL',
        item_id: 'a-1',
        quantity: 1,
        weight: 480,
        unit_price: 9800
      }
    ]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleLineChange = (
    id: string,
    field: keyof SaleLineUI,
    value: string | number
  ) => {
    setLines(
      lines.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const totalWeight = lines.reduce((acc, l) => acc + (l.weight || 0), 0);
  const totalAmount = lines.reduce(
    (acc, l) => acc + (l.weight || 0) * (l.unit_price || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const saleId = crypto.randomUUID();

    const salePayload: Sale = {
      id: saleId,
      farm_id: 'farm-1',
      customer_id: customerId,
      sale_number: saleNumber,
      sale_date: new Date(saleDate).toISOString(),
      subtotal: totalAmount,
      tax: 0,
      total: totalAmount,
      payment_status: 'Pagada'
    };

    const saleLinesPayload: SaleLine[] = lines.map((l) => ({
      id: crypto.randomUUID(),
      sale_id: saleId,
      animal_id: l.item_type === 'ANIMAL' ? l.item_id : undefined,
      lot_id: l.item_type === 'LOT' ? l.item_id : undefined,
      quantity: l.quantity,
      weight: l.weight,
      unit_price: l.unit_price,
      subtotal: l.weight * l.unit_price
    }));

    const syncEntry: SyncQueueEntry<{ sale: Sale; lines: SaleLine[] }> = {
      id: crypto.randomUUID(),
      entity_name: 'sales',
      entity_id: saleId,
      operation_type: 'CREATE',
      payload: { sale: salePayload, lines: saleLinesPayload },
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('[Action Log]: Registrar Venta:', salePayload, saleLinesPayload);
    console.log('[Sync Queue]:', syncEntry);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formCard}>
      {/* INFORMACIÓN DE LA VENTA */}
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
            <option value="c-1">Frigorífico Central · NIT 900.882.114</option>
            <option value="c-2">Cooperativa del Valle · NIT 800.123.456</option>
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

      {/* DETALLE DE LA VENTA */}
      <div className={styles.sectionHeaderFlex}>
        <div>
          <span className={styles.dbLabel}>SALE_LINES</span>
          <h2 className={styles.sectionTitle}>Detalle de la venta</h2>
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
        {lines.map((l) => (
          <div key={l.id} className={styles.lineRow}>
            <div className="row g-2 align-items-center flex-grow-1">
              <div className="col-12 col-md-4">
                <label className={styles.miniLabel}>ANIMAL O LOTE</label>
                <select
                  className={styles.select}
                  value={l.item_id}
                  onChange={(e) => handleLineChange(l.id, 'item_id', e.target.value)}
                >
                  <option value="a-2">BR-1088 · Magnate</option>
                  <option value="lot-2">Lote Ceba final</option>
                  <option value="a-1">BR-1042 · Esperanza</option>
                </select>
              </div>

              <div className="col-6 col-md-2">
                <label className={styles.miniLabel}>CANTIDAD</label>
                <input
                  type="number"
                  className={styles.input}
                  value={l.quantity}
                  onChange={(e) =>
                    handleLineChange(l.id, 'quantity', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="col-6 col-md-3">
                <label className={styles.miniLabel}>PESO</label>
                <div className={styles.inputWithSuffix}>
                  <input
                    type="number"
                    className={styles.inputBare}
                    value={l.weight}
                    onChange={(e) =>
                      handleLineChange(l.id, 'weight', parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className={styles.suffix}>kg</span>
                </div>
              </div>

              <div className="col-12 col-md-3">
                <label className={styles.miniLabel}>PRECIO UNITARIO</label>
                <div className={styles.inputWithPrefix}>
                  <span className={styles.prefix}>$</span>
                  <input
                    type="number"
                    className={styles.inputBare}
                    value={l.unit_price}
                    onChange={(e) =>
                      handleLineChange(
                        l.id,
                        'unit_price',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 ms-md-3">
              <span className={styles.subtotalText}>
                ${((l.weight || 0) * (l.unit_price || 0)).toLocaleString('es-CO')}
              </span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemoveLine(l.id)}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BANNER OFFLINE Y TOTALES */}
      <div className="row g-3 align-items-center">
        <div className="col-12 col-md-7">
          <div className={styles.offlineBanner}>
            <WifiOff size={18} className={styles.offlineIcon} />
            <div>
              <div className={styles.offlineTitle}>Venta disponible sin conexión</div>
              <div className={styles.offlineSubtitle}>
                Se sincronizará cuando se recupere la señal.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-5">
          <div className={styles.totalsBox}>
            <div className="d-flex justify-content-between mb-1">
              <span>Peso total</span>
              <span className="fw-bold">{totalWeight.toLocaleString('es-CO')} kg</span>
            </div>
            <div className="d-flex justify-content-between font-size-16 fw-extrabold border-top pt-1 mt-1">
              <span>Total de la venta</span>
              <span>${totalAmount.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <button type="submit" className={styles.saveBtn}>
            <Check size={18} />
            <span>Registrar venta</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SaleForm;