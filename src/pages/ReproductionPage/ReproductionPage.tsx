import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { MetricCards } from './components/MetricCards/MetricCards';
import { GestationCalendar } from './components/GestationCalendar/GestationCalendar';
import { UpcomingBirths } from './components/UpcomingBirths/UpcomingBirths';
import { RegisterReproductiveEventModal } from './components/RegisterReproductiveEventModal/RegisterReproductiveEventModal';
import styles from './ReproductionPage.module.css';

export const ReproductionPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className={styles.pageWrapper}>
      {/* Encabezado Superior */}
      <div className={`d-flex align-items-start justify-content-between mb-4 ${styles.pageHeaderFlex}`}>
        <div>
          <div className={styles.kickerText}>MANEJO REPRODUCTIVO</div>
          <h1 className={styles.pageTitle}>Reproducción</h1>
          <p className={styles.subText}>
            Monitorea servicios, gestaciones y fechas esperadas de parto.
          </p>
        </div>

        {/* Botón Principal */}
        <button
          type="button"
          className={styles.btnPrimaryAction}
          onClick={handleOpenModal}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Registrar evento</span>
        </button>
      </div>

      {/* 1. Tarjetas de Métricas */}
      <div className="mb-4">
        <MetricCards />
      </div>

      {/* 2. Grid Dividido */}
      <div className="row g-3">
        <div className="col-12 col-lg-7 col-xl-8">
          <GestationCalendar onOpenModal={handleOpenModal} />
        </div>
        <div className="col-12 col-lg-5 col-xl-4">
          <UpcomingBirths />
        </div>
      </div>

      {/* Modal Interactivo de Registro de Evento */}
      <RegisterReproductiveEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          console.log('[App State]: Evento registrado exitosamente. Refrescando datos...');
        }}
      />
    </div>
  );
};

export default ReproductionPage;