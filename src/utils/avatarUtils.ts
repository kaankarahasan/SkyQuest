
export const AVATARS = [
    require('../assets/avatars/avatar_1.png'),
    require('../assets/avatars/avatar_2.png'),
    require('../assets/avatars/avatar_3.png'),
    require('../assets/avatars/avatar_4.png'),
    require('../assets/avatars/avatar_5.png'),
    require('../assets/avatars/avatar_6.png'),
    require('../assets/avatars/avatar_7.png'),
    require('../assets/avatars/avatar_8.png'),
    require('../assets/avatars/avatar_9.png'),
    require('../assets/avatars/avatar_10.png'),
];

export const getAvatarSource = (photoUrl: string | null | undefined) => {
    if (!photoUrl) {
        return { uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' };
    }

    if (photoUrl.startsWith('avatar_')) {
        const index = parseInt(photoUrl.split('_')[1], 10) - 1;
        if (index >= 0 && index < AVATARS.length) {
            return AVATARS[index];
        }
    }

    // Fallback if it's a URL (backward compatibility or future proofing)
    if (photoUrl.startsWith('http')) {
        return { uri: photoUrl };
    }

    return { uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' };
};
