import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { HomeScreen } from '../screens/HomeScreen';
import { PropertyDetailsScreen } from '../screens/PropertyDetailsScreen';

const Stack = createStackNavigator();

export const HomeNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
        </Stack.Navigator>
    );
};
