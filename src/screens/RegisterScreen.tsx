import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen = ({ navigation }: any) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleRegister = () => {
        // TODO: Implement Firebase Register
        console.log('Register pressed', { fullName, email, password });
    };

    return (
        <AuthLayout title="Kayıt Ol" showBack onBack={() => navigation.goBack()}>
            <CustomInput
                placeholder="Ad Soyad"
                value={fullName}
                onChangeText={setFullName}
            />
            <CustomInput
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
            />
            <CustomInput
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <View style={styles.optionsRow}>
                <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                >
                    <Ionicons
                        name={rememberMe ? "checkbox" : "square-outline"}
                        size={20}
                        color={COLORS.white}
                    />
                    <Text style={styles.rememberMeText}>Beni Hatırla</Text>
                </TouchableOpacity>
            </View>

            <CustomButton title="Kayıt Ol" onPress={handleRegister} variant="secondary" />
        </AuthLayout>
    );
};

const styles = StyleSheet.create({
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberMeText: {
        color: COLORS.white,
        marginLeft: 5,
        fontSize: 12,
    },
});
