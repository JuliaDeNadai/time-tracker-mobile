import axios from "axios";

console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  
});