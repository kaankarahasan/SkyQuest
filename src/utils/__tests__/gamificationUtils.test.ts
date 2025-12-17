import { calculateLevel, checkBadges } from '../gamificationUtils';
import { User } from '../../types';

describe('Gamification (Oyunlaştırma) Testleri', () => {

    // --- BÖLÜM 1: Seviye Hesaplama Testleri ---
    describe('calculateLevel Fonksiyonu', () => {

        test('0 puan alan kullanıcı Seviye 1 olmalı', () => {
            const result = calculateLevel(0);
            expect(result.level).toBe(1);
            // constants/gamification.ts dosyanızdaki mantığa göre ilk seviye 'Gezgin I'
            expect(result.title).toBe('Gezgin I');
        });

        test('10 puan alan kullanıcı Seviye 2\'ye yükselmeli', () => {
            // Mantık: Math.floor(10 / 10) + 1 = 2
            const result = calculateLevel(10);
            expect(result.level).toBe(2);
        });

        test('55 puan alan kullanıcı Seviye 6 olmalı', () => {
            // Mantık: Math.floor(55 / 10) + 1 = 6
            const result = calculateLevel(55);
            expect(result.level).toBe(6);
            expect(result.title).toBe('Gezgin VI');
        });
    });

    // --- BÖLÜM 2: Rozet (Badge) Kazanma Testleri ---
    describe('checkBadges Fonksiyonu', () => {

        // Testlerde kullanmak için standart, temiz bir "Sahte Kullanıcı" (Mock User) oluşturalım
        const mockUser: User = {
            uid: 'test-user-id',
            email: 'test@skyquest.com',
            displayName: 'SkyWalker',
            photoUrl: null,
            points: 0,
            level: 1,
            earnedBadgeIds: [], // Başlangıçta hiç rozeti yok
            totalCompletions: 0
        };

        test('Kullanıcı 1 puana ulaşınca "İlk Adım" (ID: 1) rozetini kazanmalı', () => {
            // 1. Arrange: Puanı 1 olan bir kullanıcı simüle et
            const userWithPoints = { ...mockUser, points: 1 };

            // 2. Act: Fonksiyonu çalıştır
            // habitData boş olabilir çünkü bu rozet sadece puana bakıyor
            const unlockedBadges = checkBadges(userWithPoints, {});

            // 3. Assert: Dönen listede '1' nolu rozet var mı?
            expect(unlockedBadges).toContain('1');
        });

        test('Kullanıcı zaten rozete sahipse, tekrar verilmemeli', () => {
            // Kullanıcının zaten '1' nolu rozeti var
            const userWithExistingBadge = {
                ...mockUser,
                points: 5,
                earnedBadgeIds: ['1']
            };

            const unlockedBadges = checkBadges(userWithExistingBadge, {});

            // Sonuç boş olmalı, çünkü yeni bir şey kazanmadı
            expect(unlockedBadges).not.toContain('1');
        });

        test('7 Günlük Seri yapıldığında "Seri" (ID: 2) rozeti kazanılmalı', () => {
            // Bu sefer 'habitData' içinde streak bilgisini gönderiyoruz
            const habitData = { streak: 7 };

            const unlockedBadges = checkBadges(mockUser, habitData);

            expect(unlockedBadges).toContain('2');
        });

        test('Seri 6 gün ise rozet VERİLMEMELİ', () => {
            // Sınır değeri testi (Boundary Value Analysis)
            const habitData = { streak: 6 };

            const unlockedBadges = checkBadges(mockUser, habitData);

            expect(unlockedBadges).not.toContain('2');
        });
    });
});