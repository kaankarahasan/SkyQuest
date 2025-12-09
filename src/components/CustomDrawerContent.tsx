import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { isAdmin, resetAdminData } from '../utils/adminUtils';
import { TimeSimulationPanel } from './TimeSimulationPanel';

export const CustomDrawerContent = (props: any) => {
    const [simulationVisible, setSimulationVisible] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            props.navigation.reset({
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleAdminReset = () => {
        Alert.alert(
            "Admin Verilerini Sıfırla",
            "Tüm puanlar, seviyeler ve alışkanlık geçmişi silinecek. Emin misiniz?",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sıfırla",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (auth.currentUser) {
                                await resetAdminData(auth.currentUser.uid);
                                Alert.alert("Başarılı", "Tüm veriler sıfırlandı.");
                            }
                        } catch (error) {
                            console.error("Reset error:", error);
                            Alert.alert("Hata", "Sıfırlama işlemi başarısız oldu.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>MENÜ</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.menuItems}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate('Profile')}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="person-outline" size={24} color={COLORS.text} />
                            <Text style={styles.menuItemText}>PROFİL</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate('HabitsList')}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="list-outline" size={24} color={COLORS.text} />
                            <Text style={styles.menuItemText}>ALIŞKANLIKLAR{'\n'} LİSTESİ</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate('Badges')}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="ribbon-outline" size={24} color={COLORS.warning} />
                            <Text style={styles.menuItemText}>ROZETLER</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate('Rules')}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="hammer-outline" size={24} color="#D2B48C" />
                            <Text style={styles.menuItemText}>SKYQUEST KURAL{'\n'}KİTABI</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </DrawerContentScrollView>

            <View style={styles.footer}>
                {isAdmin(auth.currentUser) && (
                    <>
                        <TouchableOpacity style={styles.simButton} onPress={() => setSimulationVisible(true)}>
                            <Text style={styles.simButtonText}>ZAMAN SİMÜLASYONU</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resetButton} onPress={handleAdminReset}>
                            <Text style={styles.resetButtonText}>SIFIRLA (ADMIN)</Text>
                        </TouchableOpacity>
                    </>
                )}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </View>

            <TimeSimulationPanel
                visible={simulationVisible}
                onClose={() => setSimulationVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2C2C2C', // Dark gray background from image
    },
    scrollContent: {
        paddingTop: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60, // Adjust for status bar
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    menuItems: {
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center', // Ensure vertical alignment of children
        justifyContent: 'space-between',
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Push arrow to right
    },
    menuItemText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
        fontFamily: FONTS.bold,
        flex: 1,
        flexWrap: 'wrap',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    logoutButton: {
        backgroundColor: COLORS.secondary, // Brownish color
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    resetButton: {
        backgroundColor: COLORS.error,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    resetButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    simButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    simButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
});
