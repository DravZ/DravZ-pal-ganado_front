import React from 'react';
import styles from './BrandHeroSection.module.css';

export const BrandHeroSection: React.FC = () => {
    return (
        <aside className={styles.heroContainer}>
            <div>
                {/* Logotipo */}
                <div className={styles.brandHeader}>
                    <div className={styles.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                    </div>
                    <span className={styles.brandTitle}>Pa'l Ganado</span>
                </div>

                {/* Hero Copy */}
                <div className="mt-5">
                    <span className={styles.tagBadge}>TRABAJA CON O SIN SEÑAL</span>
                    <h1 className={styles.mainHeading}>
                        Tu finca, bajo <br />
                        control. <br />
                        Donde estés.
                    </h1>
                    <p className={styles.description}>
                        Gestión ganadera sencilla, confiable y diseñada para el trabajo diario en el campo.
                    </p>

                    {/* Características */}
                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <div className={styles.checkIcon}>✓</div>
                            <span>Datos disponibles sin conexión</span>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.checkIcon}>✓</div>
                            <span>Registro rápido desde el potrero</span>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.checkIcon}>✓</div>
                            <span>Sincronización automática y segura</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.footerNote}>
                Hecho para productores ganaderos de Latinoamérica.
            </div>
        </aside>
    );
};