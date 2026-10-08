import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

/**
 * `null` na web e no Expo Go para Android, onde importar `expo-notifications`
 * lança erro já na importação (removido do Expo Go desde o SDK 53).
 */
export const Notifications: NotificationsModule | null =
  Platform.OS === 'web' || (Platform.OS === 'android' && isRunningInExpoGo())
    ? null
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : require('expo-notifications');
