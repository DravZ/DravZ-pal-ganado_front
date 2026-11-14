import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    ChevronDown,
    Bell,
    RefreshCw,
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
    activeFarmId?: string | null;
    user?: {
        name: string;
        email: string;
        initials: string;
    };
    farms?: FarmOption[];
    onSelectFarm?: (farm: FarmOption) => void;
    onLogout?: () => void;
    pendingSyncCount?: number;
    alertCount?: number;
    isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
    currentFarmName,
    activeFarmId,
    activePath = '/dashboard',
    isAdmin = false,
    user = {
        name: 'Rafael Mendes',
        email: 'rafael@serraverde.com',
        initials: 'RM'
    },
    farms = [],
    onSelectFarm,
    onLogout,
    pendingSyncCount = 0,
    alertCount = 0
}) => {
    const sortedFarms = [...farms].sort((left, right) =>
        left.name.localeCompare(right.name, 'es', { sensitivity: 'base' }),
    );
    const defaultFarmName = sortedFarms[0]?.name ?? 'Sin fincas disponibles';

    const selectedFarm = sortedFarms.find((farm) => farm.id === activeFarmId) ?? sortedFarms[0];
    const selectedFarmName = selectedFarm?.name ?? currentFarmName ?? defaultFarmName;

    // Estados de apertura de desplegables
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
    const [isFarmMenuOpen, setIsFarmMenuOpen] = useState<boolean>(false);

    const navigate = useNavigate();

    // Referencias para detectar clics fuera de los menús desplegables
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const farmDropdownRef = useRef<HTMLDivElement>(null);

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
        navigate('/dashboard');
    };

    // Función que cambia efectivamente la finca en pantalla
    const handleSelectFarmItem = (farm: FarmOption) => {
        setIsFarmMenuOpen(false);   // <- Cierra el desplegable
        onSelectFarm?.(farm);
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

                    {/* Logo Pa'la Vaca */}
                    <div className={styles.brandLogo} onClick={handleBrandClick}>
                        <div className={styles.logoBadge}>
                            <ShieldCheck size={20} strokeWidth={2.2} />
                        </div>
                        <span className="d-none d-sm-inline">Pa'la Vaca</span>
                    </div>

                    {/* Selector de Finca Dropdown */}
                    <div className={styles.dropdownWrapper} ref={farmDropdownRef}>
                        <button
                            type="button"
                            className={styles.farmSelectorButton}
                            onClick={() => setIsFarmMenuOpen(!isFarmMenuOpen)}
                            title={selectedFarmName}
                            aria-expanded={isFarmMenuOpen}
                        >
                            <div className={styles.farmTextWrapper}>
                                <div className={styles.farmLabel}>FINCA ACTUAL</div>
                                <div className={styles.farmValue}>{selectedFarmName}</div>
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
                                {sortedFarms.map((farm) => {
                                    const isSelected = farm.id === selectedFarm?.id;
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
                    {isAdmin && (
                        <button
                            type="button"
                            className={styles.notificationButton}
                            onClick={() => navigate('/admin/sincronizacion')}
                            aria-label={`Sincronizaciones pendientes: ${pendingSyncCount}`}
                            title="Cola de sincronización"
                        >
                            <RefreshCw size={17} strokeWidth={2} />
                            {pendingSyncCount > 0 && (
                                <span className={`${styles.notificationBadge} ${styles.syncBadge}`}>
                                    {pendingSyncCount > 99 ? '99+' : pendingSyncCount}
                                </span>
                            )}
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.notificationButton}
                        onClick={() => navigate('/admin/alertas')}
                        aria-label="Notificaciones"
                    >
                        <Bell size={18} strokeWidth={2} />
                        {alertCount > 0 && (
                            <span className={styles.notificationBadge}>
                                {alertCount > 99 ? '99+' : alertCount}
                            </span>
                        )}
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

                                {isAdmin && (
                                    <>
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
                                    </>
                                )}

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