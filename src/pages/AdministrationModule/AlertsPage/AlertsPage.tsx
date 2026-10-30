import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AlertsPage.module.css';
import type { Alert } from '../../../types/database.types';

// Subcomponentes
import AlertsHeader from './components/AlertsHeader/AlertsHeader';
import AlertsFilterTabs from './components/AlertsFilterTabs/AlertsFilterTabs';
import AlertCard from './components/AlertCard/AlertCard';

export type AlertFilterType = 'ALL' | 'CRITICAL' | 'HIGH' | 'UPCOMING';

export interface AlertUIItem extends Alert {
  category: 'Salud' | 'Inventario' | 'Reproducción' | 'Sanidad' | string;
  time_label: string;
}

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AlertFilterType>('ALL');

  // Datos mock alineados con database.types.ts
  const [alerts, setAlerts] = useState<AlertUIItem[]>([
    {
      id: 'alert-1',
      farm_id: 'farm-serra-verde',
      alert_type: 'RETIRO_SANITARIO',
      severity: 'CRÍTICA',
      title: 'Retiro sanitario vigente',
      message: 'BR-1088 no puede venderse para carne hasta el 23 de junio.',
      detected_at: new Date().toISOString(),
      status: 'open',
      category: 'Salud',
      time_label: 'Vence en 7 días'
    },
    {
      id: 'alert-2',
      farm_id: 'farm-serra-verde',
      alert_type: 'STOCK_BAJO',
      severity: 'ALTA',
      title: 'Stock bajo: Sal mineralizada',
      message: 'Existencia actual de 18 bultos, por debajo del mínimo de 25.',
      detected_at: new Date().toISOString(),
      status: 'open',
      category: 'Inventario',
      time_label: 'Atender hoy'
    },
    {
      id: 'alert-3',
      farm_id: 'farm-serra-verde',
      alert_type: 'PARTO_ESPERADO',
      severity: 'MEDIA',
      title: 'Parto esperado próximo',
      message: 'BR-1042 · Esperanza tiene fecha esperada de parto el 19 de junio.',
      detected_at: new Date().toISOString(),
      status: 'open',
      category: 'Reproducción',
      time_label: 'En 3 días'
    },
    {
      id: 'alert-4',
      farm_id: 'farm-serra-verde',
      alert_type: 'VACUNACION_PROGRAMADA',
      severity: 'MEDIA',
      title: 'Vacunación programada',
      message: '12 animales del lote Vacas de cría requieren vacuna clostridial.',
      detected_at: new Date().toISOString(),
      status: 'open',
      category: 'Sanidad',
      time_label: '18 jun 2025'
    }
  ]);

  // Contadores dinámicos para los tabs
  const counts = useMemo(() => {
    return {
      all: alerts.length,
      critical: alerts.filter((a) => a.severity === 'CRÍTICA').length,
      high: alerts.filter((a) => a.severity === 'ALTA').length,
      upcoming: alerts.filter((a) => a.severity === 'MEDIA' || a.severity === 'BAJA').length
    };
  }, [alerts]);

  // Filtrado según tab seleccionada
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (activeTab === 'CRITICAL') return a.severity === 'CRÍTICA';
      if (activeTab === 'HIGH') return a.severity === 'ALTA';
      if (activeTab === 'UPCOMING') return a.severity === 'MEDIA' || a.severity === 'BAJA';
      return true;
    });
  }, [alerts, activeTab]);

  // Acción de resolver alerta
  const handleResolve = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado con contador general */}
      <AlertsHeader pendingCount={counts.all} />

      {/* Selector de pestañas / Filtros */}
      <AlertsFilterTabs
        activeTab={activeTab}
        counts={counts}
        onTabChange={setActiveTab}
      />

      {/* Lista de Tarjetas de Alerta */}
      <div className={styles.alertsList}>
        {filteredAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onDetail={() => navigate(`/alertas/${alert.id}`)}
            onResolve={() => handleResolve(alert.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;