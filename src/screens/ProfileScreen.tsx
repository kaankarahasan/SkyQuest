import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

export const ProfileScreen = ({ navigation }: any) => {
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('johndoe@example.com');
    const [password, setPassword] = useState('password123');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PROFİL</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/300?img=11' }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.changePhotoButton}>
                        <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Ad Soyad</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ad Soyad"
                        placeholderTextColor={COLORS.textSecondary}
                    />

                    <Text style={styles.label}>E-Posta</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="E-Posta"
                        placeholderTextColor={COLORS.textSecondary}
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Şifre</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Şifre"
                        placeholderTextColor={COLORS.textSecondary}
                        secureTextEntry
                    />
                </View>

                <Text style={styles.sectionTitle}>ROZETLER</Text>
                <View style={styles.badgeCard}>
                    <View style={styles.badgeIconContainer}>
                        {/* Placeholder for badge image */}
                        <Ionicons name="shield-checkmark" size={48} color={COLORS.text} />
                    </View>
                    <View style={styles.badgeInfo}>
                        <Text style={styles.badgeTitle}>Seri Katılım</Text>
                        <Text style={styles.badgeDescription}>
                            Göreve ardı ardına 7 gün katılarak cesaretini gösterdin. (Seviye 1, Seviye 3, Seviye 5)
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 20, // Rounded square-ish
        marginBottom: 16,
    },
    changePhotoButton: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    changePhotoText: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    formSection: {
        marginBottom: 30,
    },
    label: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 12,
        color: COLORS.text,
        marginBottom: 16,
        fontSize: 16,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    badgeCard: {
        backgroundColor: '#333',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    badgeIconContainer: {
        marginRight: 16,
    },
    badgeInfo: {
        flex: 1,
    },
    badgeTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    badgeDescription: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    saveButton: {
        backgroundColor: '#556B2F', // Olive Green
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
