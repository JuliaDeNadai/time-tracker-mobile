import axios from "axios";
import { TokenStorage } from '../storage/token';



console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  
});

api.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});