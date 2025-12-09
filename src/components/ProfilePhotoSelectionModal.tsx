import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { AVATARS } from '../utils/avatarUtils';

interface ProfilePhotoSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    currentPhoto: any; // Can be string uri or require number
    onSelect: (photo: any) => void;
}

export const ProfilePhotoSelectionModal = ({ visible, onClose, currentPhoto, onSelect }: ProfilePhotoSelectionModalProps) => {
    const [selectedAvatar, setSelectedAvatar] = useState<any>(null);

    React.useEffect(() => {
        if (visible) {
            if (!currentPhoto) {
                setSelectedAvatar(null);
            } else if (typeof currentPhoto === 'string' && currentPhoto.startsWith('avatar_')) {
                const index = parseInt(currentPhoto.split('_')[1], 10) - 1;
                if (index >= 0 && index < AVATARS.length) {
                    setSelectedAvatar(AVATARS[index]);
                } else {
                    setSelectedAvatar(null);
                }
            } else {
                setSelectedAvatar(null);
            }
        }
    }, [visible, currentPhoto]);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                // Determine what to save. Since these are local require() numbers, we might need a mapping strategy 
                // if we want to persist across devices perfectly without bundling assets everywhere.
                // However, for this specific request "Skyrim characters", we assume these assets are bundled with the app.
                // We will save the index or an identifier if possible, but simplest is to save the mapping ID.

                // For simplicity in this demo, we'll assume we save an index or local identifier.
                // BUT, since `photoUrl` in firebase is usually a string, let's map these to simple string IDs 'avatar_1', 'avatar_2', etc.

                let avatarId = 'avatar_1';
                const index = AVATARS.indexOf(selectedAvatar);
                if (index !== -1) {
                    avatarId = `avatar_${index + 1}`;
                }

                // Update Firestore
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    photoUrl: avatarId // We will save the ID string
                }, { merge: true });

                onSelect(avatarId); // Pass the ID back, parent will handle display using util
                onClose();
            } catch (error) {
                console.error("Error updating profile photo: ", error);
            }
        }
    };

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
                        <Text style={styles.headerTitle}>Fotoğraf Seç</Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={styles.saveButton}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.gridContainer}>
                        {AVATARS.map((avatar, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.avatarOption,
                                    selectedAvatar === avatar && styles.selectedAvatarOption
                                ]}
                                onPress={() => setSelectedAvatar(avatar)}
                            >
                                <Image source={avatar} style={styles.avatarImage} />
                                {selectedAvatar === avatar && (
                                    <View style={styles.checkIcon}>
                                        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.resetButton} onPress={() => {
                        Alert.alert(
                            "Emin misiniz?",
                            "Profil fotoğrafınızı kaldırmak istediğinize emin misiniz?",
                            [
                                {
                                    text: "Vazgeç",
                                    style: "cancel"
                                },
                                {
                                    text: "Kaldır",
                                    style: "destructive",
                                    onPress: async () => {
                                        const user = auth.currentUser;
                                        if (user) {
                                            const userRef = doc(db, 'users', user.uid);
                                            await setDoc(userRef, { photoUrl: null }, { merge: true });
                                            onSelect(null);
                                            onClose();
                                        }
                                    }
                                }
                            ]
                        );
                    }}>
                        <Text style={styles.resetButtonText}>Fotoğrafı Kaldır</Text>
                    </TouchableOpacity>
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
        height: '80%',
        padding: 20,
        paddingBottom: 40, // Ensure space for bottom button if needed
    },
    // ... existing styles ...
    resetButton: {
        marginTop: 10,
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    resetButtonText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
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
        backgroundColor: COLORS.success,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        overflow: 'hidden',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    avatarOption: {
        width: '48%',
        aspectRatio: 1,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedAvatarOption: {
        borderColor: COLORS.success,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    checkIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
    },
});
