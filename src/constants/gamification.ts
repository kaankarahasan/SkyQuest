import { Badge } from '../types/gamification';

// Level titles based on Skyrim leveling
export const LEVEL_TITLES: { [key: number]: string } = {
    1: 'Acemi (Novice)',
    2: 'Çırak (Apprentice)',
    3: 'Usta (Adept)',
    4: 'Uzman (Expert)',
    5: 'Üstad (Master)',
    6: 'Efsanevi (Legendary)',
    7: 'Ejderdoğan (Dragonborn)',
    8: 'Yüksek Hrothgar Üstadı',
    9: 'Sovngarde Kahramanı',
    10: 'Tamriel Efsanesi',
};

export const BADGES: Badge[] = [
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
        // Logic will be handled in utility, this is just a placeholder/flag
        unlockCondition: (user: any, habitData: any) => habitData?.streak >= 7,
    },
    {
        id: '3',
        title: 'Seviye 1: Acemi',
        description: 'İlk 10 puanını topladın ve ilk seviyeyi geçtin.',
        icon: require('../assets/badges/badge_3.png'),
        unlockCondition: (user: any) => user.points >= 10,
    },
    {
        id: '4',
        title: 'Bir Ayın Azmi',
        description: '30 günlük seri! Sen gerçek bir Nord gibisin.',
        icon: require('../assets/badges/badge_4.png'),
        unlockCondition: (user: any, habitData: any) => habitData?.streak >= 30,
    },
    {
        id: '5',
        title: 'Yarı Yol',
        description: '50 Puan topladın. Yolun yarısı bitti, yarısı kaldı.',
        icon: require('../assets/badges/badge_5.png'),
        unlockCondition: (user: any) => user.points >= 50,
    },
    {
        id: '6',
        title: 'Yüzlük',
        description: '100 Puan! Artık sen bir ustasın.',
        icon: require('../assets/badges/badge_6.png'),
        unlockCondition: (user: any) => user.points >= 100,
    },
    {
        id: '7',
        title: 'Kursursuz Hafta',
        description: 'Haftanın her günü eksiksiz tamamlandı.',
        icon: require('../assets/badges/badge_7.png'),
        unlockCondition: (user: any) => false, // Special logic needed
    },
    {
        id: '8',
        title: 'Alışkanlık Ustası',
        description: 'Toplam 200 alışkanlık tamamladın.',
        icon: require('../assets/badges/badge_8.png'),
        unlockCondition: (user: any) => user.totalCompletions >= 200,
    },
    {
        id: '9',
        title: 'Büyücü',
        description: 'Odaklanma yeteneğin efsanevi boyutlara ulaştı.',
        icon: require('../assets/badges/badge_9.png'),
        unlockCondition: (user: any) => false, // Manual or special logic
    },
    {
        id: '10',
        title: 'Ejderdoğan',
        description: 'En yüksek onura eriştin. Skyrim seninle gurur duyuyor.',
        icon: require('../assets/badges/badge_10.png'),
        unlockCondition: (user: any) => user.level >= 10,
    },
];
