import { setUnauthorizedHandler } from '@/infra/api/api';
import { JourneyNotification } from '@/infra/notifications/journey-notification';
import { AuthRepository } from '@/infra/repositories/auth.respository';
import { ActiveEntryStorage } from '@/infra/storage/active-entry';
import { TokenStorage } from '@/infra/storage/token';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContextData {
  token: string | null;
  loading: boolean;
  signin: (data: { email: string; password: string }) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

const repository = new AuthRepository();

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

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
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
