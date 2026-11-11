import React, { useMemo } from 'react';
import styles from './DashboardPage.module.css';
import { StatCards } from './components/StatCards/StatCards';
import { QuickActions } from './components/QuickActions/QuickActions';
import { ActiveAlerts } from './components/ActiveAlerts/ActiveAlerts';
import { HerdPerformance } from './components/HerdPerformance/HerdPerformance';
import { useAuth } from '../../context/AuthContext';
import { useFarmScope } from '../../context/FarmScopeContext';
import { useHatoCollection } from '../../services/hatoDataService';

interface DashboardAlert {
  id: string;
  category: string;
  severity: string;
  title: string;
  message: string;
  detectedAt: string;
  dueDate?: string;
}

function field(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function numberField(record: Record<string, unknown>, ...keys: string[]): number {
  const value = Number(field(record, ...keys));
  return Number.isFinite(value) ? value : 0;
}

function isActiveAnimal(animal: Record<string, unknown>): boolean {
  const status = String(field(animal, 'status') ?? '').trim().toLowerCase();
  return !['inactive', 'inactivo', 'baja', 'sold', 'vendido', 'deceased', 'muerto', 'eliminado']
    .includes(status);
}

function alertCategory(type: string): string {
  const normalized = type.toLowerCase();
  if (normalized.includes('stock') || normalized.includes('inventar')) return 'Inventario';
  if (normalized.includes('repro') || normalized.includes('parto')) return 'Reproducción';
  if (normalized.includes('vacun') || normalized.includes('sanit')) return 'Sanidad';
  return 'Salud';
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeFarm, scope } = useFarmScope();
  const animals = useHatoCollection<Record<string, unknown>>('animals', '/animals', scope);
  const alerts = useHatoCollection<Record<string, unknown>>('alerts', '/alerts', scope);
  const inventories = useHatoCollection<Record<string, unknown>>('inventories', '/inventories', scope);

  const activeAnimals = useMemo(
    () => animals.records.filter(isActiveAnimal),
    [animals.records],
  );
  const openAlerts = useMemo<DashboardAlert[]>(() => alerts.records
    .filter((record) => String(field(record, 'status') ?? '').toLowerCase() === 'open')
    .map((record) => {
      const alertType = String(field(record, 'alert_type', 'alertType') ?? 'SALUD');
      const detectedAt = String(field(record, 'detected_at', 'detectedAt') ?? '');
      const dueDate = field(record, 'due_date', 'dueDate');
      return {
        id: String(field(record, 'id') ?? ''),
        category: alertCategory(alertType),
        severity: String(field(record, 'severity') ?? 'MEDIA'),
        title: String(field(record, 'title') ?? alertType),
        message: String(field(record, 'message') ?? ''),
        detectedAt,
        dueDate: typeof dueDate === 'string' ? dueDate : undefined,
      };
    })
    .sort((left, right) => {
      const leftDate = Date.parse(left.dueDate ?? left.detectedAt);
      const rightDate = Date.parse(right.dueDate ?? right.detectedAt);
      return (Number.isFinite(leftDate) ? leftDate : 0) - (Number.isFinite(rightDate) ? rightDate : 0);
    }), [alerts.records]);
  const lowStockCount = useMemo(() => inventories.records.filter((inventory) => {
    const minimum = numberField(inventory, 'minStock', 'min_stock');
    return minimum > 0 && numberField(inventory, 'quantity') <= minimum;
  }).length, [inventories.records]);
  const averageWeight = useMemo(() => {
    const weights = activeAnimals
      .map((animal) => numberField(animal, 'currentWeight', 'current_weight'))
      .filter((weight) => weight > 0);
    return weights.length
      ? weights.reduce((sum, weight) => sum + weight, 0) / weights.length
      : null;
  }, [activeAnimals]);
  const isLoading = animals.isLoading || alerts.isLoading || inventories.isLoading;
  const errors = [animals.error, alerts.error, inventories.error].filter(Boolean);
  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Buenos días' : today.getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className={styles.dashboardContainer}>
      <div className="mb-4">
        <div className={styles.headerDate}>
          {today.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 className={styles.welcomeTitle}>{greeting}, {user?.name?.split(' ')[0] ?? 'bienvenido'}</h1>
        <p className={styles.welcomeSubtext}>
          {activeFarm
            ? `Esto es lo más importante para hoy en ${activeFarm.name}.`
            : 'Selecciona una finca para consultar su resumen.'}
        </p>
      </div>

      {errors.length > 0 && (
        <p className="alert alert-warning" role="status">
          No se pudieron actualizar algunos datos del dashboard: {errors.join(' ')}
          {' '}Se muestran los datos guardados en este dispositivo.
        </p>
      )}

      <StatCards
        animalCount={activeAnimals.length}
        alertCount={openAlerts.length}
        urgentAlertCount={openAlerts.filter((alert) =>
          ['ALTA', 'CRÍTICA', 'CRITICA'].includes(alert.severity.toUpperCase()),
        ).length}
        lowStockCount={lowStockCount}
        farmName={activeFarm?.name ?? ''}
        isLoading={isLoading}
      />
      <QuickActions />

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <ActiveAlerts alerts={openAlerts.slice(0, 4)} isLoading={isLoading} />
        </div>
        <div className="col-12 col-lg-5">
          <HerdPerformance averageWeight={averageWeight} weighedAnimalCount={
            activeAnimals.filter((animal) => numberField(animal, 'currentWeight', 'current_weight') > 0).length
          } />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;