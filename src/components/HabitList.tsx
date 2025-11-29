import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

type TabType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

interface HabitListProps {
    activeTab: TabType;
}

const MOCK_HABITS = [
    {
        id: '1',
        title: '2 Litre Su İç',
        streak: 6,
        completed: true,
        icon: 'water-outline', // Ionicons name
        color: '#4FC3F7', // Light Blue
    },
    {
        id: '2',
        title: 'Her Gün 10.000 Adım Yürü',
        streak: 21,
        completed: false,
        icon: 'walk-outline',
        color: '#FFD54F', // Amber
    },
];

export const HabitList = ({ activeTab }: HabitListProps) => {
    const renderItem = ({ item }: { item: typeof MOCK_HABITS[0] }) => (
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
            data={MOCK_HABITS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
        />
    );

    const renderWeeklyView = () => (
        <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Haftalık Görünüm</Text>
            {/* Placeholder for Weekly Grid: Mon-Sun checkmarks */}
            {MOCK_HABITS.map(habit => (
                <View key={habit.id} style={styles.weeklyCard}>
                    <Text style={styles.weeklyTitle}>{habit.title}</Text>
                    <View style={styles.weekGrid}>
                        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => (
                            <View key={index} style={styles.dayColumn}>
                                <Text style={styles.dayLabel}>{day}</Text>
                                <Ionicons name={index < 5 ? "checkmark-circle" : "ellipse-outline"} size={24} color={index < 5 ? COLORS.success : COLORS.textSecondary} />
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );

    const renderMonthlyView = () => (
        <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Aylık Görünüm</Text>
            {/* Placeholder for Monthly Calendar */}
            <View style={styles.calendarContainer}>
                <Text style={styles.monthTitle}>Kasım 2025</Text>
                <View style={styles.calendarGrid}>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                        <View key={day} style={[styles.calendarDay, day === 27 && styles.currentDay]}>
                            <Text style={styles.calendarDayText}>{day}</Text>
                            {day % 2 === 0 && <View style={styles.dot} />}
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderYearlyView = () => (
        <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Yıllık Görünüm</Text>
            {/* Placeholder for Yearly Heatmap */}
            <View style={styles.heatmapContainer}>
                {Array.from({ length: 12 }, (_, i) => (
                    <View key={i} style={styles.monthRow}>
                        <Text style={styles.monthLabel}>{['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][i]}</Text>
                        <View style={styles.heatmapGrid}>
                            {Array.from({ length: 30 }, (_, j) => (
                                <View key={j} style={[styles.heatmapCell, { backgroundColor: Math.random() > 0.5 ? COLORS.primary : '#333' }]} />
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

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
});
