import { RepeatType } from '../types';

// Helper to get ISO week number
const getISOWeek = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getCompletionKey = (date: Date, frequency: RepeatType): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // For Weekly, we now store the specific date (YYYY-MM-DD) to track WHICH day it was done.
    // The aggregation logic (isCompleted) will handle checking if "any day in this week" is done.
    if (frequency === 'Weekly') {
        return `${year}-${month}-${day}`;
    }

    switch (frequency) {
        case 'Daily':
            return `${year}-${month}-${day}`;
        case 'Monthly':
            return `${year}-${month}`;
        case 'Yearly':
            return `${year}`;
        default:
            return `${year}-${month}-${day}`;
    }
};

export const isCompleted = (completedDates: string[], frequency: RepeatType, date: Date = new Date()): boolean => {
    if (!completedDates || completedDates.length === 0) return false;

    if (frequency === 'Weekly') {
        // Special logic for Weekly: Check if ANY date in the current week is in completedDates.
        // We assume completedDates contains YYYY-MM-DD strings for Weekly habits now.

        const currentWeek = getISOWeek(date);
        const currentYear = date.getFullYear(); // Warning: End of year boundary issues possible, but usually ISO week implies year context.
        // Actually, simple ISO week comparison is risky across years.
        // Better: Check if any completedDate falls in the same week.

        return completedDates.some(dateStr => {
            // Check format YYYY-MM-DD
            if (dateStr.length !== 10) return false; // Ignore old YYYY-Www keys if any
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return false;

            // Check if same year and week (mostly sufficient)
            // A more robust way is to check the Week Key:
            const dWeek = getISOWeek(d);
            const dYear = d.getFullYear(); // This is roughly ok, but ISO week year is better.

            // Let's use the old getWeekKey logic to compare "Week IDs"
            const dIsoKey = getIsoKey(d);
            const targetIsoKey = getIsoKey(date);
            return dIsoKey === targetIsoKey;
        });
    }

    const key = getCompletionKey(date, frequency);
    return completedDates.includes(key);
};

const getIsoKey = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

export const calculateStreak = (completedDates: string[], frequency: RepeatType): number => {
    if (!completedDates || completedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let currentCheckDate = new Date(today);

    // Check if completed today (or current period)
    if (isCompleted(completedDates, frequency, currentCheckDate)) {
        streak++;
    } else {
        // Check previous period
        decrementDate(currentCheckDate, frequency);
        if (!isCompleted(completedDates, frequency, currentCheckDate)) {
            return 0; // Broken immediately
        }
        // If completed last period but not this one yet, streak starts from 1 (the last period)
        // Actually we incremented streak for "last period" in the catch-up loop? No.
        // Let's reset streak to 0 and loop from last period?
        // Standard logic:
        // If done today: streak = 1 + previous
        // If not done today but done yesterday: streak = previous

        // Re-reset logic:
        streak = 0; // Reset safe
        // Check if done today? No, we are here because NOT done today.
        // So we assume streak continues from previous period.
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
