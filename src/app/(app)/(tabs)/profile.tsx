import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { getErrorMessage } from '@/infra/api/api';
import { User } from '@/infra/models';
import { JourneyNotification } from '@/infra/notifications/journey-notification';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { formatCurrency } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, AppState, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/auth-context.context';

const usersRepository = new UsersRepository();

export default function Profile() {
  const { signout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [overlayOn, setOverlayOn] = useState(false);
  const overlayAvailable = JourneyNotification.overlaySupported();

  useFocusEffect(useCallback(() => {
    usersRepository.me()
      .then(setUser)
      .catch(error => alert(getErrorMessage(error, 'Não foi possível carregar o perfil.')));
  }, []));

  useFocusEffect(useCallback(() => {
    if (!JourneyNotification.overlaySupported()) return;
    const refresh = () => setOverlayOn(JourneyNotification.overlayEnabled());
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, []));

  function toggleOverlay(enabled: boolean) {
    setOverlayOn(enabled);
    JourneyNotification.setOverlayEnabled(enabled);
  }

  const initials = user?.name.split(' ').slice(0, 2).map(part => part[0]?.toUpperCase()).join('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Perfil</Text>

      {!user ? <ActivityIndicator style={styles.loading} color={Colors.primary} /> : (
        <View style={styles.content}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Valor por hora</Text>
            <Text style={styles.cardValue}>{formatCurrency(user.value_hour)}</Text>
          </View>

          {Platform.OS === 'android' && (
            <View style={[styles.card, styles.overlayCard, !overlayAvailable && styles.disabled]}>
              <View style={styles.overlayText}>
                <Text style={styles.cardLabel}>Ícone flutuante</Text>
                <Text style={styles.overlayHint}>
                  {overlayAvailable
                    ? 'Mostra o tempo da jornada sobre outros apps, com opção de encerrar'
                    : 'Disponível no app instalado (não funciona no Expo Go)'}
                </Text>
              </View>
              <Switch
                value={overlayOn}
                disabled={!overlayAvailable}
                onValueChange={toggleOverlay}
                trackColor={{ false: Colors.step_inactive, true: Colors.primary }}
                thumbColor={overlayOn ? Colors.green_dark : Colors.white}
              />
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.signout} onPress={signout}>
        <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
        <Text style={styles.signoutText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    marginTop: 20,
    paddingHorizontal: 10,
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 16,
    lineHeight: 28,
    color: Colors.title,
  },
  loading: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 29,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.green_soft,
  },
  avatarText: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 36,
    color: Colors.greeting,
  },
  name: {
    marginTop: 16,
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 25,
    color: Colors.greeting,
  },
  email: {
    marginTop: 4,
    fontFamily: Fonts.signikaRegular,
    fontSize: 16,
    color: Colors.text_muted,
  },
  card: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    padding: 20,
    borderRadius: 24,
    backgroundColor: Colors.shortcut_employees_bg,
  },
  cardLabel: {
    fontFamily: Fonts.signikaRegular,
    fontSize: 17,
    color: Colors.shortcut_employees_text,
  },
  cardValue: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 20,
    color: Colors.shortcut_employees_text,
  },
  overlayCard: {
    marginTop: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  overlayText: {
    flex: 1,
    marginRight: 12,
  },
  overlayHint: {
    marginTop: 2,
    fontFamily: Fonts.signikaLight,
    fontSize: 13,
    color: Colors.shortcut_employees_text,
  },
  signout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 29,
    marginBottom: 12,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  signoutText: {
    fontFamily: Fonts.alegreyaMedium,
    fontSize: 22,
    color: Colors.danger,
  },
});
