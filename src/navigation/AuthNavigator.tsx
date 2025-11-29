import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { HabitsListScreen } from '../screens/HabitsListScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { MainDrawerNavigator } from './MainDrawerNavigator';

import { BadgesScreen } from '../screens/BadgesScreen';
import { RulesScreen } from '../screens/RulesScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
            <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="HabitsList" component={HabitsListScreen} />
            <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
            <Stack.Screen name="Badges" component={BadgesScreen} />
            <Stack.Screen name="Rules" component={RulesScreen} />
        </Stack.Navigator>
    );
};
