import ActionCard from '@/components/action-card';
import WeeklyChart from '@/components/weekly-chart';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { getErrorMessage } from '@/infra/api/api';
import { User } from '@/infra/models';
import { TimeEntriesRepository } from '@/infra/repositories/time-entries.repository';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { ActiveEntry, ActiveEntryStorage } from '@/infra/storage/active-entry';
import { monthsForTwoWeeks, weeklyHours } from '@/utils/weekly';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const usersRepository = new UsersRepository();
const timeEntriesRepository = new TimeEntriesRepository();

const SHORTCUTS: { label: string, image: number, background: string, color: string, href?: Href }[] = [
  { label: 'Serviços', image: require('../../../../assets/images/strawberry.svg'), background: Colors.shortcut_services_bg, color: Colors.shortcut_services_text, href: '/services' },
  { label: 'Empresas', image: require('../../../../assets/images/broccoli.svg'), background: Colors.shortcut_companies_bg, color: Colors.shortcut_companies_text, href: '/companies' },
  { label: 'Funcionários', image: require('../../../../assets/images/pizza.svg'), background: Colors.shortcut_employees_bg, color: Colors.shortcut_employees_text },
];

const EMPTY_WEEK = Array(7).fill(0);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [week, setWeek] = useState({ current: EMPTY_WEEK, previous: EMPTY_WEEK });
  const [activeEntry, setActiveEntry] = useState<ActiveEntry | null>(null);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      setActiveEntry(await ActiveEntryStorage.get());
      try {
        const now = new Date();
        const [me, months] = await Promise.all([
          usersRepository.me(),
          Promise.all(monthsForTwoWeeks(now).map(filters => timeEntriesRepository.list(filters))),
        ]);
        setUser(me);
        setWeek(weeklyHours(months.flat(), now));
      } catch (error) {
        alert(getErrorMessage(error, 'Não foi possível carregar seus dados.'));
      }
    };
    load();
  }, []));

  const firstName = user?.name.split(' ')[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Olá{firstName ? ` ${firstName}` : ''},</Text>
        <Text style={styles.greetingSub}>Acompanhe seus dados.</Text>

        {activeEntry && (
          <TouchableOpacity style={styles.activeBanner} onPress={() => router.push('/tracking')}>
            <Ionicons name="time-outline" size={20} color={Colors.green_dark} />
            <Text style={styles.activeText} numberOfLines={1}>
              Jornada em andamento: {activeEntry.serviceName}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.green_dark} />
          </TouchableOpacity>
        )}

        <View style={styles.chart}>
          <WeeklyChart current={week.current} previous={week.previous} onShowAll={() => router.push('/records')} />
        </View>

        <ActionCard
          size="large"
          text="Ver todos os registros de ponto"
          onPress={() => router.push('/records')}
          style={styles.card}
          right={(
            <View style={styles.pill}>
              <Text style={styles.pillText}>Visualizar</Text>
              <Ionicons name="caret-forward" size={10} color={Colors.primary} />
            </View>
          )}
        />

        <Text style={styles.sectionTitle}>Personalize seus serviços</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcuts}>
          {SHORTCUTS.map(shortcut => (
            <TouchableOpacity
              key={shortcut.label}
              style={[styles.shortcut, { backgroundColor: shortcut.background }]}
              activeOpacity={0.8}
              onPress={() => shortcut.href ? router.push(shortcut.href) : alert('Em breve!')}
            >
              <Image source={shortcut.image} style={styles.shortcutImage} contentFit="contain" />
              <Text style={[styles.shortcutText, { color: shortcut.color }]}>{shortcut.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: 29,
    paddingBottom: 24,
  },
  greeting: {
    textAlign: 'center',
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 25,
    lineHeight: 28,
    letterSpacing: -0.24,
    color: Colors.greeting,
  },
  greetingSub: {
    textAlign: 'center',
    fontFamily: Fonts.signikaRegular,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.24,
    color: Colors.text_muted,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginHorizontal: 29,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.green_soft,
  },
  activeText: {
    flex: 1,
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 14,
    color: Colors.green_dark,
  },
  chart: {
    marginTop: 16,
    paddingHorizontal: 40,
  },
  card: {
    marginTop: 24,
    marginHorizontal: 27,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  pillText: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 12,
    letterSpacing: -0.24,
    color: Colors.primary,
  },
  sectionTitle: {
    marginTop: 20,
    marginLeft: 28,
    fontFamily: Fonts.signikaRegular,
    fontSize: 22,
    letterSpacing: -0.24,
    color: Colors.title,
  },
  shortcuts: {
    gap: 16,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  shortcut: {
    width: 132,
    height: 144,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutImage: {
    width: 50,
    height: 48,
  },
  shortcutText: {
    marginTop: 12,
    fontFamily: Fonts.signikaRegular,
    fontSize: 17,
    lineHeight: 20,
  },
});
