import { showAlert } from '@/components/app-alert';
import { useAuth } from '@/context/auth-context.context';
import { getErrorMessage } from '@/infra/api/api';
import { Journey, journeySummary } from '@/infra/journey';
import {
  JOURNEY_NOTIFICATION_ID,
  JourneyNotification,
  STOP_ACTION_ID,
} from '@/infra/notifications/journey-notification';
import { Notifications } from '@/infra/notifications/notifications-module';
import { ActiveEntryStorage } from '@/infra/storage/active-entry';
import type { NotificationResponse } from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export function useJourneyNotification(enabled: boolean) {
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!enabled) return;
    (async () => {
      await JourneyNotification.setup();
      const active = await ActiveEntryStorage.get();
      if (active) await JourneyNotification.show(active);
    })();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !Notifications) return;
    const notifications = Notifications;

    const handle = (response: NotificationResponse) => {
      if (response.notification.request.identifier !== JOURNEY_NOTIFICATION_ID) return;
      notifications.clearLastNotificationResponse();

      if (response.actionIdentifier === STOP_ACTION_ID) {
        const entryId = response.notification.request.content.data?.entryId as string | undefined;
        if (!entryId) return;
        Journey.stop(entryId)
          .then(finished => {
            showAlert(journeySummary(finished, isAdmin), 'Jornada encerrada!');
            router.dismissTo('/home');
          })
          .catch(error => showAlert(getErrorMessage(error, 'Não foi possível encerrar a jornada.')));
      } else if (response.actionIdentifier === notifications.DEFAULT_ACTION_IDENTIFIER) {
        router.push('/tracking');
      }
    };

    const last = notifications.getLastNotificationResponse();
    if (last) handle(last);
    const subscription = notifications.addNotificationResponseReceivedListener(handle);
    return () => subscription.remove();
  }, [enabled, router, isAdmin]);
}
