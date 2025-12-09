import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
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
import { FONTS } from '../constants/fonts';

export const LoginScreen = ({ navigation, route }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Yüklenme durumu için

    useEffect(() => {
        const loadCredentials = async () => {
            // Check for params from Register screen first
            if (route.params?.email && route.params?.password) {
                setEmail(route.params.email);
                setPassword(route.params.password);
                setRememberMe(true); // Assuming they wanted to be remembered if they came from Register with it checked
                return;
            }

            try {
                const savedEmail = await AsyncStorage.getItem('email');
                const savedPassword = await AsyncStorage.getItem('password');
                if (savedEmail && savedPassword) {
                    setEmail(savedEmail);
                    setPassword(savedPassword);
                    setRememberMe(true);
                }
            } catch (error) {
                console.error('Error loading credentials:', error);
            }
        };
        loadCredentials();
    }, [route.params]);

    const handleLogin = async () => {
        if (!email) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz.');
            return;
        }
        if (!password) {
            Alert.alert('Hata', 'Lütfen şifrenizi giriniz.');
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

            // Remember Me Logic
            if (rememberMe) {
                await AsyncStorage.setItem('email', email);
                await AsyncStorage.setItem('password', password);
            } else {
                await AsyncStorage.removeItem('email');
                await AsyncStorage.removeItem('password');
            }

            // Giriş başarılı
            const user = userCredential.user;
            // Alert.alert('Giriş Başarılı', `Hoş geldiniz, ${user.email}`); // Removed alert for smoother UX

            // Başarılı girişten sonra kullanıcıyı ana ekrana yönlendir
            navigation.navigate('MainDrawer');

        } catch (error: any) {
            let errorMessage = 'Giriş işlemi sırasında bir hata oluştu.';

            // Firebase hata kodlarına göre daha spesifik mesajlar gösterebiliriz
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi formatı.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Girdiğiniz şifre yanlıştır.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'E-posta veya şifre hatalı.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';
            }

            Alert.alert('Giriş Hatası', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Giriş Yap"
            logoSource={require('../../assets/images/fly.png')}
            backgroundImage={require('../../assets/images/loginbackground.png')}
        >
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
        color: COLORS.textSecondary,
        textAlign: 'right',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.textSecondary,
        opacity: 0.5,
    },
    separatorText: {
        color: COLORS.textSecondary,
        marginHorizontal: 10,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    registerLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
});