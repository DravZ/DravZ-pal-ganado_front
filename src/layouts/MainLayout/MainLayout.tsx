import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './MainLayout.module.css';
import Navbar from '../../components/shared/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import useNotification from '../../hooks/useNotification';
import { FarmScopeProvider, useFarmScope } from '../../context/FarmScopeContext';
import { flushPendingHatoOperations } from '../../services/hatoDataService';

const MainLayoutContent: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const { farms, activeFarm, setActiveFarmId } = useFarmScope();

  useEffect(() => {
    if (!user) return undefined;
    const processQueue = () => {
      void flushPendingHatoOperations(user.id).catch((error: unknown) => {
        showNotification({
          type: 'error',
          title: 'No se pudieron sincronizar los cambios',
          message: error instanceof Error ? error.message : 'Los cambios siguen guardados en este dispositivo.',
        });
      });
    };

    if (navigator.onLine) processQueue();
    window.addEventListener('online', processQueue);
    return () => window.removeEventListener('online', processQueue);
  }, [showNotification, user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'No se pudo cerrar la sesión',
        message: error instanceof Error ? error.message : 'Conéctate a internet e inténtalo de nuevo.',
      });
    }
  };

  const initials = user?.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') ?? '';

  return (
    <div className={styles.layoutContainer}>
      {/* 1. Navbar Fijo Superior */}
      <Navbar
        currentFarmName={activeFarm?.name ?? 'Sin fincas disponibles'}
        activeFarmId={activeFarm?.id ?? null}
        activePath={location.pathname}
        user={user ? { name: user.name, email: user.email, initials } : undefined}
        farms={farms}
        onSelectFarm={(farm) => setActiveFarmId(farm.id)}
        onLogout={handleLogout}
      />

      {/* 2. Área principal donde se renderiza la pantalla activa */}
      <main className={styles.contentArea}>
        <Outlet />
      </main>
    </div>
  );
};

export const MainLayout: React.FC = () => (
  <FarmScopeProvider>
    <MainLayoutContent />
  </FarmScopeProvider>
);

export default MainLayout;