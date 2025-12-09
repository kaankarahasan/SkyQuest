import { Badge } from '../types/gamification';

const TIERS = [
    'Gezgin',      // 1-10
    'Gözcü',       // 11-20
    'Yolcu',       // 21-30
    'Çırak',       // 31-40
    'Kalfa',       // 41-50
    'Usta',        // 51-60
    'Uzman',       // 61-70
    'Hükümdar',    // 71-80
    'Efsane',      // 81-90
    'Ejderdoğan'   // 91-100
];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// Tier colors or logic could be added here if needed

export const LEVEL_TITLES: { [key: number]: string } = {};

TIERS.forEach((tier, tierIndex) => {
    ROMAN_NUMERALS.forEach((roman, rankIndex) => {
        const level = (tierIndex * 10) + (rankIndex + 1);
        LEVEL_TITLES[level] = `${tier} ${roman}`;
    });
});

// Mapping of Tier Index (0-9) to Badge Images
// Assuming we recycle the 10 available badge images for the 10 tiers
const TIER_ICONS = [
    require('../assets/badges/badge_1.png'), // Gezgin
    require('../assets/badges/badge_2.png'), // Gözcü
    require('../assets/badges/badge_3.png'), // Yolcu
    require('../assets/badges/badge_4.png'), // Çırak
    require('../assets/badges/badge_5.png'), // Kalfa
    require('../assets/badges/badge_6.png'), // Usta
    require('../assets/badges/badge_7.png'), // Uzman
    require('../assets/badges/badge_8.png'), // Hükümdar
    require('../assets/badges/badge_9.png'), // Efsane
    require('../assets/badges/badge_10.png'), // Ejderdoğan
];

// Special Manual Badges (Streaks, First Step, Completions)
const SPECIAL_BADGES: Badge[] = [
    {
        id: '1',
        title: 'İlk Adım',
        description: 'İlk alışkanlığını tamamlayarak Skyrim macerana başladın.',
        icon: require('../assets/badges/badge_1.png'),
        unlockCondition: (user: any) => user.points >= 1,
    },
    {
        id: '2',
        title: '7 Günlük Seri',
        description: 'Bir hafta boyunca aralıksız devam ettin. İradesi çelik gibi!',
        icon: require('../assets/badges/badge_2.png'),
        unlockCondition: (user: any, habitData: any) => habitData?.streak >= 7,
    },
    {
        id: '4',
        title: 'Bir Ayın Azmi',
        description: '30 günlük seri! Sen gerçek bir Nord gibisin.',
        icon: require('../assets/badges/badge_4.png'),
        unlockCondition: (user: any, habitData: any) => habitData?.streak >= 30,
    },
    {
        id: '7',
        title: 'Kusursuz Hafta',
        description: 'Haftanın her günü eksiksiz tamamlandı.',
        icon: require('../assets/badges/badge_7.png'),
        unlockCondition: (user: any) => false, // Special logic needed
    },
    {
        id: '8',
        title: 'Alışkanlık Ustası',
        description: 'Toplam 10 alışkanlık tamamladın.',
        icon: require('../assets/badges/badge_8.png'),
        unlockCondition: (user: any) => user.totalCompletions >= 10,
    },
    {
        id: '9',
        title: 'Büyücü',
        description: 'Odaklanma yeteneğin efsanevi boyutlara ulaştı.',
        icon: require('../assets/badges/badge_9.png'),
        unlockCondition: (user: any) => false, // Manual or special logic
    },
];

// Generate Level Badges 1-100
const LEVEL_BADGES: Badge[] = [];

for (let i = 1; i <= 100; i++) {
    const tierIndex = Math.floor((i - 1) / 10);
    // Use the tier icon, ensuring we don't go out of bounds (though Math.floor((100-1)/10) = 9, so it fits 0-9)
    const icon = TIER_ICONS[Math.min(tierIndex, 9)];

    LEVEL_BADGES.push({
        id: `level_${i}`,
        title: LEVEL_TITLES[i] || `Seviye ${i}`,
        description: `${i}. seviyeye ulaştın!`,
        icon: icon,
        unlockCondition: (user: any) => user.level >= i,
    });
}

export const BADGES: Badge[] = [
    ...SPECIAL_BADGES,
    ...LEVEL_BADGES
];
