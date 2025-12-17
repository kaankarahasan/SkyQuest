import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomInput } from '../../components/CustomInput';

describe('CustomInput Bileşen Testleri', () => {

    test('Label ve Placeholder doğru şekilde render edilmeli', () => {
        const { getByText, getByPlaceholderText } = render(
            <CustomInput
                label="E-posta Adresi"
                placeholder="ornek@mail.com"
                value=""
                onChangeText={() => { }}
            />
        );

        // Label ekranda var mı?
        expect(getByText('E-posta Adresi')).toBeTruthy();
        // Placeholder ekranda var mı?
        expect(getByPlaceholderText('ornek@mail.com')).toBeTruthy();
    });

    test('Metin girişi onChangeText fonksiyonunu tetiklemeli', () => {
        const mockOnChange = jest.fn();
        const { getByPlaceholderText } = render(
            <CustomInput
                placeholder="Adınız"
                value=""
                onChangeText={mockOnChange}
            />
        );

        const input = getByPlaceholderText('Adınız');
        // Kullanıcı "Ali" yazıyor gibi simüle et
        fireEvent.changeText(input, 'Ali');

        // Fonksiyon 'Ali' değeriyle çağrıldı mı?
        expect(mockOnChange).toHaveBeenCalledWith('Ali');
    });

    test('Şifre modu (secureTextEntry) ve Göz ikonu testi', () => {
        const { getByPlaceholderText, queryByTestId } = render(
            <CustomInput
                placeholder="Şifre"
                value="123456"
                onChangeText={() => { }}
                secureTextEntry={true} // Şifre modu açık
            />
        );

        const input = getByPlaceholderText('Şifre');

        // Başlangıçta secureTextEntry true olmalı (şifre gizli)
        expect(input.props.secureTextEntry).toBe(true);
    });
});