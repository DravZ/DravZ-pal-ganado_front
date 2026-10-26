import React, { useState } from 'react';
import styles from './CostAllocationsTab.module.css';

export const CostAllocationsTab: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('Junio 2025');

  const categories = [
    { name: 'Alimentación', amount: '$12.8 M', percent: '48%', color: '#1e4b27' },
    { name: 'Sanidad', amount: '$6.4 M', percent: '24%', color: '#52796f' },
    { name: 'Infraestructura', amount: '$4.2 M', percent: '16%', color: '#d97706' },
    { name: 'Otros', amount: '$3.1 M', percent: '12%', color: '#cbd5e1' }
  ];

  const lotsCost = [
    { name: 'Vacas de cría', countText: '58 animales', amount: '$8.42 M', progress: 85 },
    { name: 'Novillos levante', countText: '63 animales', amount: '$7.18 M', progress: 72 },
    { name: 'Ceba final', countText: '24 animales', amount: '$5.86 M', progress: 58 }
  ];

  return (
    <div className="row g-4">
      {/* DONUT CHART - DISTRIBUCIÓN POR CATEGORÍA */}
      <div className="col-12 col-lg-5">
        <div className={styles.cardBox}>
          <div className={styles.headerFlex}>
            <div>
              <span className={styles.dbLabel}>COSTOS ASIGNADOS</span>
              <h2 className={styles.cardTitle}>Distribución por categoría</h2>
            </div>

            <select
              className={styles.monthSelect}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="Junio 2025">Junio 2025</option>
              <option value="Mayo 2025">Mayo 2025</option>
            </select>
          </div>

          <div className="d-flex align-items-center gap-4 mt-4 flex-wrap">
            {/* GRÁFICO SVG DONUT */}
            <div className={styles.donutContainer}>
              <svg viewBox="0 0 36 36" className={styles.donutSvg}>
                <path
                  className={styles.donutSegment}
                  stroke="#1e4b27"
                  strokeDasharray="48 52"
                  strokeDashoffset="25"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={styles.donutSegment}
                  stroke="#52796f"
                  strokeDasharray="24 76"
                  strokeDashoffset="-23"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={styles.donutSegment}
                  stroke="#d97706"
                  strokeDasharray="16 84"
                  strokeDashoffset="-47"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={styles.donutSegment}
                  stroke="#cbd5e1"
                  strokeDasharray="12 88"
                  strokeDashoffset="-63"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className={styles.donutCenter}>
                <span className={styles.centerValue}>$26.5 M</span>
                <span className={styles.centerLabel}>ASIGNADO</span>
              </div>
            </div>

            {/* LEYENDA */}
            <div className="d-flex flex-column gap-2">
              {categories.map((c) => (
                <div key={c.name} className="d-flex align-items-center gap-2">
                  <span className={styles.dot} style={{ backgroundColor: c.color }}></span>
                  <div>
                    <div className="fw-bold" style={{ fontSize: '0.85rem' }}>
                      {c.name}
                    </div>
                    <div className={styles.subText}>
                      {c.amount} · {c.percent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOTES CON MAYOR COSTO */}
      <div className="col-12 col-lg-7">
        <div className={styles.cardBox}>
          <div className="mb-3">
            <span className={styles.dbLabel}>POR CENTRO DE COSTO</span>
            <h2 className={styles.cardTitle}>Lotes con mayor costo</h2>
          </div>

          <div className="d-flex flex-column gap-4 mt-3">
            {lotsCost.map((lot) => (
              <div key={lot.name}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <span className="fw-bold d-block" style={{ fontSize: '0.9rem' }}>
                      {lot.name}
                    </span>
                    <span className={styles.subText}>{lot.countText}</span>
                  </div>
                  <span className="fw-bold" style={{ fontSize: '1rem', color: '#0f172a' }}>
                    {lot.amount}
                  </span>
                </div>
                <div className={styles.progressBarBg}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${lot.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostAllocationsTab;