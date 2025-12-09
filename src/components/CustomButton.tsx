import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

export interface CustomButtonProps {
    title: string;
    onPress: () => void | Promise<void>; // onPress fonksiyonunun Promise döndürebilmesini ekledik
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    disabled?: boolean; // Hata giderme: disabled prop'unu ekledik
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false, // Varsayılan değer false
}) => {
    const backgroundColor = variant === 'primary' ? COLORS.primary : COLORS.secondary;

    // Yükleniyor VEYA harici olarak devre dışı bırakılmışsa düğme de devre dışı kalır
    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            // Düğme stiline şeffaflık ekleyerek disabled durumunu görselleştiriyoruz
            style={[styles.button, { backgroundColor }, isDisabled && styles.disabledButton]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {loading ? (
                <ActivityIndicator color={COLORS.white} />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        opacity: 1, // Normal durumda tam opaklık
    },
    disabledButton: {
        opacity: 0.6, // Devre dışı bırakıldığında şeffaflığı azalt
    },
    text: {
        color: COLORS.buttonText,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
});