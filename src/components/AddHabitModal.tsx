import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EmojiPicker from 'rn-emoji-keyboard';
import { auth, db } from '../../firebaseConfig';
import { HABIT_CATEGORIES } from '../constants/categories'; // Import categories
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

interface AddHabitModalProps {
    visible: boolean;
    onClose: () => void;
    initialData?: any; // For edit mode
    onDelete?: () => void;
}

export const AddHabitModal = ({ visible, onClose, initialData, onDelete }: AddHabitModalProps) => {
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
    const [categoryModalVisible, setCategoryModalVisible] = useState(false); // State for category modal

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
            setCategory(initialData.category || '');
            setRepeatType(initialData.repeatType || 'Daily');
            setSelectedDays(initialData.selectedDays || []);
            setReminderEnabled(initialData.reminderEnabled || false);
            setFocusHabitEnabled(initialData.focusHabitEnabled || false);
            setSelectedEmoji(initialData.icon || '🤩');
        } else {
            // Reset fields
            setHabitName('');
            setDescription('');
            setSelectedColor(null);
            setCategory('');
            setRepeatType('Daily');
            setSelectedDays([]);
            setReminderEnabled(false);
            setFocusHabitEnabled(false);
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
            };

            if (initialData && initialData.id) {
                // Update existing habit
                const habitRef = doc(db, 'habits', initialData.id);
                await updateDoc(habitRef, habitData);
            } else {
                // Create new habit
                await addDoc(collection(db, 'habits'), {
                    ...habitData,
                    createdAt: new Date(),
                    streak: 0,
                    completedDates: [],
                });
            }

            onClose();
            // Reset form if not editing (or maybe always reset?)
            if (!initialData) {
                setHabitName('');
                setDescription('');
                setCategory('');
                setSelectedEmoji('🤩');
                setSelectedDays([]);
                setRepeatType('Daily');
            }
        } catch (error) {
            console.error("Error saving habit: ", error);
            Alert.alert('Hata', 'Alışkanlık kaydedilirken bir sorun oluştu.');
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

                        <TouchableOpacity
                            style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                            onPress={() => setCategoryModalVisible(true)}
                        >
                            <Text style={category ? styles.inputText : styles.placeholderText}>
                                {category || "Kategori Seç"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>



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



                        {initialData && onDelete && (
                            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
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

            {/* Category Picker Modal */}
            <Modal
                visible={categoryModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCategoryModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Kategori Seç</Text>
                            <View style={{ width: 24 }} />
                        </View>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            {HABIT_CATEGORIES.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.categoryOption}
                                    onPress={() => {
                                        setCategory(item.label);
                                        setCategoryModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.categoryOptionText}>{item.label}</Text>
                                    {category === item.label && (
                                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.resetButtonContainer}
                            onPress={() => {
                                setCategory('');
                                setCategoryModalVisible(false);
                            }}
                        >
                            <Text style={styles.resetButtonText}>Seçimi Sıfırla</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        fontFamily: FONTS.bold,
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
        fontFamily: FONTS.bold,
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
    modalTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: FONTS.bold,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        fontFamily: FONTS.bold,
    },
    input: {
        backgroundColor: '#2C2C2C',
        borderRadius: 12,
        padding: 16,
        color: COLORS.text,
        marginBottom: 12,
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    repeatOptions: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    repeatOption: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#333',
        marginRight: 8,
    },
    repeatOptionActive: {
        backgroundColor: COLORS.primary,
    },
    repeatOptionText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    repeatOptionTextActive: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
    },
    colorOptions: {
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#444',
    },
    // The saveButton style is already defined above, so this one is redundant if it's meant to be a new style.
    // Assuming the instruction meant to add these new styles and modify existing ones.
    // If this 'saveButton' here is meant to be a *different* save button style, it would need a different name.
    // For now, I'll keep the existing saveButton and add this one as a new, unused style.
    // If the intent was to *replace* the existing saveButton, the instruction should have been clearer.
    // Given the instruction format, I'm adding new styles and modifying existing ones.
    // This new 'saveButton' style is conflicting, so I'll rename it to 'newSaveButton' to avoid conflict.
    // However, the instruction explicitly says `saveButton: { ... }` so I will assume it's a new style
    // and the previous `saveButton` was meant to be modified.
    // Re-reading the instruction: "apply to Text/Input styles" and then a block of styles.
    // The block contains `saveButton` again. This is ambiguous.
    // I will assume the `saveButton` in the block is meant to *replace* or *augment* the existing one.
    // The existing `saveButton` has `backgroundColor: COLORS.success`. The new one has `backgroundColor: COLORS.primary`.
    // I will apply the `fontFamily` to the existing `saveButton` and add the other new styles.
    // The instruction's `saveButton` block seems to be a general style definition, not necessarily for the header save button.
    // I will add the `fontFamily` to the existing `saveButton` and add the other new styles as provided.
    // The instruction's `saveButton` block also has `color: COLORS.white` which is already present.
    // The instruction's `saveButton` block has `fontWeight: 'bold'` which is already present.
    // The instruction's `saveButton` block has `fontSize: 16` which is already present.
    // The only new thing in the instruction's `saveButton` block that could apply to the existing one is `backgroundColor: COLORS.primary`
    // and `fontFamily: FONTS.bold`.
    // I will apply `fontFamily: FONTS.bold` to the existing `saveButton` and keep its `backgroundColor: COLORS.success`.
    // The instruction's `saveButton` block also has `flex: 1`, `padding: 14`, `borderRadius: 8`, `alignItems: 'center'`, `marginHorizontal: 4`.
    // These are clearly for a different button layout.
    // So, I will add the new styles as separate entries, and only apply `fontFamily` to the existing ones.
    // The instruction's `saveButton` block is part of `buttonContainer` context.
    // I will add `buttonContainer`, `button`, `cancelButton`, `saveButton` (as a new style for a different button), `buttonText`.
    // This means the `saveButton` in the instruction is a *new* style, not a modification of the existing one.
    // I will name it `modalSaveButton` to avoid conflict.

    modalSaveButton: { // Renamed to avoid conflict with existing saveButton
        backgroundColor: COLORS.primary,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    emojiPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
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
        fontFamily: FONTS.bold,
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
        fontFamily: FONTS.regular,
    },
    activeRepeatText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
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
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
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
    inputText: {
        color: COLORS.text,
        fontSize: 16,
    },
    placeholderText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    categoryOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    categoryOptionText: {
        color: COLORS.text,
        fontSize: 16,
    },
    resetButtonContainer: {
        marginTop: 10,
        paddingVertical: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    resetButtonText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
