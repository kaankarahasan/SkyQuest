import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { updateProfile, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';

// --- MOCKLAR (Taklitler) ---

// 1. Kullanıcı ve Auth Mock'u
const mockUser = {
    uid: 'user-123',
    displayName: 'Mevcut İsim',
    email: 'mevcut@mail.com',
    photoUrl: null,
    reload: jest.fn().mockResolvedValue(undefined) // Profil güncellemeden önce reload yapılır
};

jest.mock('../../../firebaseConfig', () => ({
    auth: {
        currentUser: {
            uid: 'user-123',
            displayName: 'Mevcut İsim',
            email: 'mevcut@mail.com',
            photoUrl: null,
            reload: jest.fn().mockResolvedValue(undefined)
        }
    },
    db: {}
}));

// 2. Firebase Auth Fonksiyonları
jest.mock('firebase/auth', () => ({
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    verifyBeforeUpdateEmail: jest.fn(),
    getAuth: jest.fn(() => ({ currentUser: mockUser }))
}));

// 3. Firestore (Profil verisini getirmek ve kaydetmek için)
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: jest.fn(() => ({})),
    setDoc: jest.fn(), // Güncelleme işlemi setDoc(..., {merge: true}) ile yapılıyor
    onSnapshot: jest.fn((docRef, callback) => {
        // Sayfa açılır açılmaz veritabanından veri gelmiş gibi yapıyoruz
        callback({
            exists: () => true,
            data: () => ({
                displayName: 'Mevcut İsim',
                photoUrl: null,
                earnedBadgeIds: [] // Rozetleri boş geçelim
            })
        });
        return () => { }; // Unsubscribe fonksiyonu
    })
}));

// 4. Alt Bileşenleri Mockla (Testi izole etmek için)
// 4. Alt Bileşenleri Mockla (Testi izole etmek için)
// 4. Alt Bileşenleri Mockla (Testi izole etmek için)
jest.mock('../../components/ProfilePhotoSelectionModal', () => ({
    ProfilePhotoSelectionModal: () => null // Modalı render etmeyip es geçiyoruz
}));

// Alert'i izle
jest.spyOn(Alert, 'alert');

describe('Profil Ekranı (ProfileScreen) Testleri', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Mevcut kullanıcı bilgileri ekrana gelmeli', async () => {
        const { getByDisplayValue } = render(<ProfileScreen navigation={{ goBack: jest.fn() }} />);

        // Inputlarda mevcut değerler yazmalı
        await waitFor(() => {
            expect(getByDisplayValue('Mevcut İsim')).toBeTruthy();
            expect(getByDisplayValue('mevcut@mail.com')).toBeTruthy();
        });
    });

    test('İsim değişikliği yapıp kaydedince updateProfile çağrılmalı', async () => {
        (updateProfile as jest.Mock).mockResolvedValue(undefined);
        (setDoc as jest.Mock).mockResolvedValue(undefined);

        const { getByDisplayValue, getByText } = render(<ProfileScreen navigation={{ goBack: jest.fn() }} />);

        // 1. İsmi değiştir
        const nameInput = getByDisplayValue('Mevcut İsim');
        fireEvent.changeText(nameInput, 'Yeni İsim');

        // 2. Kaydet butonuna bas
        fireEvent.press(getByText('Kaydet'));

        // 3. Alert çıkacak (Emin misiniz?), "Evet"e basalım
        // Alert.alert'in 3. argümanı butonlar dizisidir. 2. eleman (index 1) genelde "Evet"tir.
        // Mocklanan Alert.alert çağrısını alıp manuel tetikleyeceğiz.
        await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

        // Alert'in çağrıldığı argümanları alalım
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const buttons = alertCall[2]; // [ {text: 'Vazgeç'}, {text: 'Evet', onPress: ...} ]
        const yesButton = buttons[1];

        // "Evet" butonunun onPress fonksiyonunu çalıştır
        await yesButton.onPress();

        // 4. Kontrol: updateProfile çağrıldı mı?
        expect(updateProfile).toHaveBeenCalledWith(
            expect.anything(),
            { displayName: 'Yeni İsim' }
        );

        // Firestore'a da yazıldı mı?
        expect(setDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ displayName: 'Yeni İsim' }),
            { merge: true }
        );
    });

    test('Şifre girilirse updatePassword çağrılmalı', async () => {
        const { getByPlaceholderText, getByText } = render(<ProfileScreen navigation={{ goBack: jest.fn() }} />);

        // Şifre alanını bul ve doldur
        fireEvent.changeText(getByPlaceholderText('Şifre'), 'yeniSifre123');

        // Kaydet ve Onayla
        fireEvent.press(getByText('Kaydet'));

        await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
        await buttons[1].onPress(); // Evet'e bas

        // updatePassword çağrıldı mı?
        expect(updatePassword).toHaveBeenCalledWith(
            expect.anything(),
            'yeniSifre123'
        );
    });
});