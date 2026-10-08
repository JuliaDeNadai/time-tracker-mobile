import { formatCurrency } from '@/utils/time';
import { StartTimeEntryParameters, TimeEntry } from './models';
import { JourneyNotification } from './notifications/journey-notification';
import { TimeEntriesRepository } from './repositories/time-entries.repository';
import { ActiveEntry, ActiveEntryStorage } from './storage/active-entry';

const timeEntriesRepository = new TimeEntriesRepository();

export function journeySummary(finished: TimeEntry): string {
  return `Jornada encerrada!\nTotal: ${finished.total_hours ?? '00:00'} horas\nValor: ${formatCurrency(finished.total_amount)}`;
}

/** Inicia/encerra a jornada mantendo API, armazenamento local e notificação em sincronia. */
export const Journey = {
  async start(params: StartTimeEntryParameters, names: { serviceName: string, companyName: string }): Promise<ActiveEntry> {
    const entry = await timeEntriesRepository.start(params);
    const active: ActiveEntry = { id: entry._id, ...names, startedAt: new Date().toISOString() };
    await ActiveEntryStorage.save(active);
    await JourneyNotification.show(active);
    return active;
  },

  async stop(id: string): Promise<TimeEntry> {
    const finished = await timeEntriesRepository.stop(id);
    await ActiveEntryStorage.remove();
    await JourneyNotification.dismiss();
    return finished;
  },
};
