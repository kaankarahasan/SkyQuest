import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';

type TabType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

interface HabitListProps {
    activeTab: TabType;
}

// const MOCK_HABITS: any[] = []; // Empty for new users

export const HabitList = ({ activeTab }: HabitListProps) => {
    const [habits, setHabits] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const habitsData: any[] = [];
            querySnapshot.forEach((doc) => {
                habitsData.push({ id: doc.id, ...doc.data() });
            });
            setHabits(habitsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { borderColor: item.completed ? 'transparent' : item.color, borderWidth: item.completed ? 0 : 2 }]}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.streak}>🔥 {item.streak} Gün</Text>
            </View>
            <TouchableOpacity style={styles.checkbox}>
                {item.completed ? (
                    <Ionicons name="checkbox" size={32} color={COLORS.success} />
                ) : (
                    <Ionicons name="square-outline" size={32} color={COLORS.textSecondary} />
                )}
            </TouchableOpacity>
        </View>
    );

    const renderDailyView = () => (
        <FlatList
            data={habits}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Henüz hiç alışkanlık eklemedin.</Text>
                    <Text style={styles.emptySubText}>Yukarıdaki + butonuna basarak yeni bir alışkanlık ekle!</Text>
                </View>
            }
        />
    );

    const renderWeeklyView = () => {
        if (habits.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Henüz hiç alışkanlık eklemedin.</Text>
                </View>
            );
        }

        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Haftalık Görünüm</Text>
                {/* Placeholder for Weekly Grid: Mon-Sun checkmarks */}
                {habits.map(habit => (
                    <View key={habit.id} style={styles.weeklyCard}>
                        <Text style={styles.weeklyTitle}>{habit.title}</Text>
                        <View style={styles.weekGrid}>
                            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => (
                                <View key={index} style={styles.dayColumn}>
                                    <Text style={styles.dayLabel}>{day}</Text>
                                    <Ionicons name="ellipse-outline" size={24} color={COLORS.textSecondary} />
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderMonthlyView = () => {
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        const monthNames = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];

        // Get number of days in current month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Aylık Görünüm</Text>
                {/* Placeholder for Monthly Calendar */}
                <View style={styles.calendarContainer}>
                    <Text style={styles.monthTitle}>{monthNames[currentMonth]} {currentYear}</Text>
                    <View style={styles.calendarGrid}>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                            <View key={day} style={[styles.calendarDay, day === currentDay && styles.currentDay]}>
                                <Text style={styles.calendarDayText}>{day}</Text>
                                {/* No dots for empty state */}
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const renderYearlyView = () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthNamesShort = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Yıllık Görünüm ({currentYear})</Text>
                {/* Placeholder for Yearly Heatmap */}
                <View style={styles.heatmapContainer}>
                    {Array.from({ length: 12 }, (_, monthIndex) => {
                        const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
                        return (
                            <View key={monthIndex} style={styles.monthRow}>
                                <Text style={styles.monthLabel}>{monthNamesShort[monthIndex]}</Text>
                                <View style={styles.heatmapGrid}>
                                    {Array.from({ length: daysInMonth }, (_, dayIndex) => (
                                        <View key={dayIndex} style={[styles.heatmapCell, { backgroundColor: '#333' }]} />
                                    ))}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {activeTab === 'Daily' && renderDailyView()}
            {activeTab === 'Weekly' && renderWeeklyView()}
            {activeTab === 'Monthly' && renderMonthlyView()}
            {activeTab === 'Yearly' && renderYearlyView()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    streak: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    checkbox: {
        marginLeft: 12,
    },
    placeholderContainer: {
        flex: 1,
        padding: 10,
    },
    placeholderText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    weeklyCard: {
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    weeklyTitle: {
        color: COLORS.text,
        fontSize: 16,
        marginBottom: 12,
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
    },
    calendarContainer: {
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 12,
    },
    monthTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
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
    calendarDayText: {
        color: COLORS.text,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.success,
        marginTop: 2,
    },
    heatmapContainer: {
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 12,
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },
});
