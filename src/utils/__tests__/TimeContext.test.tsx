import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Text, Button } from 'react-native';
import { TimeProvider, useTime } from '../../context/TimeContext';

// Test etmek için geçici bir "Tüketici" bileşen (Consumer Component)
const TestComponent = () => {
    const { currentDate, simulateTimeTravel, resetTime } = useTime();

    return (
        <>
            <Text testID="date-text">{currentDate.toISOString()}</Text>
            <Button
                title="1 Gün İleri Git"
                onPress={() => simulateTimeTravel(86400000)} // 24 saat = 86400000 ms
            />
            <Button
                title="Sıfırla"
                onPress={resetTime}
            />
        </>
    );
};

describe('TimeContext Testleri', () => {

    test('TimeProvider içinde state güncellemeleri doğru çalışmalı', () => {
        // Gerçek zamanı donduralım ki test tutarlı olsun (Örn: 1 Ocak 2024)
        const mockDate = new Date(2024, 0, 1).getTime();
        jest.spyOn(Date, 'now').mockImplementation(() => mockDate);

        const { getByTestId, getByText } = render(
            <TimeProvider>
                <TestComponent />
            </TimeProvider>
        );

        // 1. Başlangıç kontrolü: Tarih 1 Ocak mı?
        // toISOString() -> 2023-12-31T21:00:00.000Z (UTC farkı olabilir, önemli olan değişimi görmek)
        const initialDateText = getByTestId('date-text').props.children;

        // 2. Zaman Yolculuğu Yap (Butona bas)
        fireEvent.press(getByText('1 Gün İleri Git'));

        // State güncellemesi sonrası yeni metni al
        const newDateText = getByTestId('date-text').props.children;

        // Tarihler eşit OLMAMALI (zaman değişti)
        expect(newDateText).not.toBe(initialDateText);

        // 3. Sıfırla
        fireEvent.press(getByText('Sıfırla'));

        // Tekrar başlangıç değerine dönmeli
        const resetDateText = getByTestId('date-text').props.children;
        expect(resetDateText).toBe(initialDateText);

        // Mock'u temizle (Diğer testleri etkilemesin)
        jest.restoreAllMocks();
    });
});