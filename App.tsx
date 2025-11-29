import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthNavigator } from './src/navigation/AuthNavigator';

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar style="light" />
                <AuthNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
