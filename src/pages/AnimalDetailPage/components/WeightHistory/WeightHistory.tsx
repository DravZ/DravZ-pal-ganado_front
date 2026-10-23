import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import styles from './WeightHistory.module.css';

interface WeightHistoryProps {
  animalId: string;
}

export const WeightHistory: React.FC<WeightHistoryProps> = ({ animalId }) => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<'6M' | '1A' | 'Todo'>('1A');

  const handleRegisterWeight = () => {
    console.log(`[Router Log]: Redirigiendo a registro de peso para animal ${animalId}`);
    navigate(`/hato/pesajes/nuevo?animalId=${animalId}`);
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
            <div className={styles.metricValue}>482 kg</div>
            <div className={styles.metricSub}>Peso actual</div>
          </div>
          <div className="col-4 col-md-3 border-end">
            <div className={styles.metricValue}>+67 kg</div>
            <div className={styles.metricSub}>Ganancia en el periodo</div>
          </div>
          <div className="col-4 col-md-3">
            <div className={styles.metricValue}>0.73 kg/día</div>
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

            <polygon
              points="30,95 180,75 330,55 470,25 470,115 30,115"
              fill="url(#weightGrad)"
            />

            <polyline
              fill="none"
              stroke="#1e4b27"
              strokeWidth="3"
              strokeLinecap="round"
              points="30,95 180,75 330,55 470,25"
            />

            <circle cx="30" cy="95" r="5" fill="#ffffff" stroke="#1e4b27" strokeWidth="3" />
            <circle cx="180" cy="75" r="5" fill="#ffffff" stroke="#1e4b27" strokeWidth="3" />
            <circle cx="330" cy="55" r="5" fill="#ffffff" stroke="#1e4b27" strokeWidth="3" />
            <circle cx="470" cy="25" r="5" fill="#ffffff" stroke="#1e4b27" strokeWidth="3" />

            <text x="30" y="128" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle">
              SEP 2024
            </text>
            <text x="180" y="128" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle">
              DIC 2024
            </text>
            <text x="330" y="128" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle">
              MAR 2025
            </text>
            <text x="470" y="128" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle">
              JUN 2025
            </text>
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
              <tr>
                <td>12 jun 2025</td>
                <td className="font-weight-bold">482 kg</td>
                <td className={styles.variationPositive}>+14 kg</td>
                <td>Báscula digital</td>
                <td>Rafael Mendes</td>
              </tr>
              <tr>
                <td>14 mar 2025</td>
                <td className="font-weight-bold">468 kg</td>
                <td className={styles.variationPositive}>+21 kg</td>
                <td>Báscula digital</td>
                <td>Laura Gómez</td>
              </tr>
              <tr>
                <td>11 dic 2024</td>
                <td className="font-weight-bold">447 kg</td>
                <td className={styles.variationPositive}>+32 kg</td>
                <td>Cinta métrica</td>
                <td>Rafael Mendes</td>
              </tr>
              <tr>
                <td>08 sep 2024</td>
                <td className="font-weight-bold">415 kg</td>
                <td className="text-secondary">—</td>
                <td>Báscula digital</td>
                <td>Rafael Mendes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};