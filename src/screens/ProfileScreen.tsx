import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import { ProfilePhotoSelectionModal } from '../components/ProfilePhotoSelectionModal';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { BADGES } from '../constants/gamification';
import { getAvatarSource } from '../utils/avatarUtils';

export const ProfileScreen = ({ navigation }: any) => {
    const user = auth.currentUser;
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState(''); // Password cannot be retrieved, only reset
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setPhotoUrl(data.photoUrl);
                    if (data.displayName) setName(data.displayName);

                    const badgeIds = data.earnedBadgeIds || [];
                    const badges = BADGES.filter(b => badgeIds.includes(b.id));
                    setEarnedBadges(badges);
                }
            }, (error) => {
                console.error("Profile listener error:", error);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handlePhotoSelect = (photo: any) => {
        // photo is the ID string from modal, or we can rely on onSnapshot to update the view
        // The modal handles the firestore update.
        // We just close the modal.
        setModalVisible(false);
    };

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
                        source={getAvatarSource(photoUrl)}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.changePhotoButton} onPress={() => setModalVisible(true)}>
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

                {earnedBadges.length > 0 ? (
                    <View style={styles.badgesList}>
                        {earnedBadges.map((badge) => (
                            <View key={badge.id} style={styles.badgeCard}>
                                <View style={styles.iconContainer}>
                                    <Image source={badge.icon} style={styles.badgeIcon} />
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyBadgeCard}>
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
                )}



            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
            </View>

            <ProfilePhotoSelectionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                currentPhoto={photoUrl}
                onSelect={handlePhotoSelect}
            />
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
        fontFamily: FONTS.bold,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 20,
    },
    footer: {
        padding: 20,
        paddingTop: 10,
        backgroundColor: COLORS.background, // Ensure it covers content behind it if needed
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
    formSection: {
        marginBottom: 30,
    },
    changePhotoText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    label: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: FONTS.bold,
    },
    input: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 12,
        color: COLORS.text,
        marginBottom: 16,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 10,
        fontFamily: FONTS.bold,
    },
    badgeTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: FONTS.bold,
    },
    badgeDescription: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: FONTS.regular,
    },
    saveButtonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    badgeCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    emptyBadgeCard: {
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
    iconContainer: {
        marginRight: 16,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeIcon: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    infoContainer: {
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#556B2F', // Olive Green
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    badgesList: {
        marginBottom: 30,
    },
    // Removed old earnedBadgeCard styles
    headerRow: { // Keep headerRow for other potential uses or strict removal if unused
        flexDirection: 'row',
        alignItems: 'center',
    },
});
