import { Ionicons } from '@expo/vector-icons';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebaseConfig';
import { AddHabitModal } from '../components/AddHabitModal';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { useTime } from '../context/TimeContext';
import { Habit } from '../types';
import { calculateStreak, isCompleted } from '../utils/habitUtils';

export const HabitDetailScreen = ({ route, navigation }: any) => {
    const { habit } = route.params;
    const { currentDate } = useTime();
    const [localHabit, setLocalHabit] = useState<Habit>(habit);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

    const formatRepeatText = (days: number[]) => {
        if (!days || days.length === 0) return 'Seçili gün yok';
        if (days.length === 7) return 'Her Gün';

        const weekdays = [0, 1, 2, 3, 4];
        const weekends = [5, 6];

        const isWeekdays = days.length === 5 && weekdays.every(d => days.includes(d));
        const isWeekends = days.length === 2 && weekends.every(d => days.includes(d));

        if (isWeekdays) return 'Hafta İçi';
        if (isWeekends) return 'Hafta Sonu';

        const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        return days.sort((a, b) => a - b).map(d => dayNames[d]).join(', ');
    };

    React.useEffect(() => {
        const habitRef = doc(db, 'habits', habit.id);
        const unsubscribe = onSnapshot(habitRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setLocalHabit({
                    id: doc.id,
                    userId: data.userId,
                    title: data.title,
                    description: data.description,
                    icon: data.icon,
                    color: data.color,
                    repeatType: data.repeatType,
                    selectedDays: data.selectedDays,
                    createdAt: data.createdAt,
                    completedDates: data.completedDates || [],
                    streak: calculateStreak(data.completedDates || [], data.repeatType, currentDate),
                    category: data.category,
                    focusHabitEnabled: data.focusHabitEnabled,
                });
            } else {
                // Document deleted or not found
                // We could handle navigation back here if desired, but for now just avoid error
                console.log("Habit document does not exist");
            }
        }, (error) => {
            console.error("Habit listener error:", error);
        });
        return () => unsubscribe();
    }, [habit.id, currentDate]);

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

    const currentStreak = calculateStreak(localHabit.completedDates, localHabit.repeatType, currentDate);
    const totalCompletions = localHabit.completedDates ? localHabit.completedDates.length : 0;

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
                    <Text style={{ fontSize: 80 }}>{localHabit.icon}</Text>
                </View>

                <Text style={styles.title}>{localHabit.title}</Text>
                <Text style={styles.description}>{localHabit.description}</Text>
                <Text style={styles.category}>Kategori: <Text style={{ fontWeight: 'bold' }}>{localHabit.category}</Text></Text>

                <View style={styles.refreshSection}>
                    <Ionicons name="refresh" size={24} color={COLORS.text} />
                    <Text style={styles.refreshText}>{formatRepeatText(localHabit.selectedDays)}</Text>
                </View>

                <View style={styles.viewSelector}>
                    {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.viewOption, viewMode === mode && styles.activeViewOption]}
                            onPress={() => setViewMode(mode)}
                        >
                            <Text style={[styles.viewOptionText, viewMode === mode && styles.activeViewOptionText]}>
                                {mode === 'weekly' ? 'Haftalık' : mode === 'monthly' ? 'Aylık' : 'Yıllık'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.calendarCard}>
                    {viewMode === 'weekly' && (
                        <View style={styles.weekGrid}>
                            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => {
                                // Calculate if this day is completed in the current week
                                // This is tricky because "Weekly" view usually implies "this week"
                                // Let's assume we show the current week's status
                                const today = currentDate;
                                const currentDay = today.getDay() || 7; // 1-7
                                const diff = index + 1 - currentDay; // index is 0-6 (Mon-Sun), currentDay is 1-7 (Mon-Sun)
                                const targetDate = new Date(today);
                                targetDate.setDate(today.getDate() + diff);

                                const isDone = isCompleted(localHabit.completedDates, localHabit.repeatType, targetDate);

                                return (
                                    <View key={index} style={styles.dayColumn}>
                                        <Text style={styles.dayLabel}>{day}</Text>
                                        <Ionicons
                                            name={isDone ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={isDone ? COLORS.success : COLORS.textSecondary}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {viewMode === 'monthly' && (
                        <View style={styles.calendarContainer}>
                            <Text style={styles.monthTitle}>
                                {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][currentDate.getMonth()]} {currentDate.getFullYear()}
                            </Text>
                            <View style={styles.calendarGrid}>
                                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                    const isDone = isCompleted(localHabit.completedDates, localHabit.repeatType, date);
                                    const isToday = day === currentDate.getDate();

                                    return (
                                        <View key={day} style={[styles.calendarDay, isToday && styles.currentDay, isDone && !isToday && styles.completedDay]}>
                                            <Text style={[styles.calendarDayText, isDone && !isToday && { color: COLORS.success }]}>{day}</Text>
                                            {isDone && isToday && <View style={styles.dot} />}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {viewMode === 'yearly' && (
                        <View style={styles.heatmapContainer}>
                            {Array.from({ length: 12 }, (_, monthIndex) => {
                                const daysInMonth = new Date(currentDate.getFullYear(), monthIndex + 1, 0).getDate();
                                return (
                                    <View key={monthIndex} style={styles.monthRow}>
                                        <Text style={styles.monthLabel}>
                                            {['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][monthIndex]}
                                        </Text>
                                        <View style={styles.heatmapGrid}>
                                            {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                                                const date = new Date(currentDate.getFullYear(), monthIndex, dayIndex + 1);
                                                const isDone = isCompleted(localHabit.completedDates, localHabit.repeatType, date);
                                                return (
                                                    <View key={dayIndex} style={[styles.heatmapCell, { backgroundColor: isDone ? COLORS.success : '#444' }]} />
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={40} color="orange" />
                        <Text style={styles.statValue}>{currentStreak} {localHabit.repeatType === 'Daily' ? 'Gün' : localHabit.repeatType === 'Weekly' ? 'Hafta' : localHabit.repeatType === 'Monthly' ? 'Ay' : 'Yıl'}</Text>
                        <Text style={styles.statLabel}>Seri</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="rocket" size={40} color={COLORS.text} />
                        <Text style={styles.statLabel}>Toplam</Text>
                        <Text style={styles.statLabel}>Kazanılan Puan</Text>
                        <Text style={styles.statValue}>{totalCompletions * (localHabit.focusHabitEnabled ? 3 : 1)}</Text>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
                        <Text style={styles.statLabel}>Toplam</Text>
                        <Text style={styles.statLabel}>Tamamlama</Text>
                        <Text style={styles.statValue}>{totalCompletions}</Text>
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
        fontFamily: FONTS.bold,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: FONTS.regular,
    },
    category: {
        color: COLORS.text,
        fontSize: 18,
        marginBottom: 20,
        fontFamily: FONTS.regular,
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
        fontFamily: FONTS.bold,
    },
    viewSelector: {
        flexDirection: 'row',
        backgroundColor: '#333',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        width: '100%',
    },
    viewOption: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeViewOption: {
        backgroundColor: COLORS.background,
    },
    viewOptionText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontFamily: FONTS.regular,
    },
    activeViewOptionText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    weekGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayColumn: {
        alignItems: 'center',
    },
    dayLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: 4,
        fontFamily: FONTS.regular,
    },
    calendarContainer: {
        padding: 0,
    },
    monthTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: FONTS.bold,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    currentDay: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },
    completedDay: {
        // backgroundColor: 'rgba(76, 175, 80, 0.2)', // Optional
    },
    calendarDayText: {
        color: COLORS.text,
        fontFamily: FONTS.regular,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.success,
        marginTop: 2,
    },
    heatmapContainer: {
        padding: 0,
    },
    monthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    monthLabel: {
        color: COLORS.textSecondary,
        width: 30,
        fontSize: 10,
        fontFamily: FONTS.regular,
    },
    heatmapGrid: {
        flex: 1,
        flexDirection: 'row',
        gap: 2,
    },
    heatmapCell: {
        width: 6,
        height: 6,
        borderRadius: 1,
    },
    calendarCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 20,
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
        fontFamily: FONTS.bold,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
        textAlign: 'center',
        fontFamily: FONTS.regular,
    },
});
