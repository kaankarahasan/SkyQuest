import { getCompletionKey, calculateStreak } from '../habitUtils';

// 'describe': Testleri gruplamak için kullanılır. Burada habitUtils testlerini bir çatı altında topluyoruz.
describe('habitUtils Testleri', () => {

    // 'test' veya 'it': Tek bir test senaryosunu tanımlar.
    // İlk senaryomuz: Günlük (Daily) frekans için tarih formatı doğru mu?
    test('getCompletionKey fonksiyonu Günlük frekans için doğru formatı döndürmeli', () => {
        // 1. Arrange (Hazırlık): Test edilecek veriyi hazırla
        // Not: Ay bilgisinde 0 = Ocak olduğu için 9 = Ekim ayıdır.
        const testDate = new Date(2023, 9, 5); // 5 Ekim 2023

        // 2. Act (Eylem): Fonksiyonu çalıştır
        const result = getCompletionKey(testDate, 'Daily');

        // 3. Assert (Doğrulama): Sonucun beklediğimiz gibi olup olmadığını kontrol et
        // 5 Ekim 2023 için beklediğimiz çıktı: "2023-10-05"
        expect(result).toBe('2023-10-05');
    });

    // İkinci senaryo: Aylık (Monthly) frekans için kontrol
    test('getCompletionKey fonksiyonu Aylık frekans için sadece Yıl-Ay döndürmeli', () => {
        const testDate = new Date(2023, 11, 25); // 25 Aralık 2023
        const result = getCompletionKey(testDate, 'Monthly');

        // Beklenen: "2023-12" (Gün bilgisi olmamalı)
        expect(result).toBe('2023-12');
    });

    // Senaryo 1: Kullanıcı bugün ve dün alışkanlığını yapmış. Seri 2 olmalı.
    test('calculateStreak: Bugün ve dün yapıldıysa seri 2 dönmeli', () => {
        // 1. Arrange: Test verilerini hazırla
        const today = new Date(2024, 0, 10); // 10 Ocak 2024

        // Simüle edilmiş "tamamlanmış tarihler" listesi (YYYY-AA-GG formatında)
        const completedDates = [
            '2024-01-10', // Bugün
            '2024-01-09', // Dün
            // 8 Ocak yok, yani seri burada bitmeli
            '2024-01-05'  // Çok eski bir tarih, seriye dahil olmamalı
        ];

        // 2. Act: Fonksiyonu çalıştır
        const streak = calculateStreak(completedDates, 'Daily', today);

        // 3. Assert: Sonucu kontrol et
        expect(streak).toBe(2);
    });

    // Senaryo 2: Kullanıcı bugün yapmış ama dün yapmamış. Seri 1 olmalı.
    test('calculateStreak: Arada boşluk varsa seri sıfırlanmalı', () => {
        const today = new Date(2024, 0, 10); // 10 Ocak
        const completedDates = [
            '2024-01-10', // Bugün yapıldı
            // 9 Ocak EKSİK (Zincir kırıldı)
            '2024-01-08', // Evvelsi gün yapılmış ama zincir koptuğu için sayılmamalı
            '2024-01-07'
        ];

        const streak = calculateStreak(completedDates, 'Daily', today);

        // Beklenen: Sadece bugün sayılır, çünkü dün yapılmamış.
        expect(streak).toBe(1);
    });

    // Senaryo 3: Hiç veri yoksa seri 0 olmalı.
    test('calculateStreak: Veri yoksa 0 dönmeli', () => {
        const today = new Date();
        const streak = calculateStreak([], 'Daily', today);
        expect(streak).toBe(0);
    });
});


