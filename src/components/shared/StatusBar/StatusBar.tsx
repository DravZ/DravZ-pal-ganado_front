import React from 'react';
import styles from './StatusBar.module.css';

interface StatusBarProps {
    /**
     * Determina si el sistema está en línea o en modo offline.
     * true = EN LÍNEA
     * false = MODO OFFLINE ACTIVADO
     */
    isOnline?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isOnline = true }) => {
    return (
        <div
            className={`d-flex align-items-center justify-content-center py-1 px-3 ${styles.statusBarContainer
                } ${isOnline ? styles.online : styles.offline}`}
        >
            <div className="d-flex align-items-center gap-2">
                {/* Ícono de estado */}
                {isOnline ? (
                    <svg
                        className={styles.wifiIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12.55a11 11 0 0 1 14 0" />
                        <path d="M8.5 16.15a6 6 0 0 1 7 0" />
                        <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                    </svg>
                ) : (
                    <svg
                        className={styles.wifiIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                        <path d="M10.71 15.05a6 6 0 0 1 4.79 1.1" />
                        <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                    </svg>
                )}

                {/* Textos Informativos */}
                {isOnline ? (
                    <div>
                        <span className={styles.statusTitle}>EN LÍNEA</span>{' '}
                        <span className={styles.statusSubtitle}>
                            Sincronizando datos con servidor...
                        </span>
                    </div>
                ) : (
                    <div>
                        <span className={styles.statusTitle}>MODO OFFLINE ACTIVADO</span>{' '}
                        <span className={styles.statusSubtitle}>
                            Cambios guardados localmente en cola de sincronización
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusBar;