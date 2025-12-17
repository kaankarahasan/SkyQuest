import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddHabitModal } from '../../components/AddHabitModal';
import { addDoc, updateDoc } from 'firebase/firestore';

// --- MOCK KURULUMU ---

// 1. Firebase Firestore Fonksiyonlarını Taklit Et
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(() => ({})), // Return object so expect.anything() passes
    doc: jest.fn(() => ({})), // Return object so expect.anything() passes
    addDoc: jest.fn(),    // Yeni ekleme için
    updateDoc: jest.fn(), // Güncelleme için
}));

// 2. Firebase Config (Auth) Taklidi
jest.mock('../../../firebaseConfig', () => ({
    auth: {
        currentUser: { uid: 'test-user-123' } // Oturum açmış sahte kullanıcı
    },
    db: {}
}));

// 3. Emoji Klavyesini Taklit Et (Testlerde sorun çıkarmaması için)
jest.mock('rn-emoji-keyboard', () => 'EmojiPicker');

describe('AddHabitModal (Alışkanlık Ekle/Düzenle) Testleri', () => {

    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Yeni Alışkanlık Ekleme Senaryosu (Mutlu Yol)', async () => {
        // addDoc başarılı dönsün
        (addDoc as jest.Mock).mockResolvedValueOnce({ id: 'new-habit-id' });

        const { getByPlaceholderText, getByText, getAllByText } = render(
            <AddHabitModal
                visible={true}
                onClose={mockOnClose}
            />
        );

        // 1. İsim ve Açıklama Gir
        fireEvent.changeText(getByPlaceholderText('Alışkanlık Adı'), 'Kitap Okuma');
        fireEvent.changeText(getByPlaceholderText('Açıklama Ekle'), 'Günde 20 sayfa');

        // 2. Kategori Seç (Kategori Seç butonuna bas, sonra açılan listeden Sağlık'ı seç)
        fireEvent.press(getByText('Kategori Seç'));
        // Modal açılacağı için "Sağlık" yazısını bulup tıklıyoruz
        // Not: Eğer "Sağlık" kategorisi constants dosyasında varsa. Yoksa kodunuzdaki bir kategoriyi seçin.
        // Örnek olarak 'Spor' veya 'Sanat' varsa onu yazın. Kodunuzda HABIT_CATEGORIES import edilmiş.
        // Varsayalım listede "Spor" var.
        const categoryOption = await waitFor(() => getByText('Spor'));
        fireEvent.press(categoryOption);

        // 3. Gün Seçimi (Pzt ve Çarşamba'yı seçelim)
        fireEvent.press(getByText('Pzt'));
        fireEvent.press(getByText('Çar'));

        // 4. Kaydet Butonuna Bas
        // Buton başta disabled olabilir, form dolunca aktifleşmeli.
        const saveButton = getByText('Kaydet');
        fireEvent.press(saveButton);

        // 5. Kontrol: addDoc çağrıldı mı?
        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledWith(
                expect.anything(), // collection referansı
                expect.objectContaining({
                    title: 'Kitap Okuma',
                    description: 'Günde 20 sayfa',
                    userId: 'test-user-123',
                    category: 'Spor',
                    selectedDays: expect.arrayContaining([0, 2]) // 0=Pzt, 2=Çar
                })
            );
        });

        // Modal kapanmalı
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('Zorunlu alanlar boşsa Kaydet butonu çalışmamalı', () => {
        const { getByText, getByPlaceholderText } = render(
            <AddHabitModal
                visible={true}
                onClose={mockOnClose}
            />
        );

        // Sadece isim girelim ama gün ve kategori seçmeyelim
        fireEvent.changeText(getByPlaceholderText('Alışkanlık Adı'), 'Eksik Veri');

        const saveButton = getByText('Kaydet');
        fireEvent.press(saveButton);

        // addDoc ÇAĞRILMAMALI
        expect(addDoc).not.toHaveBeenCalled();
    });

    test('Düzenleme Modu (Edit Mode) Testi', async () => {
        // Düzenlenecek eski veri
        const initialData = {
            id: 'existing-habit-id',
            title: 'Eski Başlık',
            description: 'Eski açıklama',
            category: 'Sanat',
            selectedDays: [1], // Salı
            repeatType: 'Daily',
            color: '#FF0000'
        };

        (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

        const { getByPlaceholderText, getByText } = render(
            <AddHabitModal
                visible={true}
                onClose={mockOnClose}
                initialData={initialData} // Düzenleme verisini veriyoruz
            />
        );

        // 1. Verilerin otomatik dolu geldiğini kontrol et
        const nameInput = getByPlaceholderText('Alışkanlık Adı');
        expect(nameInput.props.value).toBe('Eski Başlık');

        // 2. Başlığı Değiştir
        fireEvent.changeText(nameInput, 'Yeni Başlık');

        // 3. Kaydet
        fireEvent.press(getByText('Kaydet'));

        // 4. Kontrol: updateDoc çağrıldı mı?
        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(), // doc referansı
                expect.objectContaining({
                    title: 'Yeni Başlık' // Değişen veri
                })
            );
        });
    });
});