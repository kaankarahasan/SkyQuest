import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

export const RulesScreen = ({ navigation }: any) => {
    return (
        <ImageBackground
            source={require('../../assets/images/rulesback.png')}
            style={styles.backgroundImage}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.overlay} />

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>SKYQUEST KURAL KİTABI</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.ruleItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ruleText}>
                            Tamamladığın her alışkanlık için Puan kazanırsın.
                        </Text>
                    </View>

                    <View style={styles.ruleItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ruleText}>
                            Biriktirdiğin her 10 puanda, Seviyen yükselir ve yeni bir seviye atlarsın.
                        </Text>
                    </View>

                    <View style={styles.ruleItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ruleText}>
                            3 günden fazla devam eden bir alışkanlık serisini bozarsan, iraden zayıfladığı için toplam puanından 2 puan kesilir.
                        </Text>
                    </View>

                    <View style={styles.ruleItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ruleText}>
                            Bir alışkanlığı Odak Görevi olarak belirlersen, tamamladığında normal puanına ek %50 daha fazla puan alırsın.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay to make text readable
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        flex: 1,
        fontFamily: FONTS.headingBold,
    },
    content: {
        padding: 24,
    },
    ruleItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    bullet: {
        color: COLORS.text,
        fontSize: 24,
        marginRight: 12,
        marginTop: -4, // Adjust alignment
    },
    ruleText: {
        color: COLORS.text,
        fontSize: 18,
        lineHeight: 26,
        flex: 1,
        fontFamily: FONTS.regular,
    },
});
