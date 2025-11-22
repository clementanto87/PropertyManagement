import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme/tokens';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'gradient';
    style?: ViewStyle;
    gradientColors?: string[];
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    style,
    gradientColors = ['#3B82F6', '#2563EB'],
}) => {
    if (variant === 'gradient') {
        return (
            <View style={[styles.container, style]}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {children}
                </LinearGradient>
            </View>
        );
    }

    return <View style={[styles.container, styles.default, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    container: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    default: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
    },
    gradient: {
        padding: spacing.lg,
    },
});
