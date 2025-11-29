import React from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, showBack, onBack }) => {
    return (
        <View style={styles.container}>
            {/* Placeholder for Background Image - In real app use ImageBackground with actual asset */}
            <View style={styles.backgroundImage} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.header}>
                            <Text style={styles.appTitle}>SKYQUEST</Text>
                            {/* Dragon Icon Placeholder */}
                            <Ionicons name="logo-octocat" size={80} color="black" style={styles.logo} />
                        </View>

                        <View style={styles.card}>
                            {showBack && (
                                <Ionicons
                                    name="chevron-back"
                                    size={24}
                                    color={COLORS.white}
                                    onPress={onBack}
                                    style={styles.backIcon}
                                />
                            )}
                            {title && <Text style={styles.screenTitle}>{title}</Text>}
                            {children}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#2C3E50', // Fallback color
        opacity: 0.5,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 10,
        letterSpacing: 2,
    },
    logo: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 20,
        width: '100%',
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 20,
        textAlign: 'center',
    },
    backIcon: {
        marginBottom: 10,
    }
});
