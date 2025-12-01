import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme/tokens';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (config: ToastConfig) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toast, setToast] = useState<ToastConfig | null>(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-100));

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setToast(null);
        });
    }, [fadeAnim, slideAnim]);

    const showToast = useCallback(
        ({ message, type, duration = 3000 }: ToastConfig) => {
            setToast({ message, type, duration });

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            setTimeout(hideToast, duration);
        },
        [fadeAnim, slideAnim, hideToast]
    );

    const success = useCallback(
        (message: string) => showToast({ message, type: 'success' }),
        [showToast]
    );

    const error = useCallback(
        (message: string) => showToast({ message, type: 'error' }),
        [showToast]
    );

    const warning = useCallback(
        (message: string) => showToast({ message, type: 'warning' }),
        [showToast]
    );

    const info = useCallback(
        (message: string) => showToast({ message, type: 'info' }),
        [showToast]
    );

    const getToastStyle = (type: ToastType) => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: colors.success,
                    icon: 'checkmark-circle' as const,
                };
            case 'error':
                return {
                    backgroundColor: colors.error,
                    icon: 'close-circle' as const,
                };
            case 'warning':
                return {
                    backgroundColor: colors.warning,
                    icon: 'warning' as const,
                };
            case 'info':
                return {
                    backgroundColor: colors.primary,
                    icon: 'information-circle' as const,
                };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            {toast && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.toast,
                            { backgroundColor: getToastStyle(toast.type).backgroundColor },
                        ]}
                    >
                        <Ionicons
                            name={getToastStyle(toast.type).icon}
                            size={24}
                            color="#FFFFFF"
                            style={styles.icon}
                        />
                        <Text style={styles.message} numberOfLines={2}>
                            {toast.message}
                        </Text>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: spacing.lg,
        right: spacing.lg,
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        ...shadows.lg,
        minHeight: 56,
    },
    icon: {
        marginRight: spacing.md,
    },
    message: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 20,
    },
});
