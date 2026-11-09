import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function AuthGuard() {
  const { user, isReady, isOffline, offlineReady } = useAuth();

  if (!isReady) {
    return <div role="status" className="p-4 text-center">Verificando sesión...</div>;
  }

  if (!user || (isOffline && !offlineReady)) return <Navigate to="/" replace />;
  return <Outlet />;
}
