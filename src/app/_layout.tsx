import { Redirect, Slot, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/auth-context.context';

function AuthGate() {
  const { token, loading } = useAuth();
  const segments = useSegments();

  const isPublicRoute = segments[0] === '(pages)';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token && !isPublicRoute) {
    return <Redirect href="/(pages)/login" />;
  }

  if (token && !isPublicRoute) {
    return <Redirect href="/(pages)/home" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
