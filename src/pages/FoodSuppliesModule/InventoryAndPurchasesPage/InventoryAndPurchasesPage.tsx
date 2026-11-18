import React, { useState } from 'react';
import styles from './InventoryAndPurchasesPage.module.css';
import InventoryTabSelector from './components/InventoryTabSelector/InventoryTabSelector';
import ProductsTab from './components/ProductsTab/ProductsTab';
import PurchasesTab from './components/PurchasesTab/PurchasesTab';
import SuppliersTab from './components/SuppliersTab/SuppliersTab';
import CreateProductModal from './components/CreateProductModal/CreateProductModal';
import CreateSupplierModal from './components/CreateSupplierModal/CreateSupplierModal';
import RegisterPurchaseModal from './components/RegisterPurchaseModal/RegisterPurchaseModal';
import { Plus, Truck } from 'lucide-react';

export type InventoryTabType = 'PRODUCTS' | 'PURCHASES' | 'SUPPLIERS';

const TAB_TITLES: Record<InventoryTabType, string> = {
  PRODUCTS: 'Catálogo de productos',
  PURCHASES: 'Historial de compras',
  SUPPLIERS: 'Directorio de proveedores',
};

export const InventoryAndPurchasesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InventoryTabType>('PRODUCTS');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Record<string, unknown> | null>(null);

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* ENCABEZADO Y ACCIONES PRINCIPALES */}
      <header className={styles.headerFlex}>
        <div>
          <span className={styles.sectionSubtitle}>INVENTARIO Y COMPRAS</span>
          <h1 className={styles.sectionTitle}>{TAB_TITLES[activeTab]}</h1>
          <p className={styles.sectionDescription}>
            Controla existencias, alertas de mínimo y entradas de inventario.
          </p>
        </div>

        <div className={styles.headerActions}>
          {activeTab !== 'SUPPLIERS' && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setIsSupplierModalOpen(true)}
            >
              <Truck size={18} />
              <span>Nuevo proveedor</span>
            </button>
          )}

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              if (activeTab === 'PRODUCTS') {
                setIsProductModalOpen(true);
              } else if (activeTab === 'PURCHASES') {
                setIsPurchaseModalOpen(true);
              } else {
                setIsSupplierModalOpen(true);
              }
            }}
          >
            <Plus size={18} />
            <span>
              {activeTab === 'PRODUCTS'
                ? 'Nuevo producto'
                : activeTab === 'PURCHASES'
                  ? 'Registrar compra'
                  : 'Nuevo proveedor'}
            </span>
          </button>
        </div>
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
        {activeTab === 'SUPPLIERS' && (
          <SuppliersTab
            onOpenSupplierModal={() => setIsSupplierModalOpen(true)}
            onEditSupplier={(supplier) => setEditingSupplier(supplier)}
          />
        )}
      </div>

      {/* MODALES EMERGENTES */}
      <CreateProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      <CreateSupplierModal
        key={editingSupplier ? String(editingSupplier.id) : 'new'}
        isOpen={isSupplierModalOpen || editingSupplier !== null}
        supplier={editingSupplier}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setEditingSupplier(null);
        }}
      />

      <RegisterPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
};

export default InventoryAndPurchasesPage;