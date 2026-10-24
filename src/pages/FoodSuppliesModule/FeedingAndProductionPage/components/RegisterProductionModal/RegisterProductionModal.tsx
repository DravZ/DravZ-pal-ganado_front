import React, { useState } from 'react';
import styles from './RegisterProductionModal.module.css';
import { X, CheckCircle, WifiOff, Users, User } from 'lucide-react';
import type { ProductionRecord, SyncQueueEntry } from '../../../../../types/database.types';

interface RegisterProductionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const RegisterProductionModal: React.FC<RegisterProductionModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [targetType, setTargetType] = useState<'LOT' | 'ANIMAL'>('LOT');
    const [lotId, setLotId] = useState('lot1');
    const [animalId, setAnimalId] = useState('a1042');
    const [productionType, setProductionType] = useState<'Leche' | 'Carne'>('Leche');
    const [productionDate, setProductionDate] = useState('2025-06-16');
    const [quantity, setQuantity] = useState('1320');
    const [unit, setUnit] = useState('litros');
    const [unitPrice, setUnitPrice] = useState('2050');

    if (!isOpen) return null;

    const calculatedRevenue = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const recordId = crypto.randomUUID();

        const productionPayload: ProductionRecord = {
            id: recordId,
            farm_id: 'farm-1', // Reemplazar con el ID de la finca activa
            lot_id: targetType === 'LOT' ? lotId : undefined,
            animal_id: targetType === 'ANIMAL' ? animalId : undefined,
            production_type: productionType,
            production_date: new Date(productionDate).toISOString(),
            quantity: parseFloat(quantity) || 0,
            unit,
            price_per_unit: parseFloat(unitPrice) || 0, // Corregido: price_per_unit
            revenue: calculatedRevenue                  // Corregido: revenue
        };

        const syncEntry: SyncQueueEntry<ProductionRecord> = {
            id: crypto.randomUUID(),
            entity_name: 'production_records',
            entity_id: recordId,
            operation_type: 'CREATE',
            payload: productionPayload,
            status: 'PENDING',
            retry_count: 0,
            created_at: new Date().toISOString()
        };

        console.log('[Action Log]: Registrar Producción (Modal):', productionPayload);
        console.log('[Sync Queue]:', syncEntry);

        if (onSuccess) onSuccess();
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <span className={styles.dbLabel}>PRODUCTION_RECORDS</span>
                        <h2 className={styles.title}>Registrar producción</h2>
                        <p className={styles.subtitle}>
                            Registra leche o carne producida y calcula el ingreso.
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
                                    <option value="lot1">Vacas de cría · 58 animales</option>
                                    <option value="lot2">Lote Ceba final · 42 animales</option>
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
                                    <option value="a1042">BR-1042 · Esperanza</option>
                                    <option value="a1088">BR-1088 · Magnate</option>
                                </select>
                            </div>
                        )}

                        <div className="col-12 col-md-6">
                            <label className={styles.label}>Tipo de producción</label>
                            <select
                                className={styles.select}
                                value={productionType}
                                onChange={(e) => setProductionType(e.target.value as 'Leche' | 'Carne')}
                            >
                                <option value="Leche">Leche</option>
                                <option value="Carne">Carne</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-6">
                            <label className={styles.label}>Fecha de producción</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={productionDate}
                                onChange={(e) => setProductionDate(e.target.value)}
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
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className={styles.label}>Unidad</label>
                            <select
                                className={styles.select}
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                <option value="litros">litros</option>
                                <option value="kg">kg</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-6">
                            <label className={styles.label}>Precio por unidad</label>
                            <div className={styles.inputWithPrefix}>
                                <span className={styles.prefix}>$</span>
                                <input
                                    type="number"
                                    className={styles.inputPrefixed}
                                    value={unitPrice}
                                    onChange={(e) => setUnitPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <label className={styles.label}>Ingreso calculado</label>
                            <div className={styles.calculatedBox}>
                                ${calculatedRevenue.toLocaleString('es-CO')}
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
                            <CheckCircle size={18} />
                            <span>Guardar registro</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterProductionModal;