import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    ChevronDown,
    Bell,
    ShieldCheck,
    User as UserIcon,
    Settings,
    Users,
    LogOut,
    Check
} from 'lucide-react';
import { NavigationDrawer } from '../NavigationDrawer/NavigationDrawer';
import styles from './Navbar.module.css';

export interface FarmOption {
    id: string;
    name: string;
}

interface NavbarProps {
    currentFarmName?: string;
    activePath?: string;
    user?: {
        name: string;
        email: string;
        initials: string;
    };
    farms?: FarmOption[];
    onSelectFarm?: (farm: FarmOption) => void;
    onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    currentFarmName = 'Finca Serra Verde',
    activePath = '/dashboard',
    user = {
        name: 'Rafael Mendes',
        email: 'rafael@serraverde.com',
        initials: 'RM'
    },
    farms = [
        { id: 'farm-1', name: 'Finca Serra Verde' },
        { id: 'farm-2', name: 'Finca El Porvenir' }
    ],
    onSelectFarm,
    onLogout
}) => {
    // Estado local para controlar la finca actualmente seleccionada
    const [selectedFarm, setSelectedFarm] = useState<string>(currentFarmName);

    // Estados de apertura de desplegables
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
    const [isFarmMenuOpen, setIsFarmMenuOpen] = useState<boolean>(false);

    const navigate = useNavigate();

    // Referencias para detectar clics fuera de los menús desplegables
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const farmDropdownRef = useRef<HTMLDivElement>(null);

    // Actualizar el estado si el prop externo cambia
    useEffect(() => {
        setSelectedFarm(currentFarmName);
    }, [currentFarmName]);

    // Listener para cerrar los menús al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target as Node)
            ) {
                setIsProfileMenuOpen(false);
            }
            if (
                farmDropdownRef.current &&
                !farmDropdownRef.current.contains(event.target as Node)
            ) {
                setIsFarmMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleBrandClick = () => {
        console.log('[Router Log]: Navegando a Dashboard');
        navigate('/dashboard');
    };

    // Función que cambia efectivamente la finca en pantalla
    const handleSelectFarmItem = (farm: FarmOption) => {
        setSelectedFarm(farm.name); // <- Cambia el valor mostrado
        setIsFarmMenuOpen(false);   // <- Cierra el desplegable

        if (onSelectFarm) {
            onSelectFarm(farm);
        } else {
            console.log(`[Action Log]: Finca seleccionada -> ${farm.name}`);
        }
    };

    const handleNavigateMenu = (path: string) => {
        setIsProfileMenuOpen(false);
        navigate(path);
    };

    const handleLogoutAction = () => {
        setIsProfileMenuOpen(false);
        if (onLogout) {
            onLogout();
        } else {
            console.log('[Action Log]: Cerrando sesión...');
            navigate('/');
        }
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

                    {/* Selector de Finca Dropdown */}
                    <div className={styles.dropdownWrapper} ref={farmDropdownRef}>
                        <button
                            type="button"
                            className={styles.farmSelectorButton}
                            onClick={() => setIsFarmMenuOpen(!isFarmMenuOpen)}
                            title={selectedFarm}
                            aria-expanded={isFarmMenuOpen}
                        >
                            <div className={styles.farmTextWrapper}>
                                <div className={styles.farmLabel}>FINCA ACTUAL</div>
                                <div className={styles.farmValue}>{selectedFarm}</div>
                            </div>
                            <ChevronDown
                                size={14}
                                strokeWidth={2.2}
                                className={`text-secondary flex-shrink-0 ${isFarmMenuOpen ? styles.rotateIcon : ''}`}
                            />
                        </button>

                        {/* Menú Desplegable de Fincas */}
                        {isFarmMenuOpen && (
                            <div className={styles.farmDropdownMenu}>
                                <div className={styles.dropdownHeaderLabel}>Seleccionar finca</div>
                                {farms.map((farm) => {
                                    const isSelected = farm.name === selectedFarm;
                                    return (
                                        <button
                                            key={farm.id}
                                            type="button"
                                            className={`${styles.farmOptionItem} ${isSelected ? styles.farmOptionSelected : ''}`}
                                            onClick={() => handleSelectFarmItem(farm)}
                                        >
                                            <span>{farm.name}</span>
                                            {isSelected && <Check size={16} className={styles.checkIcon} />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grupo Derecho: Notificaciones y Perfil */}
                <div className={styles.rightGroup}>
                    <button
                        type="button"
                        className={styles.notificationButton}
                        onClick={() => navigate('/admin/alertas')}
                        aria-label="Notificaciones"
                    >
                        <Bell size={18} strokeWidth={2} />
                        <span className={styles.notificationBadge}>4</span>
                    </button>

                    {/* Avatar y Menú Desplegable de Perfil */}
                    <div className={styles.dropdownWrapper} ref={profileDropdownRef}>
                        <button
                            type="button"
                            className={styles.avatarButton}
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            aria-expanded={isProfileMenuOpen}
                            title="Mi Cuenta"
                        >
                            <div className={styles.userAvatar}>{user.initials}</div>
                            <ChevronDown size={14} strokeWidth={2.2} className="text-secondary d-none d-sm-block" />
                        </button>

                        {/* Menú Desplegable del Usuario */}
                        {isProfileMenuOpen && (
                            <div className={styles.profileDropdownMenu}>
                                {/* Cabecera del Usuario */}
                                <div className={styles.userMenuHeader}>
                                    <div className={styles.userMenuAvatar}>{user.initials}</div>
                                    <div className={styles.userMenuDetails}>
                                        <div className={styles.userMenuName}>{user.name}</div>
                                        <div className={styles.userMenuEmail}>{user.email}</div>
                                    </div>
                                </div>

                                <div className={styles.dropdownDivider} />

                                {/* Enlaces de Opciones */}
                                <button
                                    type="button"
                                    className={styles.menuOptionItem}
                                    onClick={() => handleNavigateMenu('/perfil')}
                                >
                                    <UserIcon size={16} />
                                    <span>Mi perfil</span>
                                </button>

                                <button
                                    type="button"
                                    className={styles.menuOptionItem}
                                    onClick={() => handleNavigateMenu('/admin/configuracion')}
                                >
                                    <Settings size={16} />
                                    <span>Configuración de organización</span>
                                </button>

                                <button
                                    type="button"
                                    className={styles.menuOptionItem}
                                    onClick={() => handleNavigateMenu('/admin/usuarios')}
                                >
                                    <Users size={16} />
                                    <span>Administrar usuarios</span>
                                </button>

                                <div className={styles.dropdownDivider} />

                                {/* Botón Cerrar Sesión */}
                                <button
                                    type="button"
                                    className={`${styles.menuOptionItem} ${styles.logoutOption}`}
                                    onClick={handleLogoutAction}
                                >
                                    <LogOut size={16} />
                                    <span>Cerrar sesión</span>
                                </button>
                            </div>
                        )}
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