import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

// Mock Data for Badges
const BADGES = [
    {
        id: '1',
        title: 'Seri Katılım',
        description: 'Göreve ardı ardına 7 gün katılarak cesaretini gösterdin. (Seviye 1, Seviye 3, Seviye 5)',
        icon: 'shield-checkmark', // Using Ionicons for now, ideally custom images
        color: '#FF6B6B',
    },
    {
        id: '2',
        title: 'Alışkanlık Zinciri',
        description: 'Alışkanlığın ilk zincirini kurdun. Daha güçlü bağlar oluştur! (Seviye 1, Seviye 3, Seviye 5)',
        icon: 'link',
        color: '#4ECDC4',
    },
    {
        id: '3',
        title: 'Günlük Ritüel',
        description: 'Görevine sabahın ilk saatlerinde sadık kaldın. (Seviye 1, Seviye 3, Seviye 5)',
        icon: 'sunny',
        color: '#FFE66D',
    },
    {
        id: '4',
        title: 'Haftanın Tamamı',
        description: 'Bir haftalık tüm görevlerini başarıyla belgeledin. (Seviye 1, Seviye 3, Seviye 5)',
        icon: 'calendar',
        color: '#1A535C',
    },
    {
        id: '5',
        title: 'Kesintisiz',
        description: 'Dikkatin dağılsa da odağını geri kazanmayı başardın. (Seviye 1, Seviye 3, Seviye 5)',
        icon: 'flash',
        color: '#FF9F1C',
    },
    {
        id: '6',
        title: 'Toplam Puan',
        description: 'İlk 10 puanını kazandın, macera şimdi başlıyor! (Seviye 1, Seviye 3, Seviye 5)',
        icon: 'trophy',
        color: '#FFD700',
    },
    {
        id: '7',
        title: 'Deneyim Toplama',
        description: 'Yeni keşifler yapmaya ve deneyimlemeye devam et. (Seviye 1, Seviye 3, Seviye 5)',
        icon: 'map',
        color: '#95D5B2',
    },
];

export const BadgesScreen = ({ navigation }: any) => {
    const renderItem = ({ item }: { item: typeof BADGES[0] }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={48} color={item.color} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ROZETLER</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={BADGES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
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
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'System', // Replace with custom pixel font if available
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 16,
        width: 60,
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
});
