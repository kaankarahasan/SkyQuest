import { collection, doc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Habit, User } from '../types';
import { calculateLevel, checkBadges } from './gamificationUtils';
import { getCompletionKey } from './habitUtils';

export const simulateUsage = async (startDate: Date, targetDate: Date, userId: string, scenario: 'success' | 'failure'): Promise<{ pointsChanged: number; penaltiesApplied: number; notificationsSent: number }> => {
    // 1. Get all user habits
    const q = query(collection(db, 'habits'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return { pointsChanged: 0, penaltiesApplied: 0, notificationsSent: 0 };

    if (targetDate <= startDate) return { pointsChanged: 0, penaltiesApplied: 0, notificationsSent: 0 };

    let simulationStats = { pointsChanged: 0, penaltiesApplied: 0, notificationsSent: 0 };

    // Use a transaction to ensure User points and Habit completions stay in sync
    await runTransaction(db, async (transaction) => {
        // Fetch User Data first
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) throw new Error("User not found");
        let userData = userDoc.data() as User;

        // Track current points locally to prevent negative score during simulation day-by-day
        let currentTotalPoints = userData.points || 0;

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
                        currentTotalPoints += pointsValue;
                    }
                } else {
                    // In FAILURE mode
                    // Check logic: If missed habit
                    // Since we are in Failure mode, we assume missed.
                    // But we should only penalize if it was a valid day for the habit (e.g. daily vs weekly)
                    // For Daily habits: Every day is a due day.
                    // For now assuming Daily for simplicity or that simple daily check is enough.

                    if (currentStreak >= 3) {
                        currentStreak = 0;
                        // Apply Penalty
                        if (currentTotalPoints > 0) {
                            // Deduct 2, but max deduction is current points (don't go negative)
                            const deduction = Math.min(2, currentTotalPoints);
                            totalNewPoints -= deduction;
                            currentTotalPoints -= deduction;
                            simulationStats.penaltiesApplied += 1;
                        }
                    } else {
                        // Just reset streak (no penalty)
                        // Notification logic: If they had some streak (e.g. 1 or 2) and lost it? 
                        // Or just if they miss it?
                        // User said: "If they don't [have streak >= 3], show a notification."
                        // This implies notifications happen on miss when streak < 3.
                        if (currentStreak > 0) {
                            currentStreak = 0;
                        }
                        simulationStats.notificationsSent += 1;
                    }
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

        // Apply Gamification Updates
        // Note: totalNewPoints can be negative in failure mode
        let updatedUser = { ...userData };
        const finalPoints = Math.max(0, (userData.points || 0) + totalNewPoints);
        const finalTotalCompletions = (userData.totalCompletions || 0) + totalNewCompletions;
        const { level, title } = calculateLevel(finalPoints);

        if (scenario === 'success') {
            updatedUser = {
                ...userData,
                points: finalPoints,
                level,
                totalCompletions: finalTotalCompletions,
                earnedBadgeIds: Array.from(newEarnedBadges)
            };
            const unlockedUserBadges = checkBadges(updatedUser, { streak: 30 });
            const allBadges = new Set([...updatedUser.earnedBadgeIds, ...unlockedUserBadges]);
            updatedUser.earnedBadgeIds = Array.from(allBadges);
        } else {
            // Failure Mode updates (only points/level might drop, badges usually stay?)
            // User didn't specify losing badges/levels.
            updatedUser = {
                ...userData,
                points: finalPoints,
                level
            };
        }

        simulationStats.pointsChanged = totalNewPoints;

        // Commit Updates
        transaction.update(userRef, updatedUser);

        habitsToUpdate.forEach((h) => {
            transaction.update(h.ref, h.data);
        });
    });

    return simulationStats;
};
