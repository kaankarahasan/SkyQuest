import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';

export const ProfileScreen = ({ navigation }: any) => {
    const user = auth.currentUser;
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState(''); // Password cannot be retrieved, only reset
    const [habits, setHabits] = useState<any[]>([]);

    React.useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const habitsData: any[] = [];
            querySnapshot.forEach((doc) => {
                habitsData.push({ id: doc.id, ...doc.data() });
            });
            setHabits(habitsData);
        });

        return () => unsubscribe();
    }, [user]);

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
                        source={{ uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
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
                        <Ionicons name="ribbon-outline" size={48} color={COLORS.textSecondary} />
                    </View>
                    <View style={styles.badgeInfo}>
                        <Text style={[styles.badgeTitle, { color: COLORS.textSecondary }]}>Henüz hiç rozet kazanmadın</Text>
                        <Text style={styles.badgeDescription}>
                            Alışkanlıklarını tamamlayarak ve seviye atlayarak rozetler kazanabilirsin.
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>ALIŞKANLIKLARIM ({habits.length})</Text>
                {habits.length > 0 ? (
                    habits.map((habit) => (
                        <View key={habit.id} style={styles.habitItem}>
                            <View style={styles.habitIconContainer}>
                                <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
                            </View>
                            <View style={styles.habitInfo}>
                                <Text style={styles.habitTitle}>{habit.title}</Text>
                                <Text style={styles.habitStreak}>🔥 {habit.streak} Gün</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noHabitsText}>Henüz hiç alışkanlık eklemedin.</Text>
                )}

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
        marginTop: 10,
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
        marginTop: 20,
    },
    saveButtonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    habitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    habitIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    habitInfo: {
        flex: 1,
    },
    habitTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    habitStreak: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    noHabitsText: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginBottom: 20,
    },
});
