import { AuthRepository } from '@/infra/repositories/auth.respository';
import { TokenStorage } from '@/infra/storage/token';
import React, {
  createContext,
  ReactNode,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const repository = new AuthRepository();

  useEffect(() => {
    const restoreToken = async () => {
      const storedToken = await TokenStorage.getToken();
      setToken(storedToken);
      setLoading(false);
    };
    restoreToken();
  }, []);

  const signin = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    const result: any = await repository.signin({ email, password });
    await TokenStorage.saveToken(result.token);
    setToken(result.token);
    setLoading(false);
  };

  const signout = async () => {
    await TokenStorage.removeToken();
    setToken(null);
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
