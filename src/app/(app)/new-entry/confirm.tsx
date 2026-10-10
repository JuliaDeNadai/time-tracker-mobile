import { showAlert } from '@/components/app-alert';
import { JourneyButton, JourneyLayout, journeyText } from '@/components/journey';
import { getErrorMessage } from '@/infra/api/api';
import { Journey } from '@/infra/journey';
import { JourneyNotification } from '@/infra/notifications/journey-notification';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ConfirmEntry() {
  const router = useRouter();
  const { serviceId, serviceName, companyId, companyName } = useLocalSearchParams<{
    serviceId: string, serviceName: string, companyId: string, companyName: string
  }>();
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setStarting(true);
    try {
      await Journey.start({ service: serviceId, company: companyId }, { serviceName, companyName });
      router.replace('/tracking');
      JourneyNotification.offerOverlayOnce();
    } catch (error) {
      showAlert(getErrorMessage(error, 'Não foi possível iniciar a jornada.'));
      setStarting(false);
    }
  }

  return (
    <JourneyLayout
      step={3}
      centered
      footer={<JourneyButton variant="back" text="Voltar" onPress={() => router.back()} />}
    >
      <View style={styles.content}>
        <Text style={journeyText.label}>Serviço a ser prestado:</Text>
        <Text style={journeyText.value}>{serviceName}</Text>

        <Text style={[journeyText.label, styles.spacing]}>Empresa contratante:</Text>
        <Text style={journeyText.value}>{companyName}</Text>

        <JourneyButton
          variant="start"
          text="Iniciar"
          onPress={handleStart}
          loading={starting}
          style={styles.start}
        />
      </View>
    </JourneyLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 48,
    alignItems: 'center',
  },
  spacing: {
    marginTop: 28,
  },
  start: {
    marginTop: 52,
  },
});
