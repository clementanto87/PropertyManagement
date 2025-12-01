import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/Button';
import { colors, spacing, radius } from '../../theme/tokens';
import { useAuth } from '../../contexts/AuthContext';

interface OTPScreenProps {
    route: any;
    navigation: any;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({ route, navigation }) => {
    const { email } = route.params;
    const { login, sendOTP } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) return; // Prevent multiple characters

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter the complete OTP');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await login(email, otpCode);
            // Navigation will be handled by the root navigator based on auth state
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            await sendOTP(email);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <LinearGradient
            colors={['#3B82F6', '#2563EB', '#1E40AF']}
            style={styles.gradient}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconText}>📧</Text>
                        </View>
                        <Text style={styles.title}>Verify Your Email</Text>
                        <Text style={styles.subtitle}>
                            We've sent a 6-digit code to{'\n'}
                            <Text style={styles.email}>{email}</Text>
                        </Text>
                    </View>

                    {/* OTP Input */}
                    <View style={styles.formContainer}>
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    style={[
                                        styles.otpInput,
                                        digit && styles.otpInputFilled,
                                        error && styles.otpInputError,
                                    ]}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Button
                            title="Verify & Continue"
                            onPress={handleVerify}
                            loading={loading}
                            style={styles.button}
                        />

                        <TouchableOpacity
                            onPress={handleResend}
                            disabled={resending}
                            style={styles.resendButton}
                        >
                            <Text style={styles.resendText}>
                                {resending ? 'Sending...' : "Didn't receive the code? Resend"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backText}>← Change Email</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl * 2,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    iconText: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 24,
    },
    email: {
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: radius.lg,
        padding: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    otpInput: {
        width: 48,
        height: 56,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: colors.ink,
    },
    otpInputFilled: {
        borderColor: colors.primary,
    },
    otpInputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    button: {
        marginTop: spacing.md,
    },
    resendButton: {
        marginTop: spacing.lg,
        padding: spacing.sm,
    },
    resendText: {
        fontSize: 14,
        color: colors.primary,
        textAlign: 'center',
        fontWeight: '600',
    },
    backButton: {
        marginTop: spacing.xl,
        padding: spacing.md,
    },
    backText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '600',
    },
});
