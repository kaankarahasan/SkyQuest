import { Ionicons } from '@expo/vector-icons';
import { updatePassword, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setPhotoUrl(data.photoUrl);
                    if (data.displayName) setName(data.displayName);
                    // If Firestore has email, we could sync, but Auth is truth for email usually.

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

    const handleSave = async () => {
        if (!user) return;

        Alert.alert(
            "Emin misiniz?",
            "Profil bilgilerinizi güncellemek istediğinize emin misiniz?",
            [
                {
                    text: "Vazgeç",
                    style: "cancel"
                },
                {
                    text: "Evet",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            // Ensure user session is fresh
                            await user.reload();

                            const updates: any = {};
                            let emailChanged = false;

                            // 1. Update Display Name if changed
                            if (name !== user.displayName) {
                                await updateProfile(user, { displayName: name });
                                updates.displayName = name;
                            }

                            // 2. Update Email if changed
                            // 2. Update Email if changed
                            let emailVerificationSent = false;
                            if (email !== user.email) {
                                await verifyBeforeUpdateEmail(user, email);
                                emailVerificationSent = true;
                                // We do NOT update firestore email yet, as the auth email hasn't changed.
                                // updates.email = email; 
                            }

                            // 3. Update Password if provided
                            if (password) {
                                await updatePassword(user, password);
                            }

                            // 4. Update Firestore
                            if (Object.keys(updates).length > 0) {
                                const userRef = doc(db, 'users', user.uid);
                                await setDoc(userRef, updates, { merge: true });
                            }

                            if (emailVerificationSent) {
                                Alert.alert("Başarılı", "Profil güncellendi. Yeni e-posta adresinize doğrulama bağlantısı gönderildi. Lütfen onaylayın.");
                            } else {
                                Alert.alert("Başarılı", "Profiliniz güncellendi.");
                            }
                            setPassword(''); // Clear password field
                        } catch (error: any) {
                            console.error("Profile update error:", error);
                            let errorMessage = "Profil güncellenirken bir hata oluştu.";
                            if (error.code === 'auth/requires-recent-login') {
                                errorMessage = "Güvenlik nedeniyle, bu işlem için yakın zamanda giriş yapmış olmanız gerekmektedir. Lütfen çıkış yapıp tekrar giriş deneyin.";
                            } else if (error.code === 'auth/invalid-email') {
                                errorMessage = "Geçersiz e-posta adresi.";
                            } else if (error.code === 'auth/weak-password') {
                                errorMessage = "Şifre çok zayıf.";
                            } else if (error.code === 'auth/network-request-failed') {
                                errorMessage = "İnternet bağlantınızı kontrol edin ve tekrar deneyin.";
                            }
                            Alert.alert("Hata", errorMessage);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
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
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>E-Posta</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="E-Posta"
                        placeholderTextColor={COLORS.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Şifre</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Şifre"
                        placeholderTextColor={COLORS.textSecondary}
                        secureTextEntry
                        autoCapitalize="none"
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
                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    <Text style={styles.saveButtonText}>{isLoading ? "Kaydediliyor..." : "Kaydet"}</Text>
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
    disabledButton: {
        backgroundColor: '#3d4d22', // Darker Olive
        opacity: 0.7,
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
