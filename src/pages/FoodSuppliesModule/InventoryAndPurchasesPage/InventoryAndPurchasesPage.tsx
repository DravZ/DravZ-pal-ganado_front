import React, { useState } from 'react';
import styles from './InventoryAndPurchasesPage.module.css';
import InventoryTabSelector from './components/InventoryTabSelector/InventoryTabSelector';
import ProductsTab from './components/ProductsTab/ProductsTab';
import PurchasesTab from './components/PurchasesTab/PurchasesTab';
import CreateProductModal from './components/CreateProductModal/CreateProductModal';
import RegisterPurchaseModal from './components/RegisterPurchaseModal/RegisterPurchaseModal';
import { Plus } from 'lucide-react';

export type InventoryTabType = 'PRODUCTS' | 'PURCHASES';

export const InventoryAndPurchasesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InventoryTabType>('PRODUCTS');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* ENCABEZADO Y ACCIONES PRINCIPALES */}
      <header className={styles.headerFlex}>
        <div>
          <span className={styles.sectionSubtitle}>INVENTARIO Y COMPRAS</span>
          <h1 className={styles.sectionTitle}>
            {activeTab === 'PRODUCTS' ? 'Catálogo de productos' : 'Historial de compras'}
          </h1>
          <p className={styles.sectionDescription}>
            Controla existencias, alertas de mínimo y entradas de inventario.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => {
            if (activeTab === 'PRODUCTS') {
              setIsProductModalOpen(true);
            } else {
              setIsPurchaseModalOpen(true);
            }
          }}
        >
          <Plus size={18} />
          <span>{activeTab === 'PRODUCTS' ? 'Nuevo producto' : 'Registrar compra'}</span>
        </button>
      </header>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="mb-4">
        <InventoryTabSelector activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* CONTENIDO DE PESTAÑA ACTIVA */}
      <div>
        {activeTab === 'PRODUCTS' && (
          <ProductsTab
            onOpenProductModal={() => setIsProductModalOpen(true)}
            onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
          />
        )}
        {activeTab === 'PURCHASES' && (
          <PurchasesTab onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)} />
        )}
      </div>

      {/* MODALES EMERGENTES */}
      <CreateProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      <RegisterPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
};

export default InventoryAndPurchasesPage;