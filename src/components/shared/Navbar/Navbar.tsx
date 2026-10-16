import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, Bell, ShieldCheck } from 'lucide-react';
import { NavigationDrawer } from '../NavigationDrawer/NavigationDrawer';
import styles from './Navbar.module.css';

interface NavbarProps {
    currentFarmName?: string;
    activePath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
    currentFarmName = 'Finca Serra Verde',
    activePath = '/dashboard',
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleBrandClick = () => {
        console.log('[Router Log]: Navegando a Dashboard');
        navigate('/dashboard');
    };

    const handleProfileClick = () => {
        console.log('[Router Log]: Navegando a Perfil');
        navigate('/profile');
    };

    return (
        <>
            <header className={styles.navbarContainer}>
                {/* Grupo Izquierdo: Menú, Logo y Selector de Finca */}
                <div className={styles.leftGroup}>
                    {/* Botón Hamburguesa */}
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={() => setIsDrawerOpen(true)}
                        aria-label="Abrir menú de navegación"
                    >
                        <Menu size={20} strokeWidth={2.2} />
                    </button>

                    {/* Logo Pa'l Ganado */}
                    <div className={styles.brandLogo} onClick={handleBrandClick}>
                        <div className={styles.logoBadge}>
                            <ShieldCheck size={20} strokeWidth={2.2} />
                        </div>
                        <span className="d-none d-sm-inline">Pa'l Ganado</span>
                    </div>

                    {/* Selector de Finca */}
                    <button
                        type="button"
                        className={`${styles.farmSelectorButton} ms-1 ms-sm-2`}
                        onClick={() => console.log('[Action Log]: Selector de finca cliqueado')}
                    >
                        <div>
                            <div className={styles.farmLabel}>FINCA ACTUAL</div>
                            <div className={styles.farmValue}>{currentFarmName}</div>
                        </div>
                        <ChevronDown size={16} strokeWidth={2.2} className="text-secondary" />
                    </button>
                </div>

                {/* Grupo Derecho: Notificaciones y Perfil */}
                <div className={styles.rightGroup}>
                    <button
                        type="button"
                        className={styles.notificationButton}
                        onClick={() => console.log('[Action Log]: Centro de alertas cliqueado')}
                        aria-label="Notificaciones"
                    >
                        <Bell size={18} strokeWidth={2} />
                        <span className={styles.notificationBadge}>4</span>
                    </button>

                    {/* Avatar del perfil (RM) */}
                    <div className={styles.userAvatar} onClick={handleProfileClick} title="Mi Perfil">
                        RM
                    </div>
                </div>
            </header>

            {/* Menú Desplegable Lateral */}
            <NavigationDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                activePath={activePath}
            />
        </>
    );
};

export default Navbar;