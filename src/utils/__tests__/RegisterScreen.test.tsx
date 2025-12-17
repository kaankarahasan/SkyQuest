import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterScreen } from '../../screens/RegisterScreen';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// --- MOCK KURULUMU (Firebase'i Taklit Etme) ---
// Gerçekten internete gidip kullanıcı oluşturmasını engelliyoruz.
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})), // getAuth çağrıldığında boş bir obje dön
    createUserWithEmailAndPassword: jest.fn(), // Bu fonksiyonu biz izleyeceğiz (spy)
    updateProfile: jest.fn(), // Bu fonksiyonu da izliyoruz
}));

jest.mock('../../../firebaseConfig', () => ({
    auth: {},
}));

// Navigasyon (Sayfa geçişi) taklidi
const mockNavigation = {
    replace: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
};

describe('Hesap Oluştur (RegisterScreen) Testleri', () => {

    // Her testten önce mock'ları temizle (sayacı sıfırla)
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Form elemanları (E-posta, Şifre, Buton) ekranda görünmeli', () => {
        const { getByPlaceholderText, getByTestId } = render(
            <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
        );

        // Placeholder metinlerinin senin kodundakiyle AYNI olması lazım!
        expect(getByPlaceholderText('E-posta')).toBeTruthy();
        expect(getByPlaceholderText('Şifre')).toBeTruthy();
        // Buton üzerindeki yazı (Örn: "Kayıt Ol" veya "Hesap Oluştur")
        expect(getByTestId('register-button')).toBeTruthy();
    });

    test('Geçerli bilgilerle kayıt olunca Firebase fonksiyonu çağrılmalı', async () => {
        // 1. Arrange: Fonksiyonun başarılı döneceğini ayarla
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
            user: { uid: 'test-user-123', email: 'yeni@kullanici.com' }
        });

        const { getByPlaceholderText, getByTestId } = render(
            <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
        );

        // 2. Act: Formu doldur ve butona bas
        fireEvent.changeText(getByPlaceholderText('E-posta'), 'yeni@kullanici.com');
        fireEvent.changeText(getByPlaceholderText('Şifre'), '123456');

        // Varsa "Ad Soyad" alanını da doldurabilirsin:
        fireEvent.changeText(getByPlaceholderText('Ad Soyad'), 'Test Kullanıcısı');

        fireEvent.press(getByTestId('register-button'));

        // 3. Assert: Firebase fonksiyonu doğru parametrelerle çağrıldı mı?
        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(), // auth nesnesi (ne olduğu önemli değil)
                'yeni@kullanici.com',
                '123456'
            );
        });
    });

    test('Boş alan bırakılırsa hata vermeli ve kayıt fonksiyonu ÇAĞRILMAMALI', async () => {
        const { getByTestId } = render(
            <RegisterScreen navigation={mockNavigation as any} route={{} as any} />
        );

        // Hiçbir şey yazmadan butona basıyoruz
        // Hiçbir şey yazmadan butona basıyoruz
        fireEvent.press(getByTestId('register-button'));

        // Fonksiyonun hiç çağrılmadığını kontrol ediyoruz
        await waitFor(() => {
            expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
        });
    });
});