import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import styles from './WeightHistory.module.css';
import { useFarmScope } from '../../../../../context/FarmScopeContext';
import { useHatoCollection } from '../../../../../services/hatoDataService';

interface WeightHistoryProps {
  animalId: string;
}

export const WeightHistory: React.FC<WeightHistoryProps> = ({ animalId }) => {
  const navigate = useNavigate();
  const { scope } = useFarmScope();
  const { records, isLoading, error } = useHatoCollection<Record<string, unknown>>(
    'weight_records',
    `/weight-records?animal_id=${encodeURIComponent(animalId)}`,
    scope,
  );
  const [timeFilter, setTimeFilter] = useState<'6M' | '1A' | 'Todo'>('1A');
  const weights = [...records].sort((left, right) =>
    String(right.weigh_date ?? right.measured_at ?? '').localeCompare(
      String(left.weigh_date ?? left.measured_at ?? ''),
    ),
  );
  const weightValue = (record: Record<string, unknown>) =>
    Number(record.weight_kg ?? record.weight ?? 0);
  const latestWeight = weights[0] ? weightValue(weights[0]) : 0;
  const oldestWeight = weights.length ? weightValue(weights[weights.length - 1]) : 0;
  const elapsedDays = weights.length > 1
    ? Math.max(1, (Date.parse(String(weights[0].weigh_date ?? weights[0].measured_at))
      - Date.parse(String(weights[weights.length - 1].weigh_date ?? weights[weights.length - 1].measured_at)))
      / 86_400_000)
    : 0;
  const averageDailyGain = elapsedDays ? (latestWeight - oldestWeight) / elapsedDays : 0;
  const chartRecords = [...weights].reverse().slice(-8);
  const chartRange = Math.max(1, ...chartRecords.map(weightValue)) - Math.min(0, ...chartRecords.map(weightValue));
  const points = chartRecords.map((record, index) => {
    const minWeight = Math.min(...chartRecords.map(weightValue));
    const x = chartRecords.length === 1 ? 250 : 30 + index * 440 / (chartRecords.length - 1);
    const y = 110 - ((weightValue(record) - minWeight) / chartRange) * 85;
    return `${x},${y}`;
  }).join(' ');

  const handleRegisterWeight = () => {
    navigate(`/hato/pesajes?animalId=${encodeURIComponent(animalId)}`);
  };

  return (
    <div className={`d-flex flex-column gap-3 ${styles.tabContent}`}>
      {/* 1. Gráfica de Evolución de Peso */}
      <div className={styles.card}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div className={styles.kicker}>CRECIMIENTO · ANIMAL_WEIGHTS</div>
            <h2 className={styles.title}>Evolución de peso</h2>
          </div>

          <div className={styles.filterToggleGroup}>
            <button
              type="button"
              className={`${styles.filterBtn} ${timeFilter === '6M' ? styles.filterBtnActive : ''}`}
              onClick={() => setTimeFilter('6M')}
            >
              6M
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${timeFilter === '1A' ? styles.filterBtnActive : ''}`}
              onClick={() => setTimeFilter('1A')}
            >
              1A
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${timeFilter === 'Todo' ? styles.filterBtnActive : ''}`}
              onClick={() => setTimeFilter('Todo')}
            >
              Todo
            </button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="row g-3 mb-2">
          <div className="col-4 col-md-3 border-end">
            <div className={styles.metricValue}>{latestWeight.toLocaleString('es-CO')} kg</div>
            <div className={styles.metricSub}>Peso actual</div>
          </div>
          <div className="col-4 col-md-3 border-end">
            <div className={styles.metricValue}>
              {weights.length > 1 ? `${(latestWeight - oldestWeight).toLocaleString('es-CO')} kg` : '—'}
            </div>
            <div className={styles.metricSub}>Ganancia en el periodo</div>
          </div>
          <div className="col-4 col-md-3">
            <div className={styles.metricValue}>{averageDailyGain.toFixed(2)} kg/día</div>
            <div className={styles.metricSub}>Ganancia diaria promedio</div>
          </div>
        </div>

        {/* Gráfica SVG */}
        <div className={styles.chartContainer}>
          <svg viewBox="0 0 500 130" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e4b27" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1e4b27" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3" />
            <text x="0" y="24" fill="#94a3b8" fontSize="10">500 kg</text>

            <line x1="20" y1="50" x2="480" y2="50" stroke="#f1f5f9" strokeDasharray="3" />
            <text x="0" y="54" fill="#94a3b8" fontSize="10">450 kg</text>

            <line x1="20" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeDasharray="3" />
            <text x="0" y="84" fill="#94a3b8" fontSize="10">400 kg</text>

            <line x1="20" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeDasharray="3" />
            <text x="0" y="114" fill="#94a3b8" fontSize="10">350 kg</text>

            {chartRecords.length > 1 && (
              <>
                <polygon points={`${points} 470,115 30,115`} fill="url(#weightGrad)" />
                <polyline
                  fill="none"
                  stroke="#1e4b27"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points={points}
                />
              </>
            )}
            {chartRecords.map((record, index) => {
              const x = chartRecords.length === 1 ? 250 : 30 + index * 440 / (chartRecords.length - 1);
              const minWeight = Math.min(...chartRecords.map(weightValue));
              const y = 110 - ((weightValue(record) - minWeight) / chartRange) * 85;
              return <circle key={String(record.id)} cx={x} cy={y} r="5" fill="#ffffff" stroke="#1e4b27" strokeWidth="3" />;
            })}
          </svg>
        </div>
      </div>

      {/* 2. Tabla de Registros */}
      <div className={styles.card}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div className={styles.kicker}>REGISTROS</div>
            <h2 className={styles.title}>Historial de pesos</h2>
          </div>
          <button
            type="button"
            className={styles.btnRegisterWeight}
            onClick={handleRegisterWeight}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className='d-none d-md-block'>Registrar peso</span>
          </button>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>FECHA DE MEDICIÓN</th>
                <th>PESO</th>
                <th>VARIACIÓN</th>
                <th>MÉTODO</th>
                <th>REGISTRADO POR</th>
              </tr>
            </thead>
            <tbody>
              {weights.map((record, index) => {
                const current = weightValue(record);
                const previous = weights[index + 1] ? weightValue(weights[index + 1]) : null;
                return (
                  <tr key={String(record.id)}>
                    <td>{String(record.weigh_date ?? record.measured_at ?? 'Sin fecha')}</td>
                    <td className="font-weight-bold">{current.toLocaleString('es-CO')} kg</td>
                    <td className={styles.variationPositive}>
                      {previous === null ? '—' : `${current - previous > 0 ? '+' : ''}${current - previous} kg`}
                    </td>
                    <td>{String(record.method ?? 'No especificado')}</td>
                    <td>{String(record.user_name ?? '—')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {isLoading && <p role="status">Cargando historial local…</p>}
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  );
};