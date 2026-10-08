import { ActiveEntry } from '@/infra/storage/active-entry';
import { formatTime } from '@/utils/time';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
import { JourneyActivity } from '../../../modules/journey-activity';
import { Notifications } from './notifications-module';

export const JOURNEY_NOTIFICATION_ID = 'active-journey';
const CHANNEL_ID = 'journey';
const CATEGORY_ID = 'journey';
export const STOP_ACTION_ID = 'stop-journey';
const OVERLAY_PROMPTED_KEY = 'overlay_permission_prompted';

/**
 * Em builds nativos usa o módulo `journey-activity` (cronômetro na notificação, bolha
 * flutuante no Android e Live Activity no iOS). No Expo Go para iOS cai para uma
 * notificação local fixa; no Expo Go para Android não há notificação.
 */
export const JourneyNotification = {
  async setup(): Promise<void> {
    if (!Notifications || JourneyActivity) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Jornada em andamento',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        vibrationPattern: null,
        showBadge: false,
      });
    }

    await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
      {
        identifier: STOP_ACTION_ID,
        buttonTitle: 'Encerrar',
        options: { opensAppToForeground: true, isDestructive: true },
      },
    ]);
  },

  async show(entry: ActiveEntry): Promise<void> {
    try {
      if (JourneyActivity) await showNative(entry);
      else await showLocalNotification(entry);
    } catch (error) {
      console.warn('Não foi possível exibir a jornada em andamento', error);
    }
  },

  async dismiss(): Promise<void> {
    try {
      if (JourneyActivity) await JourneyActivity.stop();
      else await Notifications?.dismissNotificationAsync(JOURNEY_NOTIFICATION_ID);
    } catch (error) {
      console.warn('Não foi possível remover a jornada em andamento', error);
    }
  },

  /** Contador flutuante sobre outros apps: só Android com build nativo. */
  overlaySupported(): boolean {
    return Platform.OS === 'android' && !!JourneyActivity;
  },

  /** Ativado = preferência ligada e permissão de sobreposição concedida. */
  overlayEnabled(): boolean {
    return JourneyNotification.overlaySupported()
      && JourneyActivity!.isOverlayEnabled()
      && JourneyActivity!.canDrawOverlays();
  },

  /** Ao ativar sem permissão, abre a tela do sistema para concedê-la. */
  setOverlayEnabled(enabled: boolean): void {
    if (!JourneyNotification.overlaySupported()) return;
    JourneyActivity!.setOverlayEnabled(enabled);
    if (enabled && !JourneyActivity!.canDrawOverlays()) JourneyActivity!.requestOverlayPermission();
  },

  /** Oferece a permissão de sobreposição uma única vez, na primeira jornada. */
  async offerOverlayOnce(): Promise<void> {
    if (!JourneyNotification.overlaySupported()) return;
    if (!JourneyActivity!.isOverlayEnabled() || JourneyActivity!.canDrawOverlays()) return;
    if (await SecureStore.getItemAsync(OVERLAY_PROMPTED_KEY)) return;
    await SecureStore.setItemAsync(OVERLAY_PROMPTED_KEY, '1');

    Alert.alert(
      'Contador flutuante',
      'Quer ver o tempo da jornada flutuando sobre outros apps? Você pode encerrar a jornada por ali. ' +
      'Na próxima tela, ative "Permitir sobreposição a outros apps".',
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Ativar', onPress: () => JourneyNotification.setOverlayEnabled(true) },
      ],
    );
  },
};

async function showNative(entry: ActiveEntry) {
  if (Platform.OS === 'android') await Notifications?.requestPermissionsAsync();
  await JourneyActivity!.start({
    entryId: entry.id,
    title: entry.serviceName,
    subtitle: `para ${entry.companyName}`,
    startedAt: new Date(entry.startedAt).getTime(),
    openUrl: Linking.createURL('/tracking'),
    stopUrl: Linking.createURL('/tracking', { queryParams: { action: 'stop' } }),
  });
}

async function showLocalNotification(entry: ActiveEntry) {
  if (!Notifications) return;
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    identifier: JOURNEY_NOTIFICATION_ID,
    content: {
      title: 'Jornada em andamento',
      body: `${entry.serviceName} para ${entry.companyName} · desde ${formatTime(new Date(entry.startedAt))}`,
      data: { entryId: entry.id },
      categoryIdentifier: CATEGORY_ID,
      sticky: true,
      autoDismiss: false,
    },
    trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
  });
}
