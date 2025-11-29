import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig';
import { AuthLayout } from '../components/AuthLayout';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { COLORS } from '../constants/colors';

export const RegisterScreen = ({ navigation }: any) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !email || !password) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: fullName,
            });

            Alert.alert('Başarılı', 'Hesabınız oluşturuldu. Lütfen giriş yapınız.', [
                { text: 'Tamam', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error: any) {
            let errorMessage = 'Kayıt işlemi sırasında bir hata oluştu.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Bu e-posta adresi zaten kullanımda.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalı.';
            }
            Alert.alert('Kayıt Hatası', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Kayıt Ol"
            showBack
            onBack={() => navigation.goBack()}
            backgroundImage={require('../../assets/images/loginbackground.png')}
            logoSource={require('../../assets/images/fly.png')}
        >
            <CustomInput
                placeholder="Ad Soyad"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="none"
            />
            <CustomInput
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <CustomInput
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
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

            <CustomButton
                title={isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
                onPress={handleRegister}
                variant="secondary"
                disabled={isLoading}
            />
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
