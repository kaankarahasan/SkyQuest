import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

type TabType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

interface TabSwitcherProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
    const tabs: { label: string; value: TabType }[] = [
        { label: 'Günlük', value: 'Daily' },
        { label: 'Haftalık', value: 'Weekly' },
        { label: 'Aylık', value: 'Monthly' },
        { label: 'Yıllık', value: 'Yearly' },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.value}
                    style={[
                        styles.tab,
                        activeTab === tab.value && styles.activeTab,
                    ]}
                    onPress={() => onTabChange(tab.value)}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === tab.value && styles.activeTabText,
                        ]}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: COLORS.tabInactive,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    activeTab: {
        backgroundColor: COLORS.tabActive,
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
    },
    tabText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.text,
    },
});
