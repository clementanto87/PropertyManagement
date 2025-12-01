import React, { useState } from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { colors, spacing, radius } from '../../theme/tokens';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    rightIcon,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.focused,
                    error && styles.error,
                ]}
            >
                {icon && <View style={styles.icon}>{icon}</View>}
                <TextInput
                    style={[styles.input, icon && styles.inputWithIcon, style]}
                    placeholderTextColor={colors.muted}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
    },
    focused: {
        borderColor: colors.primary,
    },
    error: {
        borderColor: '#EF4444',
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: 16,
        color: colors.ink,
    },
    inputWithIcon: {
        paddingLeft: spacing.sm,
    },
    icon: {
        marginRight: spacing.xs,
    },
    rightIcon: {
        marginLeft: spacing.xs,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: spacing.xs,
        marginLeft: spacing.sm,
    },
});
