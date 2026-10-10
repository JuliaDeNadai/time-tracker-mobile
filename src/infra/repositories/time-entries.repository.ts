import { api } from "../api/api"
import { StartTimeEntryParameters, TimeEntry, TimeEntryFilters } from "../models"

export function toQueryParams({ year, month, companyId, userId }: TimeEntryFilters) {
    return {
        year: String(year),
        month: String(month),
        ...(companyId ? { companyId } : {}),
        ...(userId ? { userId } : {})
    }
}

export class TimeEntriesRepository {
    /** Só retorna jornadas encerradas dentro do mês. */
    public async list(filters: TimeEntryFilters): Promise<TimeEntry[]> {
        const { data } = await api.get<TimeEntry[]>('/time-entries', { params: toQueryParams(filters) })
        return data
    }

    public async start(params: StartTimeEntryParameters): Promise<TimeEntry> {
        const { data } = await api.post<TimeEntry>('/time-entries', params)
        return data
    }

    public async stop(id: string): Promise<TimeEntry> {
        const { data } = await api.put<TimeEntry>(`/time-entries/${id}`)
        return data
    }
}
