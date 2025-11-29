import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Firebase modülleri
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // GÜNCELLENDİ: firebaseConfig.ts dosyası kök dizinde varsayıldı.

// Komponentler ve Sabitler (Bu dosyaların uygulamanızda mevcut olduğunu varsayıyoruz)
import { Ionicons } from '@expo/vector-icons';
import { AuthLayout } from '../components/AuthLayout';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { COLORS } from '../constants/colors';

export const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Yüklenme durumu için

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi giriniz.');
            return;
        }

        setIsLoading(true);

        try {
            // Firebase ile giriş yapma işlemi
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Giriş başarılı
            const user = userCredential.user;
            Alert.alert('Giriş Başarılı', `Hoş geldiniz, ${user.email}`);

            // Başarılı girişten sonra kullanıcıyı ana ekrana yönlendir (Örn: Home)
            // navigation.navigate('Home'); 

        } catch (error: any) {
            let errorMessage = 'Giriş işlemi sırasında bir hata oluştu.';

            // Firebase hata kodlarına göre daha spesifik mesajlar gösterebiliriz
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi.';
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Geçersiz e-posta veya şifre.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';
            }

            Alert.alert('Giriş Hatası', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Giriş Yap">
            <CustomInput
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotPasswordText}>Şifreni mi unuttun?</Text>
                </TouchableOpacity>
            </View>

            <CustomButton title={isLoading ? "Yükleniyor..." : "Giriş Yap"} onPress={handleLogin} disabled={isLoading} />
            <CustomButton
                title="Kayıt Ol"
                onPress={() => navigation.navigate('Register')}
                variant="secondary"
            />
        </AuthLayout>
    );
};

const styles = StyleSheet.create({
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    forgotPasswordText: {
        color: COLORS.white,
        fontSize: 12,
    },
});