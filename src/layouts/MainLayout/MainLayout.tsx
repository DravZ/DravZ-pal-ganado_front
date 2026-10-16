import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './MainLayout.module.css';
import Navbar from '../../components/shared/Navbar/Navbar';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className={styles.layoutContainer}>
      {/* 1. Navbar Fijo Superior */}
      <Navbar
        currentFarmName="Finca Serra Verde"
        activePath={location.pathname}
      />

      {/* 2. Área principal donde se renderiza la pantalla activa */}
      <main className={styles.contentArea}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;