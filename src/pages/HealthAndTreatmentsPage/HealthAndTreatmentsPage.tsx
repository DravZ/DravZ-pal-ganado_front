import React, { useState } from 'react';
import styles from './HealthAndTreatmentsPage.module.css';
import HealthTabSelector from './components/HealthTabSelector/HealthTabSelector';
import EventsAndTreatmentsTab from './components/EventsAndTreatmentsTab/EventsAndTreatmentsTab';
import VaccinationTab from './components/VaccinationTab/VaccinationTab';
import { Plus } from 'lucide-react';
import MedicationsTab from './components/MedicationsTab/MedicationsTab';

export type HealthTabType = 'EVENTS' | 'VACCINATION' | 'MEDICATIONS';

export const HealthAndTreatmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HealthTabType>('EVENTS');

  const getActionButtonText = () => {
    switch (activeTab) {
      case 'EVENTS':
        return 'Nuevo evento';
      case 'VACCINATION':
        return 'Registrar vacuna';
      case 'MEDICATIONS':
        return 'Nuevo medicamento';
    }
  };

  const handlePrimaryAction = () => {
    console.log(`[Action Log]: Nueva acción iniciada para la pestaña ${activeTab}`);
  };

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      {/* Encabezado con Título y Botón Principal */}
      <header className={styles.headerFlex}>
        <div>
          <span className={styles.sectionSubtitle}>MANEJO SANITARIO</span>
          <h1 className={styles.sectionTitle}>Salud y tratamientos</h1>
          <p className={styles.sectionDescription}>
            Controla eventos clínicos, medicamentos, tratamientos y vacunación.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={handlePrimaryAction}
        >
          <Plus size={18} />
          <span className={styles.btnText}>{getActionButtonText()}</span>
        </button>
      </header>

      {/* Selector de Pestañas Sanitarias */}
      <div className="mb-4">
        <HealthTabSelector activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* Vistas según Pestaña Activa */}
      <div className={styles.tabContent}>
        {activeTab === 'EVENTS' && <EventsAndTreatmentsTab />}
        {activeTab === 'VACCINATION' && <VaccinationTab />}
        {activeTab === 'MEDICATIONS' && <MedicationsTab />}
      </div>
    </div>
  );
};

export default HealthAndTreatmentsPage;