import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { COLORS } from '../constants/colors';

export const ForgotPasswordScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleSend = () => {
        // TODO: Implement Firebase Password Reset
        console.log('Send pressed', { email });
        setModalVisible(true);
    };

    return (
        <AuthLayout title="Şifreni mi Unuttun?" showBack onBack={() => navigation.goBack()}>
            <CustomInput
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <CustomButton title="Gönder" onPress={handleSend} variant="secondary" />

            {/* Success Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Ionicons name="mail-outline" size={50} color={COLORS.white} style={styles.modalIcon} />
                        <Text style={styles.modalTitle}>E-Postanı Kontrol Et</Text>
                        <Text style={styles.modalText}>
                            Lütfen e-postanı kontrol et ve şifreni güvenli bir şekilde sıfırlamak için bağlantıyı takip et.
                        </Text>
                        <CustomButton
                            title="E-postayı Kontrol Et"
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('ResetPassword'); // For demo flow, normally this happens via email link
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
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        color: COLORS.white,
    },
});
