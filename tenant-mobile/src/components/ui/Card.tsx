import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'gradient';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: ViewStyle;
  gradientColors?: string[];
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  gradientColors = ['#3B82F6', '#2563EB'],
  onPress,
  ...rest
}) => {
  const { theme } = useTheme();

  // Safety check
  if (!theme || !theme.colors) {
    return null;
  }

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface || theme.colors.card || '#FFFFFF',
          ...(theme.shadows?.md || {}),
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.surface || theme.colors.card || '#FFFFFF',
          borderWidth: 1,
          borderColor: theme.colors.border || '#E2E8F0',
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.primaryMuted || '#DBEAFE',
        };
      case 'gradient':
        return {
          overflow: 'hidden',
        };
      default:
        return {};
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.spacing?.sm || 8;
      case 'lg':
        return theme.spacing?.lg || 24;
      case 'md':
      default:
        return theme.spacing?.md || 16;
    }
  };

  const cardContent = (
    <View
      style={[
        {
          borderRadius: theme.radius?.md || 12,
          overflow: 'hidden',
          padding: getPadding(),
        },
        getVariantStyle(),
        style,
      ]}
    >
      {variant === 'gradient' ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={{ position: 'relative', zIndex: 1 }}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} {...rest}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
