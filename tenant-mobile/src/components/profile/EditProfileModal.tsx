import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { Button } from '../ui/Button';
import { useUpdateProfile } from '../../hooks/useApi';
import { TenantProfile } from '../../types/api';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    profile: TenantProfile;
}

export const EditProfileModal = ({ visible, onClose, profile }: EditProfileModalProps) => {
    const [firstName, setFirstName] = useState(profile.firstName);
    const [lastName, setLastName] = useState(profile.lastName);
    const [phone, setPhone] = useState(profile.phone);
    const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact || '');
    const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyPhone || '');

    const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

    useEffect(() => {
        if (visible) {
            setFirstName(profile.firstName);
            setLastName(profile.lastName);
            setPhone(profile.phone);
            setEmergencyContact(profile.emergencyContact || '');
            setEmergencyPhone(profile.emergencyPhone || '');
        }
    }, [visible, profile]);

    const handleSave = async () => {
        if (!firstName || !lastName || !phone) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        try {
            await updateProfile({
                firstName,
                lastName,
                phone,
                emergencyContact,
                emergencyPhone,
            });
            Alert.alert('Success', 'Profile updated successfully.');
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Profile</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.ink} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>First Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Enter first name"
                                placeholderTextColor={colors.muted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Enter last name"
                                placeholderTextColor={colors.muted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter phone number"
                                placeholderTextColor={colors.muted}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Emergency Contact</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact Name</Text>
                            <TextInput
                                style={styles.input}
                                value={emergencyContact}
                                onChangeText={setEmergencyContact}
                                placeholder="Enter contact name"
                                placeholderTextColor={colors.muted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={emergencyPhone}
                                onChangeText={setEmergencyPhone}
                                placeholder="Enter contact phone"
                                placeholderTextColor={colors.muted}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={onClose}
                            style={styles.cancelButton}
                        />
                        <Button
                            title="Save Changes"
                            onPress={handleSave}
                            loading={isPending}
                            style={styles.saveButton}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        height: '90%',
        ...shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.ink,
    },
    closeButton: {
        padding: spacing.xs,
    },
    form: {
        flex: 1,
        padding: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 16,
        color: colors.ink,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.ink,
        marginBottom: spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});
