import 'react-native-gesture-handler/jestSetup';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const { View } = require('react-native');
    return {
        Ionicons: View,
        MaterialIcons: View,
        FontAwesome: View,
        // Add other icon sets as needed
    };
});
