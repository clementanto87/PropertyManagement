import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  // Safety check
  if (!theme || !theme.colors) {
    return null;
  }

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius?.md || 12,
      paddingVertical: theme.spacing?.sm || 8,
      paddingHorizontal: theme.spacing?.md || 16,
      opacity: isDisabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary || '#3B82F6',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primaryLight || '#60A5FA',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary || '#3B82F6',
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.error || '#EF4444',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: 16,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'outline':
      case 'ghost':
        return {
          ...baseStyle,
          color: theme.colors.primary || '#3B82F6',
        };
      default:
        return {
          ...baseStyle,
          color: theme.colors.ink || '#0F172A',
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[getButtonStyle(), getSizeStyle(), style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} style={{ marginRight: 8 }} />
      ) : leftIcon ? (
        <View style={{ marginRight: 8 }}>{leftIcon}</View>
      ) : null}
      
      <Text
        style={[
          getTextStyle(),
          {
            marginLeft: rightIcon ? 8 : 0,
            marginRight: leftIcon ? 8 : 0,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
      
      {rightIcon && !loading && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};
