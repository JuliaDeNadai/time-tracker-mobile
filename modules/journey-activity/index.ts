import { requireOptionalNativeModule } from 'expo';

export interface JourneyActivityOptions {
  entryId: string;
  title: string;
  subtitle: string;
  /** Epoch em milissegundos. */
  startedAt: number;
  /** Deep link aberto ao tocar na notificação / Live Activity / bolha. */
  openUrl: string;
  /** Deep link aberto pelo botão "Encerrar". */
  stopUrl: string;
}

interface JourneyActivityNativeModule {
  start(options: JourneyActivityOptions): Promise<void> | void;
  stop(): Promise<void> | void;
  /** Android: permissão "Sobrepor a outros apps". Sempre `false` no iOS. */
  canDrawOverlays(): boolean;
  requestOverlayPermission(): void;
  /** Preferência do usuário para exibir a bolha (padrão: ativada). */
  isOverlayEnabled(): boolean;
  setOverlayEnabled(enabled: boolean): void;
}

/**
 * Notificação com cronômetro + bolha flutuante (Android) e Live Activity (iOS).
 * `null` no Expo Go e na web, onde o código nativo não existe.
 */
export const JourneyActivity = requireOptionalNativeModule<JourneyActivityNativeModule>('JourneyActivity');
