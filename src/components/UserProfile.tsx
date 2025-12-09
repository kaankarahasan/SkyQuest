import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';
import { getAvatarSource } from '../utils/avatarUtils';

// Default user data for new users
const DEFAULT_USER = {
    level: 1,
    title: 'Çaylak',
    xp: 0,
    maxXp: 100,
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', // Generic placeholder
};

export const UserProfile = () => {
    const user = auth.currentUser;
    const [userData, setUserData] = useState<any>(DEFAULT_USER);

    useEffect(() => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    setUserData({ ...DEFAULT_USER, ...doc.data() });
                }
            });
            return () => unsubscribe();
        }
    }, [user]);

    const displayName = user?.displayName || userData.displayName || 'Kullanıcı';
    const progress = (userData.xp / userData.maxXp) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Image source={getAvatarSource(userData.photoUrl)} style={styles.avatar} />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.levelInfo}>Level {userData.level}: {userData.title}</Text>
                    <Text style={styles.xpText}>Puan: {userData.xp}</Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress || 0}%` }]} />
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
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.textSecondary,
    },
    infoContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    levelInfo: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    xpText: {
        color: COLORS.textSecondary,
        fontSize: 12,
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
