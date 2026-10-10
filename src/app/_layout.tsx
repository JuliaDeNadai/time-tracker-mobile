import { AlertHost } from '@/components/app-alert';
import Colors from '@/constants/colors';
import { FontAssets } from '@/constants/fonts';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/auth-context.context';

function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

function AuthGate() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FontAssets);

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
      <AlertHost />
    </SafeAreaProvider>
  );
}
