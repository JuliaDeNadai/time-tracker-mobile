import Colors from '@/constants/colors';
import { useJourneyNotification } from '@/hooks/use-journey-notification';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/auth-context.context';

export default function AppLayout() {
  const { token } = useAuth();
  useJourneyNotification(!!token);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tracking" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
