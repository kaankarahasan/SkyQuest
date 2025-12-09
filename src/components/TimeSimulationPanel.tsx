import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { useTime } from '../context/TimeContext';
import { simulateUsage } from '../utils/simulationUtils';

interface TimeSimulationPanelProps {
    visible: boolean;
    onClose: () => void;
}

export const TimeSimulationPanel = ({ visible, onClose }: TimeSimulationPanelProps) => {
    const { simulateTimeTravel, resetTime, currentDate } = useTime();
    const [loading, setLoading] = useState(false);
    const [scenario, setScenario] = useState<'success' | 'failure'>('success'); // Default to success

    const handleSimulation = async (days: number, label: string) => {
        if (!auth.currentUser) return;

        setLoading(true);
        try {
            // Ensure User Profile Exists (Fix for Permission Error on missing doc)
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef).catch(() => null);

            if (!userSnap || !userSnap.exists()) {
                await setDoc(userRef, {
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email || '',
                    displayName: auth.currentUser.displayName || 'Admin',
                    points: 0,
                    level: 1,
                    earnedBadgeIds: [],
                    totalCompletions: 0
                }, { merge: true });
            }

            const realNow = new Date();
            // Start from the CURRENT SIMULATED DATE (Cumulative)
            const startDate = new Date(currentDate);

            const targetDate = new Date(startDate);
            targetDate.setDate(startDate.getDate() + days);

            // Calculate offset relative to real now
            const offset = targetDate.getTime() - realNow.getTime();

            // 1. Simulate Data
            await simulateUsage(startDate, targetDate, auth.currentUser.uid, scenario);

            // 2. Travel Time
            simulateTimeTravel(offset);

            const scenarioText = scenario === 'success' ? 'Başarılı (Tüm Alışkanlıklar Yapıldı)' : 'Başarısız (Hiçbir Şey Yapılmadı)';
            Alert.alert("Simülasyon Tamamlandı", `${label} ileri gidildi.\nSenaryo: ${scenarioText}\nYeni Tarih: ${targetDate.toLocaleDateString('tr-TR')}`);

            onClose();
        } catch (error) {
            console.error(error);
            Alert.alert("Hata", "Simülasyon sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        resetTime();
        onClose();
        Alert.alert("Sıfırlandı", "Gerçek zamana dönüldü.");
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Zaman Simülasyonu (Admin)</Text>
                    <Text style={styles.currentDate}>Simüle Edilen Tarih: {currentDate.toLocaleDateString('tr-TR')}</Text>

                    <Text style={styles.sectionTitle}>Senaryo Seçimi</Text>
                    <View style={styles.scenarioContainer}>
                        <TouchableOpacity
                            style={[styles.scenarioButton, scenario === 'success' && styles.scenarioButtonActive]}
                            onPress={() => setScenario('success')}
                        >
                            <Text style={[styles.scenarioText, scenario === 'success' && styles.scenarioTextActive]}>Başarılı (Hepsi Yapıldı)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.scenarioButton, scenario === 'failure' && styles.scenarioButtonActive]}
                            onPress={() => setScenario('failure')}
                        >
                            <Text style={[styles.scenarioText, scenario === 'failure' && styles.scenarioTextActive]}>Başarısız (Hiçbiri Yapılmadı)</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description}>
                        Seçilen senaryoya göre ({scenario === 'success' ? 'Tüm alışkanlıklar tamamlanacak' : 'Hiçbir alışkanlık yapılmayacak'}) ve o tarihe gidilecektir.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.button, styles.halfButton, loading && styles.disabledButton]}
                                onPress={() => handleSimulation(1, '1 Gün')}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>+1 Gün</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.halfButton, loading && styles.disabledButton]}
                                onPress={() => handleSimulation(7, '1 Hafta')}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>+1 Hafta</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={() => handleSimulation(30, '30 Gün')}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>+30 Gün (1 Ay)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={() => handleSimulation(180, '6 Ay')}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>+6 Ay</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={() => handleSimulation(365, '1 Yıl')}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>+1 Yıl</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.resetButton, loading && styles.disabledButton]}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        <Text style={styles.resetButtonText}>Gerçek Zamana Dön</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        disabled={loading}
                    >
                        <Text style={styles.closeButtonText}>Kapat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalView: {
        width: '90%',
        backgroundColor: '#2C2C2C',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        color: COLORS.white,
        fontFamily: FONTS.bold,
        marginBottom: 10,
        textAlign: 'center',
    },
    currentDate: {
        fontSize: 16,
        color: COLORS.primary,
        fontFamily: FONTS.bold,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        color: COLORS.white,
        fontFamily: FONTS.bold,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    scenarioContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 15,
        gap: 10,
    },
    scenarioButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
        borderRadius: 8,
        alignItems: 'center',
    },
    scenarioButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    scenarioText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        textAlign: 'center',
    },
    scenarioTextActive: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 20,
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    halfButton: {
        flex: 1,
    },
    disabledButton: {
        backgroundColor: '#555',
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    resetButton: {
        backgroundColor: COLORS.error,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    resetButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    closeButton: {
        padding: 10,
    },
    closeButtonText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
});
