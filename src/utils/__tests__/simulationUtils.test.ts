import { simulateUsage } from '../simulationUtils';

// --- MOCK KURULUMU BAŞLANGICI ---
// Firebase fonksiyonlarını taklit ediyoruz.
// Gerçek veritabanına bağlanmasını engelliyoruz.

const mockTransaction = {
    get: jest.fn(),
    update: jest.fn(),
};

jest.mock('../../../firebaseConfig', () => ({
    db: {}, // Boş bir obje yeterli
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    // runTransaction'ı çağrıldığında doğrudan içindeki fonksiyonu çalıştıracak şekilde ayarlıyoruz
    runTransaction: jest.fn((db, callback) => callback(mockTransaction)),
}));

// --- TESTLER ---

describe('simulateUsage (Simülasyon) Testleri', () => {
    // Her testten önce mock'ları temizleyelim ki testler birbirini etkilemesin
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('SUCCESS senaryosu: Puanlar artmalı ve completedDates güncellenmeli', async () => {
        // 1. Arrange (Hazırlık)

        // Mock: Kullanıcı verisi
        mockTransaction.get.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({
                points: 100,
                earnedBadgeIds: [],
                totalCompletions: 5
            })
        });

        // Mock: Alışkanlıklar (querySnapshot)
        // Kullanıcının 1 tane Günlük (Daily) alışkanlığı olsun
        const requireFirestore = require('firebase/firestore');
        requireFirestore.getDocs.mockResolvedValueOnce({
            empty: false,
            docs: [
                {
                    ref: 'habit-ref-1',
                    data: () => ({
                        streak: 0,
                        repeatType: 'Daily',
                        completedDates: [], // Hiç yapılmamış
                        focusHabitEnabled: false
                    })
                }
            ]
        });

        // Simülasyon Tarihleri: 1 Ocak'tan 3 Ocak'a (2 gün sürecek: 1 Ocak ve 2 Ocak)
        const startDate = new Date(2024, 0, 1);
        const targetDate = new Date(2024, 0, 3);

        // 2. Act (Çalıştır)
        const result = await simulateUsage(startDate, targetDate, 'test-user-id', 'success');

        // 3. Assert (Kontrol)

        // 2 gün geçtiği için 2 puan kazanmalı (Her gün 1 puan)
        expect(result.pointsChanged).toBe(2);

        // Transaction update çağrıldı mı?
        expect(mockTransaction.update).toHaveBeenCalled();

        // Veritabanına gönderilen son kullanıcı verisini kontrol edelim
        // 1. çağrı kullanıcı güncellemesi olur genelde
        const userUpdateCall = mockTransaction.update.mock.calls[0];
        const updatedUser = userUpdateCall[1];

        // 100 puandı, 2 puan kazandı -> 102 olmalı
        expect(updatedUser.points).toBe(102);
    });

    test('FAILURE senaryosu: Streak > 3 ise ceza uygulanmalı', async () => {
        // Mock: Kullanıcı (Puanı var)
        mockTransaction.get.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ points: 50 })
        });

        // Mock: Alışkanlık (Streak'i 10 olan bir alışkanlık)
        const requireFirestore = require('firebase/firestore');
        requireFirestore.getDocs.mockResolvedValueOnce({
            empty: false,
            docs: [
                {
                    ref: 'habit-ref-2',
                    data: () => ({
                        streak: 10, // Kritik eşiğin üzerinde!
                        repeatType: 'Daily',
                        completedDates: [],
                    })
                }
            ]
        });

        // 1 günlük bir başarısızlık simülasyonu
        const startDate = new Date(2024, 0, 1);
        const targetDate = new Date(2024, 0, 2);

        const result = await simulateUsage(startDate, targetDate, 'user-1', 'failure');

        // Ceza uygulandı mı? (Kodunuzda max ceza 2 puan)
        expect(result.penaltiesApplied).toBeGreaterThan(0);

        // Sonuçta puan düşüşü olmalı
        expect(result.pointsChanged).toBeLessThan(0); // -2 olması beklenir
    });
});