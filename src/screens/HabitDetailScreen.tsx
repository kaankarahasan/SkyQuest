import { Ionicons } from '@expo/vector-icons';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';
import { AddHabitModal } from '../components/AddHabitModal';
import { COLORS } from '../constants/colors';

export const HabitDetailScreen = ({ route, navigation }: any) => {
    const { habit } = route.params;
    const [localHabit, setLocalHabit] = useState(habit);
    const [modalVisible, setModalVisible] = useState(false);

    React.useEffect(() => {
        const habitRef = doc(db, 'habits', habit.id);
        const unsubscribe = onSnapshot(habitRef, (doc) => {
            if (doc.exists()) {
                setLocalHabit({ id: doc.id, ...doc.data() });
            }
        });
        return () => unsubscribe();
    }, [habit.id]);

    const handleDelete = () => {
        Alert.alert(
            "Alışkanlığı Sil",
            "Bu alışkanlığı silmek istediğinize emin misiniz?",
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'habits', habit.id));
                            navigation.goBack();
                        } catch (error) {
                            console.error("Error deleting habit:", error);
                            Alert.alert("Hata", "Alışkanlık silinemedi.");
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
                <View style={styles.headerRight}>
                    <TouchableOpacity style={{ marginRight: 16 }} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name="create-outline" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconSection}>
                    <Ionicons name={localHabit.icon} size={80} color={localHabit.color} />
                </View>

                <Text style={styles.title}>{localHabit.title}</Text>
                <Text style={styles.description}>{localHabit.description}</Text>
                <Text style={styles.category}>Kategori: <Text style={{ fontWeight: 'bold' }}>{localHabit.category}</Text></Text>

                <View style={styles.refreshSection}>
                    <Ionicons name="refresh" size={24} color={COLORS.text} />
                    <Text style={styles.refreshText}>Her Gün</Text>
                </View>

                <View style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                        <Text style={styles.monthText}>Kasım</Text>
                        <Text style={styles.yearText}>2025</Text>
                    </View>
                    <Text style={styles.daysHeader}>Pzt Sal Çar Per Cum Cmt Paz</Text>

                    {/* Mock Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {/* Just a visual representation based on the image */}
                        <View style={styles.calendarRow}>
                            <Text style={styles.emptyDay}></Text><Text style={styles.emptyDay}></Text><Text style={styles.emptyDay}></Text><Text style={styles.emptyDay}></Text><Text style={styles.emptyDay}></Text><Text style={styles.dayText}>1</Text><Text style={styles.dayText}>2</Text>
                        </View>
                        <View style={styles.calendarRow}>
                            <View style={styles.dayCircle}><Text style={styles.dayText}>3</Text></View>
                            <View style={[styles.dayCircle, styles.completedDay]}><Text style={styles.dayText}>4</Text></View>
                            <View style={[styles.dayCircle, styles.completedDay]}><Text style={styles.dayText}>5</Text></View>
                            <View style={[styles.dayCircle, styles.completedDay]}><Text style={styles.dayText}>6</Text></View>
                            <View style={[styles.dayCircle, styles.completedDay]}><Text style={styles.dayText}>7</Text></View>
                            <View style={[styles.dayCircle, styles.completedDay]}><Text style={styles.dayText}>8</Text></View>
                            <View style={[styles.dayCircle, styles.completedDay]}><Text style={styles.dayText}>9</Text></View>
                        </View>
                        {/* ... more rows */}
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={40} color="orange" />
                        <Text style={styles.statValue}>7 Gün</Text>
                        <Text style={styles.statLabel}>Seri</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="rocket" size={40} color={COLORS.text} />
                        <Text style={styles.statLabel}>Toplam</Text>
                        <Text style={styles.statLabel}>Kazanılan Puan</Text>
                        <Text style={styles.statValue}>60</Text>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
                        <Text style={styles.statLabel}>Toplam</Text>
                        <Text style={styles.statLabel}>Tamamlama</Text>
                        <Text style={styles.statValue}>24</Text>
                    </View>
                </View>

            </ScrollView>

            <AddHabitModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={localHabit}
                onDelete={handleDelete}
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
    headerRight: {
        flexDirection: 'row',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    iconSection: {
        marginBottom: 20,
    },
    title: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
    category: {
        color: COLORS.text,
        fontSize: 18,
        marginBottom: 20,
    },
    refreshSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    refreshText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    calendarCard: {
        backgroundColor: '#333',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 20,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    monthText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    yearText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    daysHeader: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: 'monospace', // To align somewhat
        marginBottom: 10,
        textAlign: 'center', // Simplified
    },
    calendarGrid: {
        alignItems: 'center',
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
    },
    dayText: {
        color: COLORS.text,
        width: 30,
        textAlign: 'center',
    },
    emptyDay: {
        width: 30,
    },
    dayCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.success,
    },
    completedDay: {
        backgroundColor: 'rgba(76, 175, 80, 0.3)', // Transparent green
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 4,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
        textAlign: 'center',
    },
});
