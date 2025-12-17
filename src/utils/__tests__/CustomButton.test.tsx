import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomButton } from '../../components/CustomButton';

describe('CustomButton Bileşen Testleri', () => {

    // 1. Test: Düğme ekrana doğru başlıkla basılıyor mu?
    test('Düğme verilen başlık (title) ile render edilmeli', () => {
        const { getByText } = render(
            <CustomButton title="Giriş Yap" onPress={() => { }} />
        );

        // "Giriş Yap" yazısını ekranda bulmaya çalışır
        const buttonElement = getByText('Giriş Yap');
        expect(buttonElement).toBeTruthy();
    });

    // 2. Test: Tıklama (onPress) olayı çalışıyor mu?
    test('Düğmeye tıklandığında onPress fonksiyonu çağrılmalı', () => {
        // jest.fn(): Takip edilebilir sahte bir fonksiyon oluşturur.
        const mockOnPress = jest.fn();

        const { getByText } = render(
            <CustomButton title="Tıkla Bana" onPress={mockOnPress} />
        );

        // Düğmeyi bul ve tıkla
        const button = getByText('Tıkla Bana');
        fireEvent.press(button);

        // Fonksiyonun tam olarak 1 kere çağrıldığını kontrol et
        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    // 3. Test: Yükleniyor (Loading) durumu
    test('Loading true olduğunda metin yerine ActivityIndicator görünmeli', () => {
        const { queryByText, getByTestId } = render(
            <CustomButton title="Kaydet" loading={true} onPress={() => { }} />
        );

        // Metin GÖRÜNMEMELİ (null olmalı)
        expect(queryByText('Kaydet')).toBeNull();

        // ActivityIndicator (Dönen çark) görünmeli
        const indicator = getByTestId('loading-indicator');
        expect(indicator).toBeTruthy();
    });

    // 4. Test: Devre Dışı (Disabled) durumu
    test('Disabled olduğunda tıklama işlemi yapılmamalı', () => {
        const mockOnPress = jest.fn();
        const { getByText } = render(
            <CustomButton title="Pasif Düğme" disabled={true} onPress={mockOnPress} />
        );

        const button = getByText('Pasif Düğme');
        fireEvent.press(button);

        // Tıklamamıza rağmen fonksiyon ÇAĞRILMAMALI
        expect(mockOnPress).not.toHaveBeenCalled();
    });
});