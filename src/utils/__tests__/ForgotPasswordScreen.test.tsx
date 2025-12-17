import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../../screens/ForgotPasswordScreen';
import { sendPasswordResetEmail } from 'firebase/auth';

// --- MOCK KURULUMU ---
// Firebase Auth modülünü taklit et
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    sendPasswordResetEmail: jest.fn(),
}));

// Firebase Config'i taklit et
// Firebase Config'i taklit et
jest.mock('../../../firebaseConfig', () => ({
    auth: {},
}));

// React Native Alert.alert fonksiyonunu izle (spy)
jest.spyOn(Alert, 'alert');

const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
};

describe('Şifremi Unuttum (ForgotPasswordScreen) Testleri', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('E-posta alanı ve Gönder butonu doğru render edilmeli', () => {
        const { getByPlaceholderText, getByText } = render(
            <ForgotPasswordScreen navigation={mockNavigation} />
        );

        expect(getByPlaceholderText('E-posta')).toBeTruthy();
        expect(getByText('Gönder')).toBeTruthy();
    });

    test('Boş e-posta ile gönderilirse Alert hatası vermeli', () => {
        const { getByText } = render(
            <ForgotPasswordScreen navigation={mockNavigation} />
        );

        // Hiçbir şey yazmadan butona bas
        fireEvent.press(getByText('Gönder'));

        // Alert.alert çağrıldı mı?
        expect(Alert.alert).toHaveBeenCalledWith(
            'Hata',
            'Lütfen e-posta adresinizi giriniz.'
        );

        // Firebase fonksiyonu ÇAĞRILMAMALI
        expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('Geçerli e-posta ile başarılı gönderim senaryosu', async () => {
        // 1. Arrange: Başarılı yanıt döneceğini ayarla
        (sendPasswordResetEmail as jest.Mock).mockResolvedValueOnce(undefined);

        const { getByPlaceholderText, getByText } = render(
            <ForgotPasswordScreen navigation={mockNavigation} />
        );

        // 2. Act: E-posta gir ve gönder
        fireEvent.changeText(getByPlaceholderText('E-posta'), 'unutan@kullanici.com');
        fireEvent.press(getByText('Gönder'));

        // 3. Assert: Firebase fonksiyonu çağrıldı mı?
        await waitFor(() => {
            expect(sendPasswordResetEmail).toHaveBeenCalledWith(
                expect.anything(), // auth objesi
                'unutan@kullanici.com'
            );
        });

        // 4. Modal kontrolü: Başarılı modal açılmalı
        // Modal içindeki metni bulmayı bekle
        const modalTitle = await waitFor(() => getByText('E-Postanı Kontrol Et'));
        expect(modalTitle).toBeTruthy();

        // 5. Modal butonuna basınca Login'e gitmeli
        const loginButton = getByText('Giriş Yap');
        fireEvent.press(loginButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });

    test('Firebase hatası durumunda (Örn: Kullanıcı bulunamadı) Alert vermeli', async () => {
        // Hata fırlatacağını ayarla
        const error = { code: 'auth/user-not-found' };
        (sendPasswordResetEmail as jest.Mock).mockRejectedValueOnce(error);

        const { getByPlaceholderText, getByText } = render(
            <ForgotPasswordScreen navigation={mockNavigation} />
        );

        fireEvent.changeText(getByPlaceholderText('E-posta'), 'yok@kullanici.com');
        fireEvent.press(getByText('Gönder'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Hata',
                'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.'
            );
        });
    });
});