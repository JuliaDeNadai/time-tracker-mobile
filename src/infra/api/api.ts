import axios, { AxiosError, isAxiosError } from "axios";
import { TokenStorage } from '../storage/token';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
});

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// O backend responde 403 (não 401) para token ausente, inválido ou expirado.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message.join('\n');
    if (typeof message === 'string') return message;
    if (!error.response) return 'Não foi possível conectar ao servidor.';
  }
  return fallback;
}
