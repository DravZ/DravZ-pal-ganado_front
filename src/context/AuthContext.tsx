import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  clearActiveProfile,
  getActiveProfile,
  type CachedProfile,
} from '../services/offlineDatabase';
import {
  closeCurrentSession,
  getCurrentSession,
  loginAccount,
  renewCurrentSession,
} from '../services/authService';
import {
  initializeOrSyncOfflineData,
  type AuthSession,
  type SyncUser,
} from '../services/offlineSyncService';
import useNotification from '../hooks/useNotification';

interface AuthContextValue {
  user: SyncUser | null;
  isReady: boolean;
  isOffline: boolean;
  offlineReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  renewSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const RENEWAL_WARNING_MS = 3 * 24 * 60 * 60 * 1000;

function userFromProfile(profile: CachedProfile): SyncUser {
  return {
    id: profile.userId,
    organization_id: profile.organizationId,
    farm_id: profile.farmId,
    name: profile.name,
    email: profile.email,
    role: profile.role,
  };
}

function sessionNeedsRenewal(expiresAt: string): boolean {
  const expiry = Date.parse(expiresAt);
  return Number.isFinite(expiry) && expiry - Date.now() <= RENEWAL_WARNING_MS;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showNotification } = useNotification();
  const notificationRef = useRef(showNotification);
  const warningShown = useRef(false);
  const [user, setUser] = useState<SyncUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [hasServerSession, setHasServerSession] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    notificationRef.current = showNotification;
  }, [showNotification]);

  const renewSession = useCallback(async () => {
    let session: AuthSession;
    try {
      session = await renewCurrentSession();
    } catch (error) {
      notificationRef.current({
        type: 'error',
        title: 'No se pudo renovar la sesión',
        message: error instanceof Error ? error.message : 'Inténtalo de nuevo con conexión a internet.',
      });
      throw error;
    }

    setUser(session.user);
    setHasServerSession(true);
    notificationRef.current({
      type: 'success',
      title: 'Sesión renovada',
      message: 'Tu sesión quedó renovada por siete días.',
    });

    try {
      const profile = await initializeOrSyncOfflineData(session);
      setOfflineReady(profile.initialized);
    } catch (error) {
      const cachedProfile = await getActiveProfile();
      setOfflineReady(cachedProfile?.initialized ?? false);
      notificationRef.current({
        type: 'error',
        title: 'No se pudieron actualizar los datos locales',
        message: error instanceof Error ? error.message : 'La sincronización podrá reintentarse más tarde.',
      });
    }
  }, []);

  const showRenewalWarning = useCallback((expiry: string, offline: boolean) => {
    if (warningShown.current || !sessionNeedsRenewal(expiry)) return;
    warningShown.current = true;
    notificationRef.current({
      type: 'alert',
      title: 'Tu sesión necesita renovarse',
      message: offline
        ? 'Conéctate a internet para renovar la sesión. Puedes seguir consultando los datos previamente descargados mientras estés sin conexión.'
        : 'Tu sesión vence en tres días o menos. Renúevala ahora para conservar el acceso.',
      buttonText: offline ? 'Conectarse y renovar' : 'Renovar sesión',
      onConfirm: () => {
        void renewSession().catch(() => undefined);
      },
    });
  }, [renewSession]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const cachedProfile = await getActiveProfile();
      if (!navigator.onLine) {
        if (cachedProfile?.initialized) {
          setUser(userFromProfile(cachedProfile));
          setHasServerSession(false);
          setOfflineReady(true);
          showRenewalWarning(cachedProfile.expiresAt, true);
        }
        if (active) setIsReady(true);
        return;
      }

      let session: AuthSession;
      try {
        session = await getCurrentSession();
      } catch {
        if (cachedProfile?.initialized) {
          setUser(userFromProfile(cachedProfile));
          setHasServerSession(false);
          setOfflineReady(true);
          showRenewalWarning(cachedProfile.expiresAt, true);
        }
        if (active) setIsReady(true);
        return;
      }

      setUser(session.user);
      setHasServerSession(true);
      try {
        const profile = await initializeOrSyncOfflineData(session);
        setOfflineReady(profile.initialized);
      } catch (error) {
        setOfflineReady(cachedProfile?.initialized ?? false);
        notificationRef.current({
          type: 'error',
          title: 'No se pudieron actualizar los datos locales',
          message: error instanceof Error ? error.message : 'La descarga podrá reintentarse más tarde.',
        });
      }
      showRenewalWarning(session.expires_at, false);
      if (active) setIsReady(true);
    };

    void initialize().catch((error: unknown) => {
      notificationRef.current({
        type: 'error',
        title: 'No se pudo iniciar la aplicación',
        message: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
      if (active) setIsReady(true);
    });

    return () => {
      active = false;
    };
  }, [showRenewalWarning]);

  useEffect(() => {
    if (!isReady || !isOnline || hasServerSession) return;
    let active = true;

    void getCurrentSession()
      .then(async (session) => {
        const profile = await initializeOrSyncOfflineData(session);
        if (!active) return;
        setUser(session.user);
        setHasServerSession(true);
        setOfflineReady(profile.initialized);
        showRenewalWarning(session.expires_at, false);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [hasServerSession, isOnline, isReady, showRenewalWarning]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginAccount(email, password);
    setUser(session.user);
    setHasServerSession(true);
    try {
      const profile = await initializeOrSyncOfflineData(session);
      setOfflineReady(profile.initialized);
    } catch (error) {
      const profile = await getActiveProfile();
      setOfflineReady(profile?.initialized ?? false);
      notificationRef.current({
        type: 'error',
        title: 'No se pudieron descargar los datos iniciales',
        message: error instanceof Error
          ? error.message
          : 'La sesión inició, pero no se pudo preparar el acceso offline.',
      });
    }
    setIsReady(true);
  }, []);

  const logout = useCallback(async () => {
    await closeCurrentSession();
    await clearActiveProfile();
    setUser(null);
    setHasServerSession(false);
    setOfflineReady(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isReady,
        isOffline: !isOnline || !hasServerSession,
        offlineReady,
        login,
        logout,
        renewSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
