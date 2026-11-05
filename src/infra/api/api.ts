import axios, { AxiosError, isAxiosError } from "axios";
import * as Crypto from "expo-crypto";
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
    // CloudFront OAC uses Authorization for SigV4; JWT goes in a custom header.
    config.headers["x-access-token"] = token;
    delete config.headers.Authorization;
  }

  if (config.data !== undefined && config.data !== null) {
    const body =
      typeof config.data === "string" ? config.data : JSON.stringify(config.data);
    config.data = body;
    config.headers["Content-Type"] = "application/json";
    config.headers["x-amz-content-sha256"] = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      body,
    );
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
