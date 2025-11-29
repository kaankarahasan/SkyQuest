import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { MainScreen } from '../screens/MainScreen';

const Drawer = createDrawerNavigator();

export const MainDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#2C2C2C',
                    width: '80%',
                },
                overlayColor: 'rgba(0,0,0,0.7)',
            }}
        >
            <Drawer.Screen name="MainScreen" component={MainScreen} />
        </Drawer.Navigator>
    );
};
