import ActionCard from '@/components/action-card';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import React, { useSyncExternalStore } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface PendingAlert extends ConfirmOptions {
  /** Sem cancelText é um aviso simples, com um único botão. */
  resolve: (confirmed: boolean) => void;
}

let queue: PendingAlert[] = [];
const listeners = new Set<() => void>();

/** A fila é substituída (nunca mutada) para o useSyncExternalStore detectar a mudança. */
function setQueue(next: PendingAlert[]) {
  queue = next;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

const getCurrent = () => queue[0] ?? null;

/** No Android usa o modal customizado; no iOS e na web mantém o alerta nativo. */
function enqueue(alert: PendingAlert) {
  if (Platform.OS === 'web') {
    const text = alert.title ? `${alert.title}\n\n${alert.message}` : alert.message;
    if (alert.cancelText) {
      alert.resolve(window.confirm(text));
    } else {
      window.alert(text);
      alert.resolve(true);
    }
    return;
  }

  if (Platform.OS !== 'android' || listeners.size === 0) {
    Alert.alert(alert.title ?? alert.message, alert.title ? alert.message : undefined, [
      ...(alert.cancelText ? [{ text: alert.cancelText, style: 'cancel' as const, onPress: () => alert.resolve(false) }] : []),
      { text: alert.confirmText ?? 'OK', style: alert.destructive ? 'destructive' : 'default', onPress: () => alert.resolve(true) },
    ], { cancelable: false });
    return;
  }

  setQueue([...queue, alert]);
}

export function showAlert(message: string, title?: string): Promise<void> {
  return new Promise(resolve => enqueue({ message, title, resolve: () => resolve() }));
}

export function showConfirm({ cancelText = 'Cancelar', ...options }: ConfirmOptions): Promise<boolean> {
  return new Promise(resolve => enqueue({ ...options, cancelText, resolve }));
}

export function AlertHost() {
  const current = useSyncExternalStore(subscribe, getCurrent);

  function close(confirmed: boolean) {
    const [first, ...rest] = queue;
    setQueue(rest);
    first?.resolve(confirmed);
  }

  return (
    <Modal visible={!!current} transparent animationType="fade" statusBarTranslucent onRequestClose={() => close(false)}>
      <Pressable style={styles.backdrop} onPress={current?.cancelText ? () => close(false) : undefined}>
        <Pressable style={styles.panel}>
          {current?.title && <Text style={styles.title}>{current.title}</Text>}
          <Text style={styles.message}>{current?.message}</Text>

          <View style={styles.actions}>
            {current?.cancelText && (
              <TouchableOpacity style={styles.cancel} onPress={() => close(false)}>
                <Text style={styles.cancelText}>{current.cancelText}</Text>
              </TouchableOpacity>
            )}
            {current?.destructive ? (
              <TouchableOpacity style={[styles.button, styles.destructive]} onPress={() => close(true)} activeOpacity={0.85}>
                <Text style={[styles.buttonText, styles.destructiveText]}>{current.confirmText ?? 'OK'}</Text>
              </TouchableOpacity>
            ) : (
              <ActionCard
                text={current?.confirmText ?? 'OK'}
                onPress={() => close(true)}
                style={styles.button}
                textStyle={styles.buttonText}
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.text_card,
  },
  message: {
    fontFamily: Fonts.alegreyaRegular,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.text_dark,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  cancel: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: Colors.white,
  },
  cancelText: {
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 18,
    color: Colors.text_card,
  },
  button: {
    flex: 1,
    height: 60,
    borderRadius: 24,
    justifyContent: 'center',
  },
  destructive: {
    alignItems: 'center',
    backgroundColor: Colors.danger,
  },
  destructiveText: {
    flex: 0,
  },
  buttonText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.signikaSemiBold,
    fontSize: 18,
    color: Colors.white,
  },
});
