export type RepeatType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Habit {
    id: string;
    userId: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    repeatType: RepeatType;
    selectedDays: number[]; // 0-6 for days of week
    createdAt: any; // Firestore Timestamp
    completedDates: string[]; // ISO date strings or custom keys
    streak: number;
    category: string;
    focusHabitEnabled?: boolean;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoUrl: string | null;
    points: number;
    level: number;
    earnedBadgeIds: string[];
    totalCompletions: number;
    streakBreakCount?: number;
}
