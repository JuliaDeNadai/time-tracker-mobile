import ActionCard from '@/components/action-card';
import { showAlert } from '@/components/app-alert';
import RecordCard from '@/components/record-card';
import UnderlineInput from '@/components/underline-input';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { getErrorMessage } from '@/infra/api/api';
import { useAuth } from '@/context/auth-context.context';
import { Company, NamedResource, TimeEntry, TimeEntryFilters, User } from '@/infra/models';
import { CompaniesRepository } from '@/infra/repositories/companies.repository';
import { ReportsRepository } from '@/infra/repositories/reports.repository';
import { TimeEntriesRepository } from '@/infra/repositories/time-entries.repository';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { formatMinutes, hoursToMinutes, MONTHS, refName } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const timeEntriesRepository = new TimeEntriesRepository();
const companiesRepository = new CompaniesRepository();
const usersRepository = new UsersRepository();
const reportsRepository = new ReportsRepository();

function currentMonthFilters(): TimeEntryFilters {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function Records() {
  const [filters, setFilters] = useState<TimeEntryFilters>(currentMonthFilters);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { isAdmin } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [generalUsers, setGeneralUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [generating, setGenerating] = useState(false);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      setLoading(true);
      try {
        setEntries(await timeEntriesRepository.list(filters));
      } catch (error) {
        showAlert(getErrorMessage(error, 'Não foi possível carregar os registros.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]));

  useFocusEffect(useCallback(() => {
    companiesRepository.list().then(setCompanies).catch(() => {});
    usersRepository.me().then(setUser).catch(() => {});
    if (isAdmin) usersRepository.listGeneral().then(setGeneralUsers).catch(() => {});
  }, [isAdmin]));

  const users = useMemo(
    () => (user ? [user, ...generalUsers.filter(general => general._id !== user._id)] : generalUsers),
    [user, generalUsers]
  );

  const visibleEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter(entry =>
      [refName(entry.company), refName(entry.service), entry.details ?? '']
        .some(value => value.toLowerCase().includes(term))
    );
  }, [entries, search]);

  const totalMinutes = visibleEntries.reduce((sum, entry) => sum + hoursToMinutes(entry.total_hours), 0);
  const companyName = companies.find(company => company._id === filters.companyId)?.name;
  const selectedUserName = filters.userId ? users.find(option => option._id === filters.userId)?.name : undefined;

  async function handleReport() {
    if (entries.length === 0) {
      showAlert('Não há registros nesse período para gerar o relatório.');
      return;
    }
    setGenerating(true);
    try {
      await reportsRepository.shareMonthlyReport(filters);
    } catch (error) {
      showAlert(getErrorMessage(error, 'Não foi possível gerar o relatório.'));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Todos os registros</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={() => setFilterVisible(true)} hitSlop={8} accessibilityLabel="Filtrar">
            <Ionicons name="options-outline" size={22} color={Colors.title} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSearchVisible(!searchVisible); setSearch(''); }} hitSlop={8} accessibilityLabel="Buscar">
            <Ionicons name={searchVisible ? 'close' : 'search-outline'} size={22} color={Colors.title} />
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <UnderlineInput
          placeholder="Buscar por empresa ou serviço"
          value={search}
          onChangeText={setSearch}
          autoFocus
          style={styles.search}
        />
      )}

      <View style={styles.totalRow}>
        <Text style={styles.total}>Total</Text>
        <Text style={styles.total}>{formatMinutes(totalMinutes)} horas</Text>
      </View>
      <Text style={styles.period}>
        {MONTHS[filters.month - 1]} de {filters.year}
        {companyName ? ` · ${companyName}` : ''}
        {selectedUserName ? ` · ${selectedUserName}` : ''}
      </Text>

      {loading ? <ActivityIndicator style={styles.loading} color={Colors.primary} /> : (
        <FlatList
          data={visibleEntries}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <RecordCard entry={item} />}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado nesse período.</Text>}
        />
      )}

      <ActionCard
        text="Gerar relatório mensal"
        onPress={handleReport}
        loading={generating}
        style={styles.reportCard}
        right={<Ionicons name="play" size={24} color={Colors.white} />}
      />

      <FilterModal
        visible={filterVisible}
        initial={filters}
        companies={companies}
        users={isAdmin ? users : undefined}
        providerName={user?.name}
        onClose={() => setFilterVisible(false)}
        onApply={value => { setFilters(value); setFilterVisible(false); }}
      />
    </SafeAreaView>
  );
}

interface FilterModalProps {
  visible: boolean;
  initial: TimeEntryFilters;
  companies: Company[];
  /** Só informado para admin; general vê apenas o próprio nome */
  users?: User[];
  providerName?: string;
  onClose: () => void;
  onApply: (filters: TimeEntryFilters) => void;
}

function FilterModal({ visible, initial, companies, users, providerName, onClose, onApply }: FilterModalProps) {
  const [draft, setDraft] = useState(initial);

  function shiftMonth(delta: number) {
    const date = new Date(draft.year, draft.month - 1 + delta, 1);
    setDraft({ ...draft, year: date.getFullYear(), month: date.getMonth() + 1 });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={() => setDraft(initial)}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel}>
          <FilterRow label="Mês">
            <Stepper value={MONTHS[draft.month - 1]} onPrevious={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
          </FilterRow>
          <FilterRow label="Ano">
            <Stepper value={String(draft.year)} onPrevious={() => shiftMonth(-12)} onNext={() => shiftMonth(12)} />
          </FilterRow>

          <Text style={styles.filterLabel}>Empresa</Text>
          <Chips
            options={[{ _id: '', name: 'Todas' }, ...companies]}
            selectedId={draft.companyId ?? ''}
            onSelect={id => setDraft({ ...draft, companyId: id || undefined })}
          />

          {users ? (
            <>
              <Text style={styles.filterLabel}>Prestador de serviço</Text>
              <Chips
                options={users}
                selectedId={draft.userId ?? users[0]?._id}
                onSelect={id => setDraft({ ...draft, userId: id === users[0]?._id ? undefined : id })}
              />
            </>
          ) : (
            <FilterRow label="Prestador de serviço">
              <Text style={styles.filterValue}>{providerName ?? '-'}</Text>
            </FilterRow>
          )}

          <ActionCard
            text="Aplicar filtro"
            onPress={() => onApply(draft)}
            style={styles.applyCard}
            textStyle={styles.applyText}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Chips({ options, selectedId, onSelect }: { options: NamedResource[], selectedId?: string, onSelect: (id: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {options.map(option => {
        const selected = selectedId === option._id;
        return (
          <TouchableOpacity
            key={option._id || 'all'}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onSelect(option._id)}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function FilterRow({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Stepper({ value, onPrevious, onNext }: { value: string, onPrevious: () => void, onNext: () => void }) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity onPress={onPrevious} hitSlop={8} accessibilityLabel="Anterior">
        <Ionicons name="chevron-back" size={18} color={Colors.text_dark} style={styles.stepperIcon} />
      </TouchableOpacity>
      <Text style={styles.filterValue}>{value}</Text>
      <TouchableOpacity onPress={onNext} hitSlop={8} accessibilityLabel="Próximo">
        <Ionicons name="chevron-forward" size={18} color={Colors.text_dark} style={styles.stepperIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 16,
    lineHeight: 28,
    letterSpacing: -0.24,
    color: Colors.title,
  },
  icons: {
    flexDirection: 'row',
    gap: 10,
  },
  search: {
    marginHorizontal: 10,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 9,
  },
  total: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 16,
    lineHeight: 28,
    letterSpacing: -0.24,
    color: Colors.primary,
  },
  period: {
    paddingHorizontal: 9,
    fontFamily: Fonts.signikaLight,
    fontSize: 12,
    color: Colors.text_muted,
  },
  loading: {
    flex: 1,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 6,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: Fonts.alegreyaRegular,
    fontSize: 16,
    color: Colors.hint,
  },
  reportCard: {
    marginHorizontal: 27,
    marginBottom: 12,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  panel: {
    paddingVertical: 30,
    paddingHorizontal: 34,
    borderRadius: 12,
    backgroundColor: Colors.background,
    gap: 18,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 16,
    lineHeight: 25,
    color: Colors.text_card,
  },
  filterValue: {
    fontFamily: Fonts.alegreyaRegular,
    fontSize: 20,
    color: Colors.text_dark,
    opacity: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperIcon: {
    opacity: 0.5,
  },
  chips: {
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.white,
  },
  chipSelected: {
    backgroundColor: Colors.green_soft,
  },
  chipText: {
    fontFamily: Fonts.alegreyaRegular,
    fontSize: 16,
    color: Colors.text_card,
  },
  chipTextSelected: {
    fontFamily: Fonts.alegreyaBold,
    color: Colors.green_dark,
  },
  applyCard: {
    marginTop: 12,
  },
  applyText: {
    flex: 1,
    textAlign: 'center',
  },
});
