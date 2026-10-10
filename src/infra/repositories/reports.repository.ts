import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'
import { api } from "../api/api"
import { TimeEntryFilters } from "../models"
import { TokenStorage } from '../storage/token'
import { toQueryParams } from './time-entries.repository'

export class ReportsRepository {
    /** O backend responde 500 quando o mês não tem registros; verifique antes de chamar. */
    public async shareMonthlyReport(filters: TimeEntryFilters): Promise<void> {
        const fileName = `relatorio-servicos-${filters.month}_${filters.year}.xlsx`

        if (Platform.OS === 'web') {
            const { data } = await api.get<Blob>('/reports/time-entries', {
                params: toQueryParams(filters),
                responseType: 'blob'
            })
            const url = URL.createObjectURL(data)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            link.click()
            URL.revokeObjectURL(url)
            return
        }

        const query = new URLSearchParams(toQueryParams(filters)).toString()
        const token = await TokenStorage.getToken()
        const file = await File.downloadFileAsync(
            `${api.defaults.baseURL}/reports/time-entries?${query}`,
            new File(Paths.cache, fileName),
            { headers: token ? { Authorization: `Bearer ${token}` } : {}, idempotent: true }
        )

        await Sharing.shareAsync(file.uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Relatório mensal'
        })
    }
}
