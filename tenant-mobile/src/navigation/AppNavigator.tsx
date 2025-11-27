import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, Text } from 'react-native';
import { HomeNavigator } from './HomeNavigator';
import { MessagesScreen } from '../screens/MessagesScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { MaintenanceNavigator } from './MaintenanceNavigator';
import { DocumentsNavigator } from './DocumentsNavigator';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../contexts/ThemeContext';
import { colors, shadows, spacing, radius } from '../theme/tokens';

const Tab = createBottomTabNavigator();

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

export const AppNavigator = () => {
  const { theme, isDark } = useTheme();

  // Safety check for theme.colors
  if (!theme || !theme.colors) {
    return null;
  }

  const getTabBarIcon = (routeName: string) => {
    return ({ color, size, focused }: TabBarIconProps) => {
      let iconName: string = 'home';

      switch (routeName) {
        case 'Home':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'Messages':
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          break;
        case 'Payments':
          iconName = focused ? 'card' : 'card-outline';
          break;
        case 'Maintenance':
          iconName = focused ? 'build' : 'build-outline';
          break;
        case 'Documents':
          iconName = focused ? 'document-text' : 'document-text-outline';
          break;
        case 'Profile':
          iconName = focused ? 'person' : 'person-outline';
          break;
      }

      return (
        <View style={focused ? styles.iconContainer : styles.iconContainerInactive}>
          <Ionicons
            name={iconName as any}
            size={focused ? 24 : 22}
            color={focused ? colors.primary : color}
          />
        </View>
      );
    };
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors?.primary || colors.primary,
        tabBarInactiveTintColor: theme.colors?.muted || colors.muted,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios'
            ? 'rgba(255, 255, 255, 0.95)'
            : theme.colors?.surface || '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          height: Platform.OS === 'ios' ? 90 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: Platform.OS === 'ios' ? 8 : 8,
          position: 'absolute',
          ...(Platform.OS === 'android' ? shadows.lg : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }),
          elevation: Platform.OS === 'android' ? 8 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: Platform.OS === 'ios' ? 0 : 2,
          letterSpacing: 0.2,
        },
        tabBarIcon: getTabBarIcon(route.name),
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          title: 'Home',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <Tab.Screen
        name="Maintenance"
        component={MaintenanceNavigator}
        options={{
          title: 'Maintenance',
          tabBarLabel: 'Maintenance',
          tabBarBadge: 2,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            fontSize: 9,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 2,
            borderColor: Platform.OS === 'ios'
              ? 'rgba(255, 255, 255, 0.95)'
              : theme.colors?.surface || '#FFFFFF',
          },
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsNavigator}
        options={{ title: 'Documents' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.xs + 2,
    marginBottom: 2,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerInactive: {
    marginBottom: 2,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
