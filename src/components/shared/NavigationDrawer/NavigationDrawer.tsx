import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Menu,
    ChevronDown,
    ChevronRight,
    Beef,
    Syringe,
    Package,
    Scale,
    Home,
    Plus,
    ArrowLeftRight,
    Bell,
    CheckCircle,
    LayoutDashboard,
    Building,
    Users,
    Warehouse,
    RefreshCw,
    ShoppingBag,
    Activity,
    Receipt,
    type LucideIcon,
} from 'lucide-react';
import styles from './NavigationDrawer.module.css';

// Estructura de navegación fuertemente tipada
interface SubMenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
    badge?: number;
}

interface NavigationCategory {
    id: string;
    title: string;
    icon: LucideIcon;
    subItems: SubMenuItem[];
}

// Estructura de módulos basada en las capturas
const NAVIGATION_MENU: NavigationCategory[] = [
    {
        id: 'hato',
        title: '1. MI HATO',
        icon: Beef,
        subItems: [
            { id: 'animales', label: 'Directorio de animales', icon: Beef, path: '/hato/animales' },
            { id: 'nacimiento', label: 'Registrar animal / nacimiento', icon: Plus, path: '/hato/nuevo' },
            { id: 'pesajes', label: 'Pesajes', icon: Scale, path: '/hato/pesajes' },
            { id: 'reproduccion', label: 'Reproducción y gestación', icon: Beef, path: '/hato/reproduccion' },
            { id: 'traslados', label: 'Traslados y movilización', icon: ArrowLeftRight, path: '/hato/traslados' },
        ],
    },
    {
        id: 'salud',
        title: '2. SALUD Y VETERINARIA',
        icon: Syringe,
        subItems: [
            { id: 'diagnostico', label: 'Eventos de salud y diagnóstic...', icon: Syringe, path: '/salud/eventos' },
            { id: 'tratamiento', label: 'Aplicar tratamiento / receta', icon: Plus, path: '/salud/tratamientos' },
            { id: 'vacunacion', label: 'Jornada de vacunación', icon: Syringe, path: '/salud/vacunacion' },
            { id: 'dias_retiro', label: 'Registro de días de retiro', icon: Bell, path: '/salud/retiro' },
        ],
    },
    {
        id: 'alimentacion',
        title: '3. ALIMENTACIÓN E INSUMOS',
        icon: Package,
        subItems: [
            { id: 'diaria', label: 'Alimentación diaria', icon: Package, path: '/alimentacion/diaria' },
            { id: 'inventario', label: 'Inventario y bodega', icon: Package, path: '/alimentacion/inventario' },
            { id: 'compras', label: 'Compras e insumos', icon: ArrowLeftRight, path: '/alimentacion/compras' },
        ],
    },
    {
        id: 'finanzas',
        title: '4. FINANZAS Y VENTAS',
        icon: Scale,
        subItems: [
            { id: 'ventas', label: 'Ventas de ganado', icon: Scale, path: '/finanzas/ventas' },
            { id: 'produccion', label: 'Registro de producción', icon: Scale, path: '/finanzas/produccion' },
            { id: 'gastos', label: 'Gastos del rancho', icon: ArrowLeftRight, path: '/finanzas/gastos' },
        ],
    },
    {
        id: 'administracion',
        title: '5. ADMINISTRACIÓN Y CAMPO',
        icon: Home,
        subItems: [
            { id: 'tablero', label: 'Tablero de control', icon: Home, path: '/dashboard' },
            { id: 'estructura', label: 'Estructura del rancho', icon: Package, path: '/admin/estructura' },
            { id: 'configuracion', label: 'Configuración de organización', icon: Home, path: '/admin/configuracion' },
            { id: 'usuarios', label: 'Administrar usuarios', icon: Home, path: '/admin/usuarios' },
            { id: 'fincas', label: 'Administrar fincas', icon: Home, path: '/admin/fincas' },
            { id: 'alertas', label: 'Centro de alertas', icon: Bell, path: '/admin/alertas' },
            { id: 'sincronizacion', label: 'Monitor de sincronizació...', icon: RefreshCw, path: '/admin/sincronizacion', badge: 3 },
        ],
    },
];

interface NavigationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    activePath?: string;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
    isOpen,
    onClose,
    activePath = '/dashboard',
}) => {
    // Estado para la categoría actualmente expandida (Accordion style)
    const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>('hato');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const toggleCategory = (id: string) => {
        setExpandedCategoryId((prev) => (prev === id ? null : id));
    };

    const handleNavigate = (path: string, label: string) => {
        console.log(`[Router Log]: Navegando a módulo -> ${path} (${label})`);
        navigate(path);
        onClose();
    };

    return createPortal(
        <>
            {/* Backdrop con Blur */}
            <div className={styles.backdrop} onClick={onClose} />

            {/* Drawer lateral */}
            <aside className={styles.drawerContainer}>
                {/* Header */}
                <div className={styles.drawerHeader}>
                    <div className={styles.headerTitleWrapper}>
                        <Menu size={20} className="text-success" />
                        <div>
                            <div className={styles.kicker}>NAVEGACIÓN</div>
                            <div className={styles.headerTitle}>Todos los módulos</div>
                        </div>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose}>
                        <X size={20} strokeWidth={2.2} />
                    </button>
                </div>

                {/* Lista de Módulos */}
                <div className={styles.drawerBody}>
                    {NAVIGATION_MENU.map((category) => {
                        const isExpanded = expandedCategoryId === category.id;
                        const CategoryIcon = category.icon;

                        return (
                            <div key={category.id} className="mb-1">
                                {/* Botón Encabezado de Categoría */}
                                <button
                                    type="button"
                                    className={`${styles.categoryHeader} ${isExpanded ? styles.categoryHeaderActive : ''
                                        }`}
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <div className={styles.categoryTitleGroup}>
                                        <CategoryIcon size={18} strokeWidth={2.2} />
                                        <span>{category.title}</span>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronDown size={18} strokeWidth={2.2} />
                                    ) : (
                                        <ChevronRight size={18} strokeWidth={2.2} />
                                    )}
                                </button>

                                {/* Submódulos Desplegables */}
                                {isExpanded && (
                                    <div className={styles.submenuList}>
                                        {category.subItems.map((subItem) => {
                                            const SubIcon = subItem.icon;
                                            const isActive = activePath === subItem.path;

                                            return (
                                                <button
                                                    key={subItem.id}
                                                    type="button"
                                                    className={`${styles.subItemLink} ${isActive ? styles.subItemLinkActive : ''
                                                        }`}
                                                    onClick={() => handleNavigate(subItem.path, subItem.label)}
                                                >
                                                    <div className={styles.subItemLabelGroup}>
                                                        <SubIcon size={18} strokeWidth={2} />
                                                        <span>{subItem.label}</span>
                                                    </div>
                                                    {subItem.badge !== undefined && (
                                                        <span className={styles.badgeCounter}>{subItem.badge}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>
        </>,
        document.body
    );
};