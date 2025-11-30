import { RepeatType } from '../types';

export const getCompletionKey = (date: Date, frequency: RepeatType): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    switch (frequency) {
        case 'Daily':
            return `${year}-${month}-${day}`;
        case 'Weekly': {
            // ISO week date
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
            return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
        }
        case 'Monthly':
            return `${year}-${month}`;
        case 'Yearly':
            return `${year}`;
        default:
            return `${year}-${month}-${day}`;
    }
};

export const isCompleted = (completedDates: string[], frequency: RepeatType, date: Date = new Date()): boolean => {
    if (!completedDates) return false;
    const key = getCompletionKey(date, frequency);
    return completedDates.includes(key);
};

export const calculateStreak = (completedDates: string[], frequency: RepeatType): number => {
    if (!completedDates || completedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let currentCheckDate = new Date(today);

    // Check if completed today (or current period)
    if (isCompleted(completedDates, frequency, currentCheckDate)) {
        streak++;
    } else {
        // If not completed today, check if the streak was broken just today (i.e., completed yesterday)
        // If it wasn't completed yesterday either, streak is 0.
        // Actually, for a streak to be active, it usually means "consecutive periods ending now or just before now".
        // If I didn't do it today yet, my streak is technically still alive from yesterday, but if I miss today, it breaks tomorrow.
        // However, the prompt says "transferred to the counter... consecutive days".
        // Usually apps show current streak including today if done, or up to yesterday if not done today.

        // Let's check previous period.
        decrementDate(currentCheckDate, frequency);
        if (!isCompleted(completedDates, frequency, currentCheckDate)) {
            return 0;
        }
    }

    // Count backwards
    while (true) {
        decrementDate(currentCheckDate, frequency);
        if (isCompleted(completedDates, frequency, currentCheckDate)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

const decrementDate = (date: Date, frequency: RepeatType) => {
    switch (frequency) {
        case 'Daily':
            date.setDate(date.getDate() - 1);
            break;
        case 'Weekly':
            date.setDate(date.getDate() - 7);
            break;
        case 'Monthly':
            date.setMonth(date.getMonth() - 1);
            break;
        case 'Yearly':
            date.setFullYear(date.getFullYear() - 1);
            break;
    }
};
