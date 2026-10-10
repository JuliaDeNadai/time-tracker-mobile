import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { UserRole } from '../models';

const TOKEN_KEY = 'auth_token';

interface TokenPayload {
  userId: string;
  email: string;
  role?: UserRole;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
  } catch {
    return null;
  }
}

export const TokenStorage = {
  async saveToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
