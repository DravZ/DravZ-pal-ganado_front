import React, { useState } from 'react';
import styles from './MovementsAndSalesPage.module.css';
import TabSelector from './components/TabSelector/TabSelector';
import MovementForm from './components/MovementForm/MovementForm';
import SaleForm from './components/SaleForm/SaleForm';
import SalesHistoryTable from './components/SalesHistoryTable/SalesHistoryTable';
import CustomersTab from './components/CustomersTab/CustomersTab';
import CreateCustomerModal from './components/CreateCustomerModal/CreateCustomerModal';

export type ActiveTab = 'MOVEMENT' | 'SALE' | 'CUSTOMERS';

export const MovementsAndSalesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('MOVEMENT');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Record<string, unknown> | null>(null);

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
        {activeTab === 'MOVEMENT' && <MovementForm />}
        {activeTab === 'SALE' && (
          <div className="d-flex flex-column gap-4">
            <SaleForm />
            <SalesHistoryTable />
          </div>
        )}
        {activeTab === 'CUSTOMERS' && (
          <CustomersTab
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onEditCustomer={(customer) => setEditingCustomer(customer)}
          />
        )}
      </div>

      <CreateCustomerModal
        key={editingCustomer ? String(editingCustomer.id) : 'new'}
        isOpen={isCustomerModalOpen || editingCustomer !== null}
        customer={editingCustomer}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
      />
    </div>
  );
};

export default MovementsAndSalesPage;