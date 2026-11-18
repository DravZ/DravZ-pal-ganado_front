import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/**
 * Restringe las rutas de administración (organización, usuarios, fincas y
 * sincronización) a usuarios con rol de administrador. El backend ya aplica la
 * misma regla; este guard evita además que un trabajador vea estas pantallas.
 */
export default function AdminGuard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
