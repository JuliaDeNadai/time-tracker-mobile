import { Slot } from "expo-router";
import { AuthProvider } from '../context/auth-context.context';

export default function RootLayout() {
  return <AuthProvider><Slot /></AuthProvider>;
}
