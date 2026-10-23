import React, { useState } from 'react';
import styles from './MovementsAndSalesPage.module.css';
import TabSelector from './components/TabSelector/TabSelector';
import MovementForm from './components/MovementForm/MovementForm';
import SaleForm from './components/SaleForm/SaleForm';
import SalesHistoryTable from './components/SalesHistoryTable/SalesHistoryTable';

export type ActiveTab = 'MOVEMENT' | 'SALE';

export const MovementsAndSalesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('MOVEMENT');

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado del Módulo */}
      <header className="mb-4">
        <span className={styles.sectionSubtitle}>OPERACIÓN COMERCIAL</span>
        <h1 className={styles.sectionTitle}>Movimientos y ventas</h1>
        <p className={styles.sectionDescription}>
          Traslada ganado entre lotes o registra ventas con múltiples líneas.
        </p>
      </header>

      {/* Pestañas de Cambio de Operación */}
      <div className="row mb-4">
        <div className="col-12 col-lg-8 col-xl-6">
          <TabSelector activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>
      </div>

      {/* Renderizado de Pestaña Activa */}
      <div className={styles.tabContent}>
        {activeTab === 'MOVEMENT' ? (
          <MovementForm />
        ) : (
          <div className="d-flex flex-column gap-4">
            <SaleForm />
            <SalesHistoryTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default MovementsAndSalesPage;