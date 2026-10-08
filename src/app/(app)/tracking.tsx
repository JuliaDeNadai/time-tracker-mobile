import { JourneyButton, JourneyLayout } from '@/components/journey';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { getErrorMessage } from '@/infra/api/api';
import { Journey, journeySummary } from '@/infra/journey';
import { ActiveEntry, ActiveEntryStorage } from '@/infra/storage/active-entry';
import { formatElapsed } from '@/utils/time';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';

export default function Tracking() {
  const router = useRouter();
  /** `action=stop` chega pelo "Encerrar" da notificação, bolha flutuante ou Live Activity. */
  const { action } = useLocalSearchParams<{ action?: string }>();
  const stopRequested = useRef(false);
  const [entry, setEntry] = useState<ActiveEntry | null>(null);
  const [now, setNow] = useState(Date.now);
  const [stopping, setStopping] = useState(false);

  const stop = useCallback(async (active: ActiveEntry) => {
    setStopping(true);
    try {
      const finished = await Journey.stop(active.id);
      alert(journeySummary(finished));
      router.dismissTo('/home');
    } catch (error) {
      alert(getErrorMessage(error, 'Não foi possível encerrar a jornada.'));
      setStopping(false);
    }
  }, [router]);

  useEffect(() => {
    ActiveEntryStorage.get().then(active => {
      if (!active) {
        router.dismissTo('/home');
        return;
      }
      setEntry(active);
      if (action === 'stop' && !stopRequested.current) {
        stopRequested.current = true;
        stop(active);
      }
    });
  }, [router, action, stop]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      router.dismissTo('/home');
      return true;
    });
    return () => subscription.remove();
  }, [router]);

  if (!entry) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <JourneyLayout centered subtitle={`${entry.serviceName}\npara ${entry.companyName}...`}>
      <View style={styles.content}>
        <Text style={styles.timer}>{formatElapsed(now - new Date(entry.startedAt).getTime())}</Text>
        <Image
          source={require('../../../assets/images/tracking.svg')}
          style={styles.illustration}
          contentFit="contain"
        />
        <JourneyButton
          variant="stop"
          text="Encerrar"
          onPress={() => stop(entry)}
          loading={stopping}
          style={styles.stop}
        />
      </View>
    </JourneyLayout>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: 'center',
  },
  timer: {
    marginTop: 40,
    fontFamily: Fonts.signikaRegular,
    fontSize: 38,
    color: Colors.timer,
  },
  illustration: {
    width: 214,
    height: 240,
    marginTop: 24,
  },
  stop: {
    width: 186,
    marginTop: 32,
  },
});
