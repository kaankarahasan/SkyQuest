import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface AddHabitModalProps {
    visible: boolean;
    onClose: () => void;
    initialData?: any; // For edit mode
}

export const AddHabitModal = ({ visible, onClose, initialData }: AddHabitModalProps) => {
    const [habitName, setHabitName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS.primary);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [focusHabitEnabled, setFocusHabitEnabled] = useState(false);

    // Effect to populate data when initialData changes
    React.useEffect(() => {
        if (initialData) {
            setHabitName(initialData.title);
            setDescription(initialData.description || '');
            setSelectedColor(initialData.color || COLORS.primary);
            // ... set other fields
        } else {
            // Reset fields
            setHabitName('');
            setDescription('');
            setSelectedColor(COLORS.primary);
        }
    }, [initialData, visible]);

    const colors = [
        '#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#F44336', '#FFEB3B', '#00BCD4',
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{initialData ? 'ALIŞKANLIK DÜZENLEME' : 'ALIŞKANLIK EKLEME'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.saveButton}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.emojiContainer}>
                            {/* Placeholder for Emoji Picker/Display */}
                            <View style={styles.emojiPlaceholder}>
                                <Text style={{ fontSize: 40 }}>🤩</Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Alışkanlık Adı"
                            placeholderTextColor={COLORS.textSecondary}
                            value={habitName}
                            onChangeText={setHabitName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Açıklama Ekle"
                            placeholderTextColor={COLORS.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TouchableOpacity style={styles.input}>
                            <Text style={{ color: COLORS.textSecondary }}>Kategori Ekle</Text>
                        </TouchableOpacity>

                        <View style={styles.colorContainer}>
                            {colors.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorCircle, { backgroundColor: color }]}
                                    onPress={() => setSelectedColor(color)}
                                >
                                    {selectedColor === color && (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    )}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={[styles.colorCircle, { backgroundColor: COLORS.error }]}>
                                <Ionicons name="checkmark" size={16} color="white" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Tekrar</Text>
                        <View style={styles.repeatContainer}>
                            <TouchableOpacity style={[styles.repeatButton, styles.activeRepeatButton]}><Text style={styles.activeRepeatText}>Günlük</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.repeatButton}><Text style={styles.repeatText}>Haftalık</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.repeatButton}><Text style={styles.repeatText}>Aylık</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.repeatButton}><Text style={styles.repeatText}>Yıllık</Text></TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Bu Günlerde</Text>
                        <View style={styles.daysContainer}>
                            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => (
                                <TouchableOpacity key={index} style={[styles.dayButton, index < 5 && { backgroundColor: COLORS.success }]}>
                                    <Text style={styles.dayText}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Hatırlatıcı</Text>
                            <Switch
                                value={reminderEnabled}
                                onValueChange={setReminderEnabled}
                                trackColor={{ false: '#767577', true: COLORS.primary }}
                                thumbColor={reminderEnabled ? '#f4f3f4' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Odak Alışkanlık</Text>
                            <Switch
                                value={focusHabitEnabled}
                                onValueChange={setFocusHabitEnabled}
                                trackColor={{ false: '#767577', true: COLORS.primary }}
                                thumbColor={focusHabitEnabled ? '#f4f3f4' : '#f4f3f4'}
                            />
                        </View>

                        {initialData && (
                            <TouchableOpacity style={styles.deleteButton}>
                                <Text style={styles.deleteButtonText}>Sil</Text>
                            </TouchableOpacity>
                        )}

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        color: COLORS.primary, // Or a specific green from design
        backgroundColor: '#334422', // Darker green bg
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        overflow: 'hidden',
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    emojiContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    emojiPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        backgroundColor: '#2C2C2C',
        borderRadius: 12,
        padding: 16,
        color: COLORS.text,
        marginBottom: 12,
        fontSize: 16,
    },
    colorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
    },
    repeatContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    repeatButton: {
        flex: 1,
        backgroundColor: '#2C2C2C',
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    activeRepeatButton: {
        backgroundColor: COLORS.success,
    },
    repeatText: {
        color: COLORS.textSecondary,
    },
    activeRepeatText: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#2C2C2C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        color: COLORS.text,
        fontSize: 12,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#2C2C2C', // Optional: if it needs a bg
        padding: 0, // Or padding if it has a background
    },
    switchLabel: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#8B4513', // Brown color
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    deleteButtonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
