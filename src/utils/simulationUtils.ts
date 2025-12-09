import { collection, doc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Habit, User } from '../types';
import { calculateLevel, checkBadges } from './gamificationUtils';
import { getCompletionKey } from './habitUtils';

export const simulateUsage = async (startDate: Date, targetDate: Date, userId: string, scenario: 'success' | 'failure'): Promise<void> => {
    // 1. Get all user habits
    const q = query(collection(db, 'habits'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return;

    if (targetDate <= startDate) return;

    // Use a transaction to ensure User points and Habit completions stay in sync
    await runTransaction(db, async (transaction) => {
        // Fetch User Data first
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) throw new Error("User not found");
        let userData = userDoc.data() as User;

        let totalNewPoints = 0;
        let totalNewCompletions = 0;
        let newEarnedBadges = new Set(userData.earnedBadgeIds || []);

        const habitsToUpdate: { ref: any, data: any }[] = [];

        querySnapshot.docs.forEach((habitDoc) => {
            const habit = habitDoc.data() as Habit;
            const completedDates = new Set(habit.completedDates || []);
            let currentStreak = habit.streak || 0;

            // Start from the provided startDate
            const currentDate = new Date(startDate);

            // Loop strictly LESS THAN targetDate to leave the target day "fresh"
            while (currentDate < targetDate) {
                const key = getCompletionKey(currentDate, habit.repeatType);
                const pointsValue = habit.focusHabitEnabled ? 3 : 1;

                if (scenario === 'success') {
                    // In SUCCESS mode, we complete everything
                    if (!completedDates.has(key)) {
                        completedDates.add(key);
                        totalNewPoints += pointsValue;
                        totalNewCompletions += 1;
                        currentStreak += 1;
                    }
                } else {
                    // In FAILURE mode, we do NOTHING.
                    // Apps streak calculation will naturally see gaps and reset to 0 when loaded.
                    // We don't need to manually reset currentStreak here because calculateStreak(localHabit.completedDates) 
                    // in UI will return 0 if recent dates are missing.
                    // However, we SHOULD NOT add any completions.
                }

                // Advance one day
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Prepare Habit Update
            habitsToUpdate.push({
                ref: habitDoc.ref,
                data: {
                    completedDates: Array.from(completedDates),
                    streak: currentStreak
                }
            });
        });

        // Apply Gamification Updates (only relevant for Success)
        let updatedUser = { ...userData };
        if (scenario === 'success') {
            const finalPoints = (userData.points || 0) + totalNewPoints;
            const finalTotalCompletions = (userData.totalCompletions || 0) + totalNewCompletions;
            const { level, title } = calculateLevel(finalPoints);

            updatedUser = {
                ...userData,
                points: finalPoints,
                level,
                totalCompletions: finalTotalCompletions,
                earnedBadgeIds: Array.from(newEarnedBadges)
            };

            // Check Badges based on new state
            // We pass a dummy habitData for badge checks that might depend on single habit streak.
            // But since 'checkBadges' iterates BADGES, and some depend on 'habitData.streak', 
            // we should technically check per habit. 
            // For simplicity in simulation:
            // 1. User-level badges (Points, Level, TotalCompletions) will be caught here.
            // 2. Habit-streak badges might be missed if we don't pass specific habit data.
            // Let's do a generic check.
            const unlockedUserBadges = checkBadges(updatedUser, { streak: 30 }); // Assume massive streak for success
            const allBadges = new Set([...updatedUser.earnedBadgeIds, ...unlockedUserBadges]);
            updatedUser.earnedBadgeIds = Array.from(allBadges);
        }

        // Commit Updates
        // 1. Update User
        transaction.update(userRef, updatedUser);

        // 2. Update Habits
        habitsToUpdate.forEach((h) => {
            transaction.update(h.ref, h.data);
        });
    });
};
