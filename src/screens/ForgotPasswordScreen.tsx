import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { auth } from '../../firebaseConfig';
import { AuthLayout } from '../components/AuthLayout';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

export const ForgotPasswordScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!email) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz.');
            return;
        }

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setModalVisible(true);
        } catch (error: any) {
            console.error('Password reset error:', error);
            let errorMessage = 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu.';
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi.';
            } else if (error.code === 'auth/user-not-found') {
                // For security reasons, sometimes it's better not to say "user not found", 
                // but for this app "User not found" might be acceptable or just generic message.
                errorMessage = 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.';
            }
            Alert.alert('Hata', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Şifreni mi unuttun?"
            showBack
            onBack={() => navigation.goBack()}
            backgroundImage={require('../../assets/images/loginbackground.png')}
            logoSource={require('../../assets/images/fly.png')}
        >
            <CustomInput
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <CustomButton
                title={isLoading ? "Gönderiliyor..." : "Gönder"}
                onPress={handleSend}
                variant="secondary"
                disabled={isLoading}
            />

            {/* Success Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    navigation.navigate('Login');
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Ionicons name="mail-outline" size={50} color={COLORS.white} style={styles.modalIcon} />
                        <Text style={styles.modalTitle}>E-Postanı Kontrol Et</Text>
                        <Text style={styles.modalText}>
                            Lütfen e-postanı kontrol et ve şifreni güvenli bir şekilde sıfırlamak için bağlantıyı takip et.
                        </Text>
                        <CustomButton
                            title="Giriş Yap"
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('Login');
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </AuthLayout>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#333',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalIcon: {
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: FONTS.bold,
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        color: COLORS.white,
        fontFamily: FONTS.regular,
        fontSize: 16,
    },
});
