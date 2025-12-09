import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddHabitModal } from '../components/AddHabitModal';
import { HabitList } from '../components/HabitList';
import { TabSwitcher } from '../components/TabSwitcher';
import { UserProfile } from '../components/UserProfile';
import { COLORS } from '../constants/colors';

export const MainScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={32} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>SKYQUEST</Text>
                    <Image source={require('../../assets/images/fly1.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle" size={32} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <UserProfile />
                <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
                <HabitList activeTab={activeTab} />
            </View>

            <AddHabitModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 8,
        fontFamily: 'System', // Replace with custom font if available
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
});
