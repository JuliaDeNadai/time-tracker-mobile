import { TimeEntry, TimeEntryFilters } from '@/infra/models'
import { hoursToMinutes, parseApiDate } from './time'

const DAY = 24 * 60 * 60 * 1000

function startOfWeek(date: Date): Date {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const weekday = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - weekday)
    return start
}

/** Meses que cobrem a semana atual e a anterior (1 ou 2 meses). */
export function monthsForTwoWeeks(now: Date): TimeEntryFilters[] {
    const previousWeekStart = new Date(startOfWeek(now).getTime() - 7 * DAY)
    const months = [
        { year: previousWeekStart.getFullYear(), month: previousWeekStart.getMonth() + 1 },
        { year: now.getFullYear(), month: now.getMonth() + 1 }
    ]
    return months[0].month === months[1].month && months[0].year === months[1].year ? [months[1]] : months
}

/** Horas por dia (segunda a domingo) na semana atual e na anterior. */
export function weeklyHours(entries: TimeEntry[], now: Date) {
    const current = Array(7).fill(0)
    const previous = Array(7).fill(0)
    const weekStart = startOfWeek(now).getTime()

    for (const entry of entries) {
        const date = parseApiDate(entry.clock_in)
        if (!date) continue
        const hours = hoursToMinutes(entry.total_hours) / 60
        const weekday = (date.getDay() + 6) % 7
        const time = date.getTime()

        if (time >= weekStart && time < weekStart + 7 * DAY) current[weekday] += hours
        else if (time >= weekStart - 7 * DAY && time < weekStart) previous[weekday] += hours
    }

    return { current, previous }
}
