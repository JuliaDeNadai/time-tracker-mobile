import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/auth-context.context';

export default function AuthLayout() {
  const { token } = useAuth();

  if (token) {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
