import { Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { PixelifySans_400Regular, PixelifySans_700Bold, useFonts } from '@expo-google-fonts/pixelify-sans';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthNavigator } from './src/navigation/AuthNavigator';

export default function App() {
    const [fontsLoaded] = useFonts({
        'PixelifySans-Regular': PixelifySans_400Regular,
        'PixelifySans-Bold': PixelifySans_700Bold,
        'Oswald-Regular': Oswald_400Regular,
        'Oswald-Bold': Oswald_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar style="light" />
                <AuthNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
