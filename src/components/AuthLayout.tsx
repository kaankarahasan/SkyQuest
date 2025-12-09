import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    logoSource?: any;
    backgroundImage?: any;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, showBack, onBack, logoSource, backgroundImage }) => {
    const logo = logoSource || require('../../assets/images/fly1.png');

    return (
        <View style={styles.container}>
            {backgroundImage ? (
                <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
                    <View style={styles.overlay} />
                    <SafeAreaView style={styles.safeArea}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}
                        >
                            <ScrollView contentContainerStyle={styles.scrollContent}>
                                <View style={styles.header}>
                                    <Text style={styles.appTitle}>SKYQUEST</Text>
                                    <Image source={logo} style={styles.logo} resizeMode="contain" />
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
                </ImageBackground>
            ) : (
                <>
                    <View style={styles.defaultBackground} />
                    <SafeAreaView style={styles.safeArea}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}
                        >
                            <ScrollView contentContainerStyle={styles.scrollContent}>
                                <View style={styles.header}>
                                    <Text style={styles.appTitle}>SKYQUEST</Text>
                                    <Image source={logo} style={styles.logo} resizeMode="contain" />
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
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    defaultBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#2C3E50',
        opacity: 0.5,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', // Slight dark overlay for readability
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
        fontSize: 64,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: FONTS.headingBold,
        letterSpacing: 2,
    },
    logo: {
        width: 120,
        height: 120,
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
        fontFamily: FONTS.bold,
    },
    backIcon: {
        marginBottom: 10,
    }
});
