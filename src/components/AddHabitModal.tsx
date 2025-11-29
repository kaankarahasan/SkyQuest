import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EmojiPicker from 'rn-emoji-keyboard';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';

interface AddHabitModalProps {
    visible: boolean;
    onClose: () => void;
    initialData?: any; // For edit mode
}

export const AddHabitModal = ({ visible, onClose, initialData }: AddHabitModalProps) => {
    const [habitName, setHabitName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [focusHabitEnabled, setFocusHabitEnabled] = useState(false);
    const [repeatType, setRepeatType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
    const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0=Mon, 6=Sun
    const [category, setCategory] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🤩');
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

    const isFormValid = habitName.trim().length > 0 && category.trim().length > 0 && selectedDays.length > 0;

    const toggleDay = (index: number) => {
        if (selectedDays.includes(index)) {
            setSelectedDays(selectedDays.filter(d => d !== index));
        } else {
            setSelectedDays([...selectedDays, index]);
        }
    };

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
            setSelectedColor(null);
            setSelectedEmoji('🤩');
        }
    }, [initialData, visible]);

    // Effect to set default color when Focus Habit is enabled
    React.useEffect(() => {
        if (focusHabitEnabled && !selectedColor) {
            setSelectedColor(colors[0]);
        } else if (!focusHabitEnabled) {
            setSelectedColor(null);
        }
    }, [focusHabitEnabled]);

    const handleSave = async () => {
        if (!isFormValid) return;

        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
            return;
        }

        try {
            const habitData = {
                userId: user.uid,
                title: habitName,
                icon: selectedEmoji,
                description,
                category,
                color: selectedColor,
                repeatType,
                selectedDays,
                reminderEnabled,
                focusHabitEnabled,
                createdAt: new Date(),
                streak: 0,
                completedDates: [], // Array of timestamps or date strings
            };

            await addDoc(collection(db, 'habits'), habitData);



            // Alert.alert('Başarılı', 'Alışkanlık eklendi!'); // Removed for seamless close
            onClose();
            // Reset form
            setHabitName('');
            setDescription('');
            setCategory('');
            setSelectedEmoji('🤩');
            setSelectedDays([]);
            setRepeatType('Daily');
        } catch (error) {
            console.error("Error adding habit: ", error);
            Alert.alert('Hata', 'Alışkanlık eklenirken bir sorun oluştu.');
        }
    };

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
                        <TouchableOpacity onPress={handleSave} disabled={!isFormValid}>
                            <Text style={[styles.saveButton, !isFormValid && styles.disabledSaveButton]}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.emojiContainer}>
                            <TouchableOpacity onPress={() => setEmojiPickerVisible(true)}>
                                <View style={styles.emojiPlaceholder}>
                                    <Text style={{ fontSize: 40 }}>{selectedEmoji}</Text>
                                </View>
                            </TouchableOpacity>
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

                        <TextInput
                            style={styles.input}
                            placeholder="Kategori Ekle"
                            placeholderTextColor={COLORS.textSecondary}
                            value={category}
                            onChangeText={setCategory}
                        />



                        <Text style={styles.sectionTitle}>Tekrar</Text>
                        <View style={styles.repeatContainer}>
                            {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.repeatButton, repeatType === type && styles.activeRepeatButton]}
                                    onPress={() => setRepeatType(type as any)}
                                >
                                    <Text style={repeatType === type ? styles.activeRepeatText : styles.repeatText}>
                                        {type === 'Daily' ? 'Günlük' : type === 'Weekly' ? 'Haftalık' : type === 'Monthly' ? 'Aylık' : 'Yıllık'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Bu Günlerde</Text>
                        <View style={styles.daysContainer}>
                            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.dayButton, selectedDays.includes(index) && { backgroundColor: COLORS.success }]}
                                    onPress={() => toggleDay(index)}
                                >
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

                        {focusHabitEnabled && (
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
                                <TouchableOpacity
                                    style={[styles.colorCircle, { backgroundColor: COLORS.error }]}
                                    onPress={() => setSelectedColor(COLORS.error)}
                                >
                                    {selectedColor === COLORS.error && (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}



                        {initialData && (
                            <TouchableOpacity style={styles.deleteButton}>
                                <Text style={styles.deleteButtonText}>Sil</Text>
                            </TouchableOpacity>
                        )}

                    </ScrollView>
                </View>
            </View>

            <EmojiPicker
                onEmojiSelected={(emojiObject: any) => {
                    setSelectedEmoji(emojiObject.emoji);
                    setEmojiPickerVisible(false);
                }}
                open={emojiPickerVisible}
                onClose={() => setEmojiPickerVisible(false)}
                theme={{
                    container: '#1E1E1E',
                    header: '#1E1E1E',
                    knob: '#333',
                    search: {
                        background: '#333',
                        text: COLORS.text,
                        placeholder: COLORS.textSecondary,
                        icon: COLORS.textSecondary,
                    },
                    category: {
                        icon: COLORS.textSecondary,
                        iconActive: COLORS.primary,
                        container: '#1E1E1E',
                        containerActive: '#333',
                    },
                }}
                styles={{
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    },
                    header: {
                        color: COLORS.text,
                    },
                }}
                categoryPosition="top"
                expandedHeight={500}
                defaultHeight={500}
            />
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
        color: '#FFFFFF',
        backgroundColor: COLORS.success, // Use success color for active state
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        overflow: 'hidden',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledSaveButton: {
        backgroundColor: '#555',
        color: '#888',
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
        backgroundColor: '#2C2C2C',
        padding: 16, // Added padding
        borderRadius: 12, // Added rounded corners
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
