import { BADGES, LEVEL_TITLES } from '../constants/gamification';
import { User } from '../types';

export const calculateLevel = (points: number) => {
    // Level up every 10 points
    const level = Math.floor(points / 10) + 1;
    const title = LEVEL_TITLES[level] || LEVEL_TITLES[10] || 'Unknown';
    return { level, title };
};

export const checkBadges = (user: User, habitData: any) => {
    const unlockedBadges: string[] = [];

    BADGES.forEach((badge) => {
        if (!user.earnedBadgeIds?.includes(badge.id)) {
            if (badge.unlockCondition(user, habitData)) {
                unlockedBadges.push(badge.id);
            }
        }
    });

    return unlockedBadges;
};
