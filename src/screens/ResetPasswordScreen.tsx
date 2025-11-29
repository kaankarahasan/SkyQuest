import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';

export const ResetPasswordScreen = ({ navigation }: any) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleReset = () => {
        // TODO: Implement Firebase Password Update
        console.log('Reset pressed', { newPassword, confirmPassword });
        navigation.navigate('Login');
    };

    return (
        <AuthLayout title="Şifreni Sıfırla" showBack onBack={() => navigation.goBack()}>
            <CustomInput
                placeholder="Yeni Şifreni Gir"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />
            <CustomInput
                placeholder="Yeni Şifreni Doğrula"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <CustomButton title="Şifreni Sıfırla" onPress={handleReset} />
        </AuthLayout>
    );
};
