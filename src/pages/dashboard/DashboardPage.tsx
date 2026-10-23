import React from 'react';
import styles from './DashboardPage.module.css';
import { StatCards } from './components/StatCards/StatCards';
import { QuickActions } from './components/QuickActions/QuickActions';
import { ActiveAlerts } from './components/ActiveAlerts/ActiveAlerts';
import { HerdPerformance } from './components/HerdPerformance/HerdPerformance';

export const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      {/* Saludo y Fecha */}
      <div className="mb-4">
        <div className={styles.headerDate}>LUNES, 16 DE JUNIO</div>
        <h1 className={styles.welcomeTitle}>Buenos días, Rafael</h1>
        <p className={styles.welcomeSubtext}>
          Esto es lo más importante para hoy en Finca Serra Verde.
        </p>
      </div>

      {/* 1. Métricas (StatCards) */}
      <StatCards />

      {/* 2. Acciones Rápidas (QuickActions) */}
      <QuickActions />

      {/* 3. Sección Inferior: Alertas y Rendimiento */}
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <ActiveAlerts />
        </div>
        <div className="col-12 col-lg-5">
          <HerdPerformance />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;