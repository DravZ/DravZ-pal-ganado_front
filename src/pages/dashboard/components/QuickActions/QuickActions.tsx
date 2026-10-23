import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Scale, Syringe, Bell } from 'lucide-react';
import styles from './QuickActions.module.css';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="mb-4">
      <div className={styles.sectionHeaderFlex}>
        <div>
          <div className={styles.sectionKicker}>ACCIONES DE CAMPO</div>
          <h2 className={styles.sectionTitle}>¿Qué necesitas registrar?</h2>
        </div>
        <span className={`${styles.accessNote} d-none d-sm-inline`}>
          Acceso directo, incluso sin señal
        </span>
      </div>

      <div className="row g-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => navigate('/hato/nuevo')}
          >
            <div className={styles.actionIconSquare}>
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <span>Nuevo animal</span>
          </button>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => navigate('/hato/pesajes')}
          >
            <div className={styles.actionIconSquare}>
              <Scale size={20} strokeWidth={2.5} />
            </div>
            <span>Registrar peso</span>
          </button>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => navigate('/salud/tratamientos')}
          >
            <div className={styles.actionIconSquare}>
              <Syringe size={20} strokeWidth={2.5} />
            </div>
            <span>Aplicar tratamiento</span>
          </button>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => navigate('/admin/alertas')}
          >
            <div className={styles.actionIconSquare}>
              <Bell size={20} strokeWidth={2.5} />
            </div>
            <span>Alertas activas</span>
          </button>
        </div>
      </div>
    </section>
  );
};