import React, { useState } from 'react';
import styles from './RegisterFeedingModal.module.css';
import { X, CheckCircle, WifiOff, Users, User } from 'lucide-react';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { queueHatoWrite, useHatoCollection } from '../../../../../services/hatoDataService';
import useNotification from '../../../../../hooks/useNotification';

interface RegisterFeedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterFeedingModal: React.FC<RegisterFeedingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { scope } = useFarmScope();
  const { showNotification } = useNotification();
  const { records: animals } = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);
  const { records: lots } = useHatoCollection<Record<string, unknown>>('lots', '/lots', scope);
  const { records: products } = useHatoCollection<Record<string, unknown>>('products', '/products', scope);
  const [targetType, setTargetType] = useState<'LOT' | 'ANIMAL'>('LOT');
  const [lotId, setLotId] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [productId, setProductId] = useState('');
  const [feedingDate, setFeedingDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [unit, setUnit] = useState('ton');
  const [quantity, setQuantity] = useState('1');
  const [totalCost, setTotalCost] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scope) {
      setSubmitError('No hay una finca autorizada seleccionada.');
      return;
    }
    if (targetType === 'LOT' ? !lotId : !animalId) {
      setSubmitError(targetType === 'LOT' ? 'Selecciona un lote.' : 'Selecciona un animal.');
      return;
    }
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = await queueHatoWrite(scope, 'feeding_records', 'CREATE', {
        farm_id: scope.farmId,
        lot_id: targetType === 'LOT' ? lotId : undefined,
        animal_id: targetType === 'ANIMAL' ? animalId : undefined,
        product_id: productId || undefined,
        feeding_date: feedingDate,
        quantity: Number(quantity),
        unit,
        cost: Number(totalCost),
      });
      showNotification({
        type: result.pending ? 'alert' : 'success',
        title: result.pending ? 'Alimentación pendiente de sincronización' : 'Alimentación registrada',
        message: result.lastError ?? (result.pending
          ? 'El registro quedó guardado localmente y se sincronizará al recuperar la conexión.'
          : 'El registro se guardó correctamente.'),
      });
      onSuccess?.();
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo registrar la alimentación.';
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
            <span className={styles.dbLabel}>FEEDING_RECORDS</span>
            <h2 className={styles.title}>Registrar alimentación</h2>
            <p className={styles.subtitle}>
              Registra el producto entregado, cantidad y costo.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.targetGroup}>
            <button
              type="button"
              className={`${styles.targetBtn} ${targetType === 'LOT' ? styles.targetActive : ''}`}
              onClick={() => setTargetType('LOT')}
            >
              <Users size={16} />
              <span>Lote completo</span>
            </button>
            <button
              type="button"
              className={`${styles.targetBtn} ${targetType === 'ANIMAL' ? styles.targetActive : ''}`}
              onClick={() => setTargetType('ANIMAL')}
            >
              <User size={16} />
              <span>Animal individual</span>
            </button>
          </div>

          <div className="row g-3">
            {targetType === 'LOT' ? (
              <div className="col-12">
                <label className={styles.label}>Lote (lot_id)</label>
                <select
                  className={styles.select}
                  value={lotId}
                  onChange={(e) => setLotId(e.target.value)}
                >
                  <option value="">Selecciona un lote</option>
                  {lots.map((lot) => <option key={String(lot.id)} value={String(lot.id)}>{String(lot.name ?? lot.id)}</option>)}
                </select>
              </div>
            ) : (
              <div className="col-12">
                <label className={styles.label}>Animal (animal_id)</label>
                <select
                  className={styles.select}
                  value={animalId}
                  onChange={(e) => setAnimalId(e.target.value)}
                >
                  <option value="">Selecciona un animal</option>
                  {animals.map((animal) => (
                    <option key={String(animal.id)} value={String(animal.id)}>
                      {String(animal.identifier_tag ?? animal.tag_number ?? animal.id)} · {String(animal.name ?? 'Sin nombre')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-12 col-md-6">
              <label className={styles.label}>Producto (opcional)</label>
              <select
                className={styles.select}
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Sin producto</option>
                {products.map((product) => (
                  <option key={String(product.id)} value={String(product.id)}>
                    {String(product.name ?? product.id)} · {Number(product.current_stock ?? 0)} {String(product.unit ?? '')} disponibles
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Fecha de alimentación</label>
              <input
                type="date"
                className={styles.input}
                value={feedingDate}
                onChange={(e) => setFeedingDate(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Cantidad</label>
              <input
                type="number"
                step="0.1"
                className={styles.input}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0.001"
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className={styles.label}>Unidad</label>
              <select
                className={styles.select}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="ton">ton</option>
                <option value="bultos">bultos</option>
                <option value="kg">kg</option>
              </select>
            </div>

            <div className="col-12">
              <label className={styles.label}>Costo total</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>$</span>
                <input
                  type="number"
                  className={styles.inputPrefixed}
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  min="0"
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
              <CheckCircle size={18} />
              <span>{isSaving ? 'Guardando…' : 'Guardar registro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterFeedingModal;