import { NamedResource } from '@/infra/models'

export const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const pad = (value: number) => String(value).padStart(2, '0')

/** Converte "dd/MM/yyyy, HH:mm:ss" (formato do backend) em Date. */
export function parseApiDate(value: string | null): Date | null {
    if (!value) return null
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})(?::(\d{2}))?/)
    if (!match) return null
    const [, day, month, year, hours, minutes, seconds = '0'] = match
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds))
}

export function formatDate(date: Date): string {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

export function formatTime(date: Date): string {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** "HH:MM" -> minutos */
export function hoursToMinutes(value: string | null): number {
    if (!value) return 0
    const [hours, minutes] = value.split(':').map(Number)
    return (hours || 0) * 60 + (minutes || 0)
}

/** minutos -> "HH:MM" */
export function formatMinutes(totalMinutes: number): string {
    return `${pad(Math.floor(totalMinutes / 60))}:${pad(Math.round(totalMinutes % 60))}`
}

export function formatElapsed(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${pad(hours)}:${pad(minutes)}:${pad(totalSeconds % 60)}`
}

export function formatCurrency(value: string | number | null): string {
    const amount = Number(value ?? 0)
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function refName(ref: string | NamedResource): string {
    return typeof ref === 'string' ? '' : ref.name
}
