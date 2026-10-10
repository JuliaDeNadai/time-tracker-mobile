import { setUnauthorizedHandler } from '@/infra/api/api';
import { JourneyNotification } from '@/infra/notifications/journey-notification';
import { UserRole } from '@/infra/models';
import { AuthRepository } from '@/infra/repositories/auth.respository';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { ActiveEntryStorage } from '@/infra/storage/active-entry';
import { decodeToken, TokenStorage } from '@/infra/storage/token';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AuthContextData {
  token: string | null;
  loading: boolean;
  /** Valores monetários só devem ser exibidos para admin */
  isAdmin: boolean;
  signin: (data: { email: string; password: string }) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

const repository = new AuthRepository();
const usersRepository = new UsersRepository();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const signout = useCallback(async () => {
    await TokenStorage.removeToken();
    await ActiveEntryStorage.remove();
    await JourneyNotification.dismiss();
    setToken(null);
  }, []);

  useEffect(() => {
    const restoreToken = async () => {
      const storedToken = await TokenStorage.getToken();
      setToken(storedToken);
      setLoading(false);
    };
    restoreToken();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => { signout(); });
    return () => setUnauthorizedHandler(null);
  }, [signout]);

  const signin = async ({ email, password }: { email: string; password: string }) => {
    const accessToken = await repository.signin({ email, password });
    await TokenStorage.saveToken(accessToken);
    setToken(accessToken);
  };

  const tokenRole = useMemo(() => (token ? decodeToken(token)?.role ?? null : null), [token]);
  const [serverRole, setServerRole] = useState<{ token: string, role: UserRole } | null>(null);

  // O token dura 30 dias e pode carregar um perfil desatualizado; o perfil do servidor prevalece.
  useEffect(() => {
    if (!token) return;
    usersRepository.me()
      .then(user => setServerRole({ token, role: user.role }))
      .catch(() => {});
  }, [token]);

  const role = serverRole?.token === token ? serverRole.role : tokenRole;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        isAdmin,
        signin,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
