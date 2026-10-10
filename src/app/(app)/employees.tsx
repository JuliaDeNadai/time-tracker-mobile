import ActionCard from '@/components/action-card';
import { showAlert } from '@/components/app-alert';
import UnderlineInput from '@/components/underline-input';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { useAuth } from '@/context/auth-context.context';
import { getErrorMessage } from '@/infra/api/api';
import { User } from '@/infra/models';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { formatCurrency } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const usersRepository = new UsersRepository();

export default function Employees() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<User | null>(null);

  useFocusEffect(useCallback(() => {
    if (!isAdmin) return;
    usersRepository.listAll()
      .then(setUsers)
      .catch(error => showAlert(getErrorMessage(error, 'Não foi possível carregar os funcionários.')))
      .finally(() => setLoading(false));
  }, [isAdmin]));

  if (!isAdmin) {
    return <Redirect href="/home" />;
  }

  function handleSaved(updated: User) {
    setUsers(current => current.map(user => (user._id === updated._id ? { ...user, ...updated } : user)));
    setEditing(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={26} color={Colors.text_dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Funcionários</Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Toque em um funcionário para alterar quanto ele ganha por hora. O novo valor vale para as jornadas encerradas a partir de agora.
        </Text>
      </View>

      {loading ? <ActivityIndicator style={styles.loading} color={Colors.primary} /> : (
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum funcionário encontrado.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => setEditing(item)} activeOpacity={0.8}>
              <View style={styles.itemInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  {item.role === 'admin' && <Text style={styles.badge}>Admin</Text>}
                </View>
                <Text style={styles.itemEmail} numberOfLines={1}>{item.email}</Text>
              </View>
              <Text style={styles.itemValue}>{formatCurrency(item.value_hour ?? null)}/h</Text>
              <Ionicons name="create-outline" size={20} color={Colors.shortcut_employees_text} />
            </TouchableOpacity>
          )}
        />
      )}

      <ValueHourModal user={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
    </SafeAreaView>
  );
}

interface ValueHourModalProps {
  user: User | null;
  onClose: () => void;
  onSaved: (user: User) => void;
}

function ValueHourModal({ user, onClose, onSaved }: ValueHourModalProps) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    const normalized = value.trim().replace(/\s|R\$/g, '');
    const valueHour = Number(normalized.includes(',') ? normalized.replace(/\./g, '').replace(',', '.') : normalized);
    if (!normalized || Number.isNaN(valueHour) || valueHour < 0) {
      showAlert('Informe um valor válido, por exemplo 45,50.');
      return;
    }
    setSaving(true);
    try {
      onSaved(await usersRepository.updateValueHour(user._id, Math.round(valueHour * 100) / 100));
    } catch (error) {
      showAlert(getErrorMessage(error, 'Não foi possível alterar o valor por hora.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={!!user}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setValue(user?.value_hour != null ? user.value_hour.toFixed(2).replace('.', ',') : '')}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel}>
          <Text style={styles.panelTitle}>{user?.name}</Text>
          <Text style={styles.panelLabel}>Valor por hora (R$)</Text>
          <UnderlineInput
            placeholder="Ex.: 45,50"
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            autoFocus
            onSubmitEditing={handleSave}
          />
          <ActionCard
            text="Salvar"
            onPress={handleSave}
            loading={saving}
            style={styles.saveCard}
            textStyle={styles.saveText}
          />
        </Pressable>
      </Pressable>
    </Modal>
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
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 22,
    color: Colors.title,
  },
  banner: {
    margin: 16,
    padding: 20,
    borderRadius: 32,
    backgroundColor: Colors.shortcut_employees_bg,
  },
  bannerText: {
    fontFamily: Fonts.signikaRegular,
    fontSize: 16,
    color: Colors.shortcut_employees_text,
  },
  loading: {
    marginTop: 40,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    flexShrink: 1,
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 16,
    color: Colors.text_card,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 11,
    color: Colors.green_dark,
    backgroundColor: Colors.green_soft,
  },
  itemEmail: {
    marginTop: 2,
    fontFamily: Fonts.alegreyaRegular,
    fontSize: 14,
    color: Colors.text_muted,
  },
  itemValue: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 16,
    color: Colors.shortcut_employees_text,
  },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: Fonts.alegreyaRegular,
    fontSize: 16,
    color: Colors.hint,
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
  panelTitle: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.text_card,
  },
  panelLabel: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 16,
    lineHeight: 25,
    color: Colors.text_card,
  },
  saveCard: {
    marginTop: 12,
  },
  saveText: {
    flex: 1,
    textAlign: 'center',
  },
});
