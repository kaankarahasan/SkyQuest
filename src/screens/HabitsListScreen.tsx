import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import { AddHabitModal } from '../components/AddHabitModal';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

// Mock Data
// Mock Data removed
// const HABITS: any[] = []; // Empty for new users

export const HabitsListScreen = ({ navigation }: any) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState<any>(null);
    const [habits, setHabits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState(auth.currentUser);

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

        console.log("HabitsListScreen querying for userId:", user.uid);
        const q = query(collection(db, 'habits'), where('userId', '==', user.uid));

        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
            const habitsData: any[] = [];
            querySnapshot.forEach((doc) => {
                habitsData.push({ id: doc.id, ...doc.data() });
            });
            setHabits(habitsData);
            setLoading(false);
        }, (error) => {
            console.error(`HabitsListScreen permission error for userId: ${user.uid}. Error:`, error);
            setLoading(false);
        });

        return () => unsubscribeSnapshot();
    }, [user]);

    const handleEdit = (habit: any) => {
        setSelectedHabit(habit);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedHabit(null);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('HabitDetail', { habit: item })}
        >
            <View style={styles.iconContainer}>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.streak}>🔥 {item.streak} Gün</Text>
            </View>
            <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons name="create-outline" size={32} color={COLORS.text} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ALIŞKANLIKLAR LİSTESİ</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={28} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={habits}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Henüz hiç alışkanlık eklemedin.</Text>
                    </View>
                }
            />

            <AddHabitModal
                visible={modalVisible}
                onClose={handleCloseModal}
                initialData={selectedHabit} // We need to update AddHabitModal to accept this
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
    headerTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    listContent: {
        padding: 16,
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
        fontFamily: FONTS.bold,
    },
    streak: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        fontFamily: FONTS.regular,
    },
});
