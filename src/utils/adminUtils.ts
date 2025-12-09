import { User } from 'firebase/auth';
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const ADMIN_EMAIL = 'admin@skyquest.com';

export const isAdmin = (user: User | null | undefined): boolean => {
    if (!user || !user.email) return false;
    return user.email === ADMIN_EMAIL;
};

export const resetAdminData = async (userId: string) => {
    const batch = writeBatch(db);

    // 1. Reset User Data
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
        points: 0,
        level: 1,
        totalCompletions: 0,
        earnedBadgeIds: [],
        streakBreakCount: 0,
    });

    // 2. Reset Habits
    const habitsQuery = query(collection(db, 'habits'), where('userId', '==', userId));
    const habitsSnapshot = await getDocs(habitsQuery);

    habitsSnapshot.forEach((habitDoc) => {
        batch.update(habitDoc.ref, {
            completedDates: [],
            streak: 0,
        });
    });

    await batch.commit();
};
