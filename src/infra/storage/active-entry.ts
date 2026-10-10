import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACTIVE_ENTRY_KEY = 'active_time_entry';

/** O backend não lista jornadas em andamento, então guardamos a ativa no aparelho. */
export interface ActiveEntry {
  id: string;
  serviceName: string;
  companyName: string;
  startedAt: string;
}

export const ActiveEntryStorage = {
  async save(entry: ActiveEntry): Promise<void> {
    const value = JSON.stringify(entry);
    if (Platform.OS === 'web') {
      localStorage.setItem(ACTIVE_ENTRY_KEY, value);
      return;
    }
    await SecureStore.setItemAsync(ACTIVE_ENTRY_KEY, value);
  },

  async get(): Promise<ActiveEntry | null> {
    const value = Platform.OS === 'web'
      ? localStorage.getItem(ACTIVE_ENTRY_KEY)
      : await SecureStore.getItemAsync(ACTIVE_ENTRY_KEY);
    return value ? JSON.parse(value) : null;
  },

  async remove(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(ACTIVE_ENTRY_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(ACTIVE_ENTRY_KEY);
  },
};
