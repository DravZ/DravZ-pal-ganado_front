import React, { useState } from 'react';
import styles from './FeedingAndProductionPage.module.css';
import FeedingTabSelector from './components/FeedingTabSelector/FeedingTabSelector';
import FeedingRecordsTab from './components/FeedingRecordsTab/FeedingRecordsTab';
import ProductionRecordsTab from './components/ProductionRecordsTab/ProductionRecordsTab';
import RegisterFeedingModal from './components/RegisterFeedingModal/RegisterFeedingModal';
import RegisterProductionModal from './components/RegisterProductionModal/RegisterProductionModal';
import { Plus } from 'lucide-react';

export type FeedingTabType = 'FEEDING' | 'PRODUCTION';

export const FeedingAndProductionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedingTabType>('FEEDING');
  const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);

  const handleOpenPrimaryModal = () => {
    if (activeTab === 'FEEDING') {
      setIsFeedingModalOpen(true);
    } else {
      setIsProductionModalOpen(true);
    }
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* ENCABEZADO CON TÍTULO Y BOTÓN DE ACCIÓN */}
      <header className={styles.headerFlex}>
        <div>
          <span className={styles.sectionSubtitle}>OPERACIÓN PRODUCTIVA</span>
          <h1 className={styles.sectionTitle}>Alimentación y producción</h1>
          <p className={styles.sectionDescription}>
            Registra consumos, costos y producción diaria por lote o animal.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={handleOpenPrimaryModal}
        >
          <Plus size={18} />
          <span className={styles.btnText}>
            {activeTab === 'FEEDING' ? 'Registrar alimentación' : 'Registrar producción'}
          </span>
        </button>
      </header>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="mb-4">
        <FeedingTabSelector activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
      <div>
        {activeTab === 'FEEDING' && (
          <FeedingRecordsTab onOpenModal={() => setIsFeedingModalOpen(true)} />
        )}
        {activeTab === 'PRODUCTION' && (
          <ProductionRecordsTab onOpenModal={() => setIsProductionModalOpen(true)} />
        )}
      </div>

      {/* MODALES EMERGENTES */}
      <RegisterFeedingModal
        isOpen={isFeedingModalOpen}
        onClose={() => setIsFeedingModalOpen(false)}
      />

      <RegisterProductionModal
        isOpen={isProductionModalOpen}
        onClose={() => setIsProductionModalOpen(false)}
      />
    </div>
  );
};

export default FeedingAndProductionPage;