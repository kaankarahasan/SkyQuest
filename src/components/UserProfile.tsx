import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { BADGES } from '../constants/gamification';
import { getAvatarSource } from '../utils/avatarUtils';
import { calculateLevel } from '../utils/gamificationUtils';

const DEFAULT_USER = {
    level: 1,
    title: 'Acemi', // Removed (Novice) - ensuring default is clean
    points: 0,
    earnedBadgeIds: [] as string[],
    photoUrl: null,
};

export const UserProfile = () => {
    const user = auth.currentUser;
    const [userData, setUserData] = useState<any>(DEFAULT_USER);
    const [lastBadge, setLastBadge] = useState<any>(null);

    useEffect(() => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setUserData({ ...DEFAULT_USER, ...data });

                    // Find the last earned badge
                    if (data.earnedBadgeIds && data.earnedBadgeIds.length > 0) {
                        const lastBadgeId = data.earnedBadgeIds[data.earnedBadgeIds.length - 1];
                        const badge = BADGES.find(b => b.id === lastBadgeId);
                        setLastBadge(badge);
                    } else {
                        setLastBadge(null);
                    }
                }
            }, (error) => {
                console.error("UserProfile listener error:", error);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const displayNameFull = user?.displayName || userData.displayName || 'Kullanıcı';
    const firstName = displayNameFull.split(' ')[0];

    // Calculate level and progress
    // Level up every 10 points. 
    // Points = 15 -> Level 2, 5 points in. Progress 50%.
    // Points = 0 -> Level 1, 0 points in. Progress 0%.
    // Points = 10 -> Level 2, 0 points in. Progress 0%.
    const currentPointsInLevel = userData.points % 10;
    const progress = (currentPointsInLevel / 10) * 100;

    const { level, title } = calculateLevel(userData.points || 0);

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Image source={getAvatarSource(userData.photoUrl)} style={styles.avatar} />
                {lastBadge && (
                    <View style={styles.badgeOverlay}>
                        <Image source={lastBadge.icon} style={styles.badgeIcon} />
                    </View>
                )}
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.name, { flex: 1, textAlign: 'left' }]}>{firstName}</Text>
                    <Text style={[styles.levelInfo, { flex: 2, textAlign: 'center', color: COLORS.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>Level {level}: {title}</Text>
                    <Text style={[styles.xpText, { flex: 1, textAlign: 'right' }]}>Puan: {userData.points || 0}</Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBackground,
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        marginRight: 12,
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: COLORS.textSecondary,
    },
    badgeOverlay: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#000',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gold,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    infoContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    name: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    levelInfo: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    xpText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    separator: {
        color: COLORS.textSecondary,
        marginHorizontal: 8,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#444',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
});
