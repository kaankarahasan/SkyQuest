import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { BADGES } from '../constants/gamification';

export const BadgesScreen = ({ navigation }: any) => {
    const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);

    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((u) => {
            setUser(u);
            if (!u) {
                setEarnedBadgeIds([]);
            }
        });
        return unsubscribeAuth;
    }, []);

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                setEarnedBadgeIds(doc.data().earnedBadgeIds || []);
            }
        }, (error) => {
            console.error("BadgesScreen listener error:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const renderItem = ({ item }: { item: typeof BADGES[0] }) => {
        const isUnlocked = earnedBadgeIds.includes(item.id);

        return (
            <View style={[styles.card, !isUnlocked && styles.lockedCard]}>
                <View style={styles.iconContainer}>
                    {isUnlocked ? (
                        <Image source={item.icon} style={styles.badgeIcon} />
                    ) : (
                        <View style={styles.lockedIcon}>
                            <Ionicons name="lock-closed" size={32} color="#555" />
                        </View>
                    )}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.title, !isUnlocked && styles.lockedText]}>
                        {isUnlocked ? item.title : '??? (Kilitli)'}
                    </Text>
                    <Text style={[styles.description, !isUnlocked && styles.lockedText]}>
                        {isUnlocked ? item.description : 'Bu rozeti kazanmak için görevleri tamamla.'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ROZETLER</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={BADGES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
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
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    lockedCard: {
        backgroundColor: '#222', // Darker background for locked
        opacity: 0.7,
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
    lockedIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: FONTS.bold,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: FONTS.regular,
    },
    lockedText: {
        color: '#666',
        fontFamily: FONTS.regular,
    },
});
