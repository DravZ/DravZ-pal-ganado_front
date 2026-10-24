import React, { useState } from 'react';
import { ArrowRightLeft, Syringe, Beef } from 'lucide-react';
import styles from './EventHistory.module.css';

export const EventHistory: React.FC = () => {
  const [eventType, setEventType] = useState('Todos los eventos');
  const [period, setPeriod] = useState('Últimos 12 meses');

  return (
    <div>
      {/* Filtros de Eventos */}
      <div className={styles.filterCard}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label font-weight-bold fs-7 text-secondary">Tipo de evento</label>
            <select
              className={styles.selectControl}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="Todos los eventos">Todos los eventos</option>
              <option value="Movimientos">Movimientos</option>
              <option value="Salud">Salud</option>
              <option value="Nacimiento">Nacimiento</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label font-weight-bold fs-7 text-secondary">Periodo</label>
            <select
              className={styles.selectControl}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="Últimos 12 meses">Últimos 12 meses</option>
              <option value="Año actual">Año actual</option>
              <option value="Histórico completo">Histórico completo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista Timeline de Eventos */}
      <div className={styles.timelineCard}>
        {/* Evento 1 */}
        <div className={styles.eventItem}>
          <div className={`${styles.iconSquare} ${styles.iconMovement}`}>
            <ArrowRightLeft size={22} strokeWidth={2.2} />
          </div>

          <div className="flex-grow-1">
            <div className={styles.eventHeaderFlex}>
              <span className={styles.eventKicker}>02 JUN 2025 · MOVIMIENTO</span>
              <span className={`${styles.pillTag} ${styles.pillMovement}`}>Movimiento</span>
            </div>

            <h3 className={styles.eventTitle}>Traslado a Vacas de cría</h3>
            <p className={styles.eventSub}>
              Del lote Hembras reemplazo al lote Vacas de cría. Potrero de destino: Potrero Norte.
            </p>
            <div className={styles.registeredBy}>Registrado por Rafael Mendes</div>
          </div>
        </div>

        {/* Evento 2 */}
        <div className={styles.eventItem}>
          <div className={`${styles.iconSquare} ${styles.iconHealth}`}>
            <Syringe size={22} strokeWidth={2.2} />
          </div>

          <div className="flex-grow-1">
            <div className={styles.eventHeaderFlex}>
              <span className={styles.eventKicker}>10 MAR 2025 · SALUD</span>
              <span className={`${styles.pillTag} ${styles.pillHealth}`}>Salud</span>
            </div>

            <h3 className={styles.eventTitle}>Desparasitación preventiva</h3>
            <p className={styles.eventSub}>
              Ivermectina 1% · 10 mL · Vía subcutánea. Sin novedades posteriores.
            </p>
            <div className={styles.registeredBy}>Registrado por Dra. Ana Costa</div>
          </div>
        </div>

        {/* Evento 3 */}
        <div className={styles.eventItem}>
          <div className={`${styles.iconSquare} ${styles.iconBirth}`}>
            <Beef size={22} strokeWidth={2.2} />
          </div>

          <div className="flex-grow-1">
            <div className={styles.eventHeaderFlex}>
              <span className={styles.eventKicker}>18 AGO 2022 · NACIMIENTO</span>
              <span className={`${styles.pillTag} ${styles.pillReproduction}`}>Reproducción</span>
            </div>

            <h3 className={styles.eventTitle}>Registro de nacimiento</h3>
            <p className={styles.eventSub}>
              Nacimiento en Potrero Norte. Peso registrado: 34 kg.
            </p>
            <div className={styles.registeredBy}>Registrado por Rafael Mendes</div>
          </div>
        </div>
      </div>
    </div>
  );
};