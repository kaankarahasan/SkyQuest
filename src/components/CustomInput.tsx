import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

// GÜNCELLENMİŞ CustomInputProps arayüzü
// TextInputProps'u genişleterek keyboardType, autoCapitalize vb. özellikleri içerir.
export interface CustomInputProps extends TextInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    label?: string;
    // TextInputProps sayesinde artık aşağıdaki propları ayrı ayrı tanımlamaya gerek kalmaz:
    // keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
    // autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    // ...ve diğer standart TextInput propları (style, onBlur vb.)
}

export const CustomInput: React.FC<CustomInputProps> = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    label,
    // Geri kalan tüm standart TextInput proplarını buraya yayıyoruz
    ...rest
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!isPasswordVisible && secureTextEntry}
                    // Geri kalan tüm propları (keyboardType, autoCapitalize vb.) TextInput'a aktarıyoruz
                    {...rest}
                />
                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={24}
                            color={COLORS.text}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        width: '100%',
    },
    label: {
        color: COLORS.text,
        marginBottom: 5,
        fontSize: 14,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        paddingVertical: 8,
        fontFamily: FONTS.regular,
    },
    icon: {
        marginLeft: 10,
    },
});