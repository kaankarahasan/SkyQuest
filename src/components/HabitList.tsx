import { Ionicons } from '@expo/vector-icons';
import { collection, doc, onSnapshot, query, runTransaction, updateDoc, where } from 'firebase/firestore';
import React from 'react';
import { Alert, Animated, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { useTime } from '../context/TimeContext';
import { Habit, RepeatType, User } from '../types';
import { calculateLevel, checkBadges } from '../utils/gamificationUtils';
import { calculateStreak, getCompletionKey, getStreakUnit, isCompleted } from '../utils/habitUtils';

// ... (rest of imports are fine, but I need to target the start of the file for the import)
// Wait, I can't target multiple non-contiguous blocks easily with one chunk if the gap is huge.
// I will just use multiple chunks.

// Chunk 1: Import
// Chunk 2: renderItem
// Chunk 3: renderWeekly
// Chunk 4: renderMonthly
// Chunk 5: renderYearly

// Actually I can just do MultiReplace. But this tool is ReplaceFileContent.
// I should use MultiReplace.
// Wait, I am restricted to use ReplaceFileContent if I am editing a single contiguous block? No.
// "Use this tool ONLY when you are making a SINGLE CONTIGUOUS block of edits".
// So I must use MultiReplace for this.


interface HabitListProps {
    activeTab: RepeatType;
}

const GlowOverlay = ({ active, color }: { active: boolean, color: string }) => {
    const opacity = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (active) {
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.5, duration: 300, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true })
            ]).start();
        }
    }, [active]);

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                {
                    backgroundColor: color || COLORS.primary,
                    opacity: opacity,
                    borderRadius: 12,
                    pointerEvents: 'none'
                }
            ]}
        />
    );
};

const FlashingView = ({ children, active, style }: { children: React.ReactNode, active?: boolean, style?: any }) => {
    const opacity = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        let animation: any;
        if (active) {
            animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 0.6,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            animation.start();
        } else {
            opacity.setValue(1);
        }

        return () => {
            if (animation) animation.stop();
        };
    }, [active]);

    return (
        <Animated.View style={[style, { opacity }]}>
            {children}
        </Animated.View>
    );
};

export const HabitList = ({ activeTab }: HabitListProps) => {
    const { currentDate } = useTime();
    const [habits, setHabits] = React.useState<Habit[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [user, setUser] = React.useState(auth.currentUser);

    React.useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((u) => {
            setUser(u);
            if (!u) {
                setHabits([]);
                setLoading(false);
            }
        });
        return unsubscribeAuth;
    }, []);

    React.useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
            const habitsData: Habit[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                habitsData.push({
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
                    reminderEnabled: data.reminderEnabled,
                });
            });
            setHabits(habitsData);
            setLoading(false);
        }, (error) => {
            console.error("HabitList snapshot error:", error);
            setLoading(false);
        });
        return () => unsubscribeSnapshot();
    }, [user, currentDate]);

    React.useEffect(() => {
        if (!user || loading || habits.length === 0) return;

        const checkStreakPenalties = async () => {
            const habitsToReset: Habit[] = [];

            habits.forEach(habit => {
                const currentStreak = calculateStreak(habit.completedDates || [], habit.repeatType, currentDate);
                // If calculated streak is 0 (broken) BUT stored streak was >= 3
                // This implies we haven't processed the break yet
                if (currentStreak === 0 && habit.streak >= 3) {
                    habitsToReset.push(habit);
                }
            });

            if (habitsToReset.length > 0) {
                const userRef = doc(db, 'users', user.uid);

                try {
                    await runTransaction(db, async (transaction) => {
                        const userDoc = await transaction.get(userRef);
                        if (!userDoc.exists()) return;

                        const userData = userDoc.data() as User;
                        const streakBreakCount = userData.streakBreakCount || 0;
                        let newPoints = userData.points;
                        let alertMessage = "";

                        if (streakBreakCount === 0) {
                            // First time warning
                            alertMessage = "Dikkat! 3 günlük bir seriyi bozdun. Bu seferlik puan kaybetmedin, ama dikkatli ol!";
                        } else {
                            // Penalty
                            newPoints = Math.max(0, newPoints - 2);
                            alertMessage = "Seri Bozuldu! 3 günlük seriyi bozduğun için 2 puan kaybettin.";
                        }

                        // Update User
                        transaction.update(userRef, {
                            points: newPoints,
                            streakBreakCount: streakBreakCount + 1
                        });

                        // Reset Habit Streaks
                        habitsToReset.forEach(habit => {
                            const habitRef = doc(db, 'habits', habit.id);
                            transaction.update(habitRef, { streak: 0 });
                        });

                        // Show Alert
                        if (alertMessage) {
                            setTimeout(() => Alert.alert("Seri Bozuldu", alertMessage), 500);
                        }
                    });
                } catch (e) {
                    console.error("Error processing penalties:", e);
                }
            }
        };

        checkStreakPenalties();
    }, [habits, user, loading, currentDate]);

    const toggleHabitCompletion = async (habit: Habit) => {
        const today = currentDate;
        const key = getCompletionKey(today, habit.repeatType);
        const isAlreadyCompleted = isCompleted(habit.completedDates, habit.repeatType, today);

        // 1. Irreversibility & Confirmation
        if (isAlreadyCompleted) {
            Alert.alert("Tamamlandı", "Bu alışkanlık zaten tamamlandı ve geri alınamaz.");
            return;
        }

        Alert.alert(
            "Alışkanlığı Tamamla",
            "Bu alışkanlığı tamamlamak istediğine emin misin? Bu işlem geri alınamaz.",
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Evet, Tamamla",
                    onPress: async () => {
                        // Proceed with completion
                        let newCompletedDates = [...habit.completedDates];
                        if (!newCompletedDates.includes(key)) {
                            newCompletedDates.push(key);
                        }

                        const newStreak = calculateStreak(newCompletedDates, habit.repeatType, currentDate);

                        try {
                            // Update Habit
                            const habitRef = doc(db, 'habits', habit.id);
                            await updateDoc(habitRef, {
                                completedDates: newCompletedDates,
                                streak: newStreak
                            });

                            // Update User (Gamification)
                            const userRef = doc(db, 'users', habit.userId);
                            await runTransaction(db, async (transaction) => {
                                const userDoc = await transaction.get(userRef);

                                let userData: User;
                                if (!userDoc.exists()) {
                                    userData = {
                                        uid: habit.userId,
                                        email: auth.currentUser?.email || '',
                                        displayName: auth.currentUser?.displayName || '',
                                        photoUrl: null,
                                        points: 0,
                                        level: 1,
                                        earnedBadgeIds: [],
                                        totalCompletions: 0
                                    };
                                } else {
                                    userData = userDoc.data() as User;
                                }

                                let newPoints = userData.points || 0;
                                let newTotalCompletions = userData.totalCompletions || 0;

                                const pointsToChange = habit.focusHabitEnabled ? 3 : 1;

                                newPoints += pointsToChange;
                                newTotalCompletions += 1;

                                // Calculate Level
                                const { level, title } = calculateLevel(newPoints);

                                // Check Badges (Only on completion)
                                let newEarnedBadges = userData.earnedBadgeIds || [];
                                const updatedUserForCheck = { ...userData, points: newPoints, level, totalCompletions: newTotalCompletions, earnedBadgeIds: newEarnedBadges };
                                const habitDataForCheck = { ...habit, streak: newStreak };

                                const unlockedBadges = checkBadges(updatedUserForCheck, habitDataForCheck);
                                if (unlockedBadges.length > 0) {
                                    newEarnedBadges = [...newEarnedBadges, ...unlockedBadges];
                                    Alert.alert("Yeni Rozet Kazandın!", "Tebrikler, yeni bir rozet kazandın! Profilinden inceleyebilirsin.");
                                }

                                transaction.set(userRef, {
                                    ...userData,
                                    points: newPoints,
                                    level: level,
                                    totalCompletions: newTotalCompletions,
                                    earnedBadgeIds: newEarnedBadges
                                }, { merge: true });
                            });

                        } catch (error) {
                            console.error("Error updating habit completion:", error);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Habit }) => {
        const completed = isCompleted(item.completedDates, item.repeatType, currentDate);
        const showBorder = !completed || (completed && item.focusHabitEnabled);

        return (
            <FlashingView active={item.reminderEnabled && !completed} style={[styles.card, { borderColor: showBorder ? item.color : 'transparent', borderWidth: showBorder ? 2 : 0 }]}>
                <GlowOverlay active={completed} color={item.color} />
                <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.habitTitle, completed && styles.completedText]}>{item.title}</Text>
                    <Text style={styles.habitDescription}>{item.description}</Text>
                    <Text style={styles.streakText}>🔥 {item.streak} {getStreakUnit(item.repeatType)}</Text>
                </View>
                <TouchableOpacity style={styles.checkbox} onPress={() => toggleHabitCompletion(item)}>
                    {completed ? (
                        <Ionicons name="checkbox" size={32} color={COLORS.success} />
                    ) : (
                        <Ionicons name="square-outline" size={32} color={COLORS.textSecondary} />
                    )}
                </TouchableOpacity>
            </FlashingView>
        );
    };

    const filteredHabits = habits
        .filter(habit => habit.repeatType === activeTab)
        .sort((a, b) => {
            const aCompleted = isCompleted(a.completedDates, a.repeatType, currentDate) ? 1 : 0;
            const bCompleted = isCompleted(b.completedDates, b.repeatType, currentDate) ? 1 : 0;
            return aCompleted - bCompleted;
        });

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bu kategoride henüz hiç alışkanlık yok.</Text>
            <Text style={styles.emptySubText}>Yukarıdaki + butonuna basarak yeni bir {activeTab === 'Daily' ? 'günlük' : activeTab === 'Weekly' ? 'haftalık' : activeTab === 'Monthly' ? 'aylık' : 'yıllık'} alışkanlık ekle!</Text>
        </View>
    );

    const renderDailyView = () => (
        <FlatList
            data={filteredHabits}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            scrollEnabled={false}
        />
    );

    const renderWeeklyView = () => (
        <ScrollView style={styles.container} contentContainerStyle={styles.listContent}>
            {filteredHabits.length === 0 ? renderEmptyState() : filteredHabits.map(habit => {
                const completed = isCompleted(habit.completedDates, habit.repeatType, currentDate);
                const showBorder = !completed || (completed && habit.focusHabitEnabled);

                // Check if today is allowed for this habit
                const today = currentDate;
                const dayIndex = today.getDay() || 7; // 1-7 (Mon-Sun) but getDay returns 0-6 (Sun-Sat).
                // Our selectedDays: 0=Mon, 6=Sun.
                // JS getDay(): 0=Sun, 1=Mon...6=Sat.
                // Conversion: JS(1)=Mon(0). JS(0)=Sun(6).
                const jsDayToLocal = (d: number) => d === 0 ? 6 : d - 1;
                const currentDayIndex = jsDayToLocal(today.getDay());

                const isDayAllowed = habit.selectedDays && habit.selectedDays.includes(currentDayIndex);

                return (
                    <FlashingView key={habit.id} active={habit.reminderEnabled && !completed} style={[styles.weeklyCard, { borderColor: showBorder ? habit.color : 'transparent', borderWidth: showBorder ? 2 : 0 }]}>
                        <GlowOverlay active={completed} color={habit.color} />
                        <View style={styles.habitHeader}>
                            <View style={styles.iconContainer}>
                                <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={[styles.habitTitle, completed && styles.completedText]}>{habit.title}</Text>
                                <Text style={styles.streakText}>🔥 {habit.streak} {getStreakUnit(habit.repeatType)}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.checkbox, !isDayAllowed && { opacity: 0.3 }]}
                                onPress={() => isDayAllowed ? toggleHabitCompletion(habit) : Alert.alert("Uyarı", "Bu alışkanlık bugün için planlanmamış.")}
                            >
                                {completed ? (
                                    <Ionicons name="checkbox" size={32} color={COLORS.success} />
                                ) : (
                                    <Ionicons name="square-outline" size={32} color={COLORS.textSecondary} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.weekGrid}>
                            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => {
                                // Check if this specific day is completed
                                // We need to check if ANY date in completedDates corresponds to this day index in the CURRENT week
                                // Calculate the Date object for this index in current week
                                // Calculate date for this column
                                const diff = index - currentDayIndex;
                                const d = new Date(currentDate);
                                d.setDate(currentDate.getDate() + diff);

                                const isDayDone = isCompleted(habit.completedDates, 'Daily', d);

                                const isSelected = habit.selectedDays.includes(index);

                                return (
                                    <View key={index} style={[styles.dayColumn, !isSelected && { opacity: 0.3 }]}>
                                        <Text style={styles.dayLabel}>{day}</Text>
                                        <Ionicons
                                            name={isDayDone ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={isDayDone ? COLORS.success : COLORS.textSecondary}
                                        />
                                    </View>
                                )
                            })}
                        </View>
                    </FlashingView>
                )
            })}
        </ScrollView>
    );

    const renderMonthlyView = () => {
        const now = currentDate;
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0-6 Sun-Sat
        // Adjust for Mon start: 0->6, 1->0 ... (Sun(0) should be 6, Mon(1) should be 0)
        const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.listContent}>
                {filteredHabits.length === 0 ? renderEmptyState() : filteredHabits.map(habit => {
                    const completed = isCompleted(habit.completedDates, habit.repeatType, currentDate);
                    const showBorder = !completed || (completed && habit.focusHabitEnabled);
                    return (
                        <FlashingView key={habit.id} active={habit.reminderEnabled && !completed} style={[styles.weeklyCard, { borderColor: showBorder ? habit.color : 'transparent', borderWidth: showBorder ? 2 : 0 }]}>
                            <GlowOverlay active={completed} color={habit.color} />
                            <View style={styles.habitHeader}>
                                <View style={styles.iconContainer}>
                                    <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={[styles.habitTitle, isCompleted(habit.completedDates, habit.repeatType, currentDate) && styles.completedText]}>{habit.title}</Text>
                                    <Text style={styles.streakText}>🔥 {habit.streak} {getStreakUnit(habit.repeatType)}</Text>
                                </View>
                                <TouchableOpacity style={styles.checkbox} onPress={() => toggleHabitCompletion(habit)}>
                                    {isCompleted(habit.completedDates, habit.repeatType, currentDate) ? (
                                        <Ionicons name="checkbox" size={32} color={COLORS.success} />
                                    ) : (
                                        <Ionicons name="square-outline" size={32} color={COLORS.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View style={styles.calendarContainer}>
                                <Text style={styles.monthTitle}>{monthNames[currentMonth]} {currentYear}</Text>
                                <View style={styles.calendarGrid}>
                                    {Array.from({ length: startDayIndex }, (_, i) => (
                                        <View key={`empty-${i}`} style={styles.calendarDay} />
                                    ))}
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                        const dayDate = new Date(currentYear, currentMonth, day);
                                        const isDayCompleted = isCompleted(habit.completedDates, 'Daily', dayDate);
                                        return (
                                            <View key={day} style={[styles.calendarDay, day === currentDay && styles.currentDay]}>
                                                <Text style={styles.calendarDayText}>{day}</Text>
                                                {isDayCompleted && <View style={styles.dot} />}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </FlashingView>
                    )
                })}
            </ScrollView>
        );
    };

    const renderYearlyView = () => {
        const now = currentDate;
        const currentYear = now.getFullYear();
        const monthNamesShort = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.listContent}>
                {filteredHabits.length === 0 ? renderEmptyState() : filteredHabits.map(habit => {
                    const completed = isCompleted(habit.completedDates, habit.repeatType, currentDate);
                    const showBorder = !completed || (completed && habit.focusHabitEnabled);
                    return (
                        <FlashingView key={habit.id} active={habit.reminderEnabled && !completed} style={[styles.weeklyCard, { borderColor: showBorder ? habit.color : 'transparent', borderWidth: showBorder ? 2 : 0 }]}>
                            <GlowOverlay active={completed} color={habit.color} />
                            <View style={styles.habitHeader}>
                                <View style={styles.iconContainer}>
                                    <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={[styles.habitTitle, isCompleted(habit.completedDates, habit.repeatType) && styles.completedText]}>{habit.title}</Text>
                                    <Text style={styles.streakText}>🔥 {habit.streak} {getStreakUnit(habit.repeatType)}</Text>
                                </View>
                                <TouchableOpacity style={styles.checkbox} onPress={() => toggleHabitCompletion(habit)}>
                                    {isCompleted(habit.completedDates, habit.repeatType) ? (
                                        <Ionicons name="checkbox" size={32} color={COLORS.success} />
                                    ) : (
                                        <Ionicons name="square-outline" size={32} color={COLORS.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </View>
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
                        </FlashingView>
                    )
                })}
            </ScrollView>
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
    habitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
    habitTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
        fontFamily: FONTS.bold,
    },
    habitDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontFamily: FONTS.regular,
    },
    streakText: {
        color: COLORS.gold,
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
        fontFamily: FONTS.bold,
    },
    completedText: {
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
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
        fontFamily: FONTS.bold,
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
        fontFamily: FONTS.bold,
    },
    emptySubText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: FONTS.regular,
    },
});
