import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

// Mock data for now
const USER = {
    name: 'John Doe',
    level: 3,
    title: 'Usta',
    xp: 30,
    maxXp: 100,
    avatar: 'https://i.pravatar.cc/150?img=11', // Placeholder
};

export const UserProfile = () => {
    const progress = (USER.xp / USER.maxXp) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Image source={{ uri: USER.avatar }} style={styles.avatar} />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{USER.name}</Text>
                    <Text style={styles.levelInfo}>Level {USER.level}: {USER.title}</Text>
                    <Text style={styles.xpText}>Puan: {USER.xp}</Text>
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
