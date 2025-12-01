import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Text, H1, H2, H3, Body1, Caption } from '../components/ui/Typography';
import { colors, spacing, radius, shadows } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../hooks/useApi';

const { width, height } = Dimensions.get('window');

interface PropertyDetailsScreenProps {
    navigation: any;
}

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({ navigation }) => {
    const { data: dashboardData } = useDashboard();
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const property = dashboardData?.tenant?.unit?.property;
    const unit = dashboardData?.tenant?.unit;
    const lease = dashboardData?.tenant?.lease;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            {/* Animated Header */}
            <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
                <LinearGradient
                    colors={['#667EEA', '#764BA2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                />
            </Animated.View>

            {/* Fixed Header Content */}
            <View style={styles.headerContent}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <LinearGradient
                        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                        style={styles.backButtonGradient}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>
                <Animated.View style={{ opacity: headerOpacity }}>
                    <H3 style={styles.headerTitle}>Property Details</H3>
                </Animated.View>
                <View style={styles.headerSpacer} />
            </View>

            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Hero Image with Gradient Overlay */}
                <View style={styles.heroContainer}>
                    <LinearGradient
                        colors={['#667EEA', '#764BA2', '#F093FB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroIconContainer}>
                            <Ionicons name="business" size={80} color="rgba(255,255,255,0.9)" />
                        </View>
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.3)']}
                            style={styles.heroOverlay}
                        />
                    </LinearGradient>
                </View>

                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Property Name Card with Gradient */}
                    <Card variant="elevated" style={styles.propertyNameCard}>
                        <LinearGradient
                            colors={['#FFFFFF', '#F8FAFC']}
                            style={styles.propertyNameGradient}
                        >
                            <H2 style={styles.propertyName}>{property?.name || 'Modern Luxury Apartment'}</H2>
                            <View style={styles.addressRow}>
                                <View style={styles.locationIconWrapper}>
                                    <LinearGradient
                                        colors={['#667EEA', '#764BA2']}
                                        style={styles.locationIcon}
                                    >
                                        <Ionicons name="location" size={18} color="#FFFFFF" />
                                    </LinearGradient>
                                </View>
                                <Body1 style={styles.address}>
                                    {property?.address || '123 Main Street'}, {property?.city || 'San Francisco'}, {property?.state || 'CA'} {property?.zipCode || '94102'}
                                </Body1>
                            </View>
                        </LinearGradient>
                    </Card>

                    {/* Unit Details with Beautiful Cards */}
                    <View style={styles.sectionHeader}>
                        <H3 style={styles.sectionTitle}>Your Unit</H3>
                        <View style={styles.titleUnderline} />
                    </View>
                    <View style={styles.detailsGrid}>
                        {[
                            { icon: 'home', label: 'Unit', value: unit?.unitNumber || '4B', gradient: ['#667EEA', '#764BA2'] },
                            { icon: 'bed', label: 'Bedrooms', value: unit?.bedrooms || 2, gradient: ['#F093FB', '#F5576C'] },
                            { icon: 'water', label: 'Bathrooms', value: unit?.bathrooms || 1, gradient: ['#4FACFE', '#00F2FE'] },
                            { icon: 'resize', label: 'Sq Ft', value: unit?.squareFeet || 850, gradient: ['#43E97B', '#38F9D7'] },
                        ].map((item, index) => (
                            <Card key={index} variant="elevated" style={styles.detailCard}>
                                <LinearGradient
                                    colors={item.gradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.detailIconGradient}
                                >
                                    <Ionicons name={item.icon as any} size={28} color="#FFFFFF" />
                                </LinearGradient>
                                <Caption style={styles.detailLabel}>{item.label}</Caption>
                                <H3 style={styles.detailValue}>{item.value}</H3>
                            </Card>
                        ))}
                    </View>

                    {/* Lease Information with Timeline Design */}
                    <View style={styles.sectionHeader}>
                        <H3 style={styles.sectionTitle}>Lease Information</H3>
                        <View style={styles.titleUnderline} />
                    </View>
                    <Card variant="elevated" style={styles.leaseCard}>
                        <LinearGradient
                            colors={['#FFFFFF', '#F8FAFC']}
                            style={styles.leaseGradient}
                        >
                            {[
                                { icon: 'calendar', label: 'Lease Start', value: lease?.startDate ? new Date(lease.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jun 1, 2024', color: '#667EEA' },
                                { icon: 'calendar-outline', label: 'Lease End', value: lease?.endDate ? new Date(lease.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jun 1, 2026', color: '#764BA2' },
                                { icon: 'cash', label: 'Monthly Rent', value: `$${lease?.monthlyRent?.toLocaleString() || '3,000'}`, color: '#43E97B' },
                                { icon: 'shield-checkmark', label: 'Security Deposit', value: `$${lease?.securityDeposit?.toLocaleString() || '3,000'}`, color: '#4FACFE' },
                            ].map((item, index) => (
                                <View key={index} style={styles.leaseRow}>
                                    <View style={[styles.leaseIconWrapper, { backgroundColor: `${item.color}15` }]}>
                                        <Ionicons name={item.icon as any} size={24} color={item.color} />
                                    </View>
                                    <View style={styles.leaseContent}>
                                        <Caption style={styles.leaseLabel}>{item.label}</Caption>
                                        <Body1 style={styles.leaseValue}>{item.value}</Body1>
                                    </View>
                                    {index < 3 && <View style={styles.leaseDivider} />}
                                </View>
                            ))}
                        </LinearGradient>
                    </Card>

                    {/* Amenities with Colorful Icons */}
                    <View style={styles.sectionHeader}>
                        <H3 style={styles.sectionTitle}>Amenities</H3>
                        <View style={styles.titleUnderline} />
                    </View>
                    <View style={styles.amenitiesGrid}>
                        {[
                            { icon: 'car', label: 'Parking', gradient: ['#667EEA', '#764BA2'] },
                            { icon: 'wifi', label: 'WiFi', gradient: ['#F093FB', '#F5576C'] },
                            { icon: 'fitness', label: 'Gym', gradient: ['#4FACFE', '#00F2FE'] },
                            { icon: 'water', label: 'Pool', gradient: ['#43E97B', '#38F9D7'] },
                            { icon: 'paw', label: 'Pet Friendly', gradient: ['#FA709A', '#FEE140'] },
                            { icon: 'cube', label: 'Storage', gradient: ['#A8EDEA', '#FED6E3'] },
                        ].map((amenity, index) => (
                            <Card key={index} variant="elevated" style={styles.amenityCard}>
                                <LinearGradient
                                    colors={amenity.gradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.amenityIconGradient}
                                >
                                    <Ionicons name={amenity.icon as any} size={28} color="#FFFFFF" />
                                </LinearGradient>
                                <Caption style={styles.amenityLabel}>{amenity.label}</Caption>
                            </Card>
                        ))}
                    </View>

                    {/* Action Buttons with Gradients */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            onPress={() => console.log('Contact landlord')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#667EEA', '#764BA2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryActionButton}
                            >
                                <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
                                <Text style={styles.primaryActionText}>Contact Landlord</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => console.log('View lease')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.secondaryActionButton}>
                                <LinearGradient
                                    colors={['#667EEA', '#764BA2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.secondaryActionGradient}
                                >
                                    <Ionicons name="document-text" size={20} color="#667EEA" />
                                    <Text style={styles.secondaryActionText}>View Lease Agreement</Text>
                                </LinearGradient>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 100 }} />
                </Animated.View>
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        zIndex: 10,
    },
    headerGradient: {
        flex: 1,
    },
    headerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20,
    },
    backButton: {
        width: 44,
        height: 44,
    },
    backButtonGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    headerSpacer: {
        width: 44,
    },
    scrollView: {
        flex: 1,
    },
    heroContainer: {
        width: '100%',
        height: 300,
    },
    heroGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroIconContainer: {
        zIndex: 2,
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    content: {
        padding: spacing.lg,
        marginTop: -40,
    },
    propertyNameCard: {
        marginBottom: spacing.xl,
        padding: 0,
        overflow: 'hidden',
    },
    propertyNameGradient: {
        padding: spacing.lg,
    },
    propertyName: {
        marginBottom: spacing.sm,
        color: colors.ink,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIconWrapper: {
        marginRight: spacing.sm,
    },
    locationIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    address: {
        flex: 1,
        color: colors.muted,
        lineHeight: 20,
    },
    sectionHeader: {
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    sectionTitle: {
        color: colors.ink,
        marginBottom: spacing.xs,
    },
    titleUnderline: {
        width: 40,
        height: 3,
        backgroundColor: '#667EEA',
        borderRadius: 2,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
        marginBottom: spacing.lg,
    },
    detailCard: {
        width: (width - spacing.lg * 2 - 12) / 2,
        margin: 6,
        padding: spacing.lg,
        alignItems: 'center',
    },
    detailIconGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    detailLabel: {
        color: colors.muted,
        marginBottom: 4,
    },
    detailValue: {
        color: colors.ink,
        fontWeight: '700',
    },
    leaseCard: {
        marginBottom: spacing.xl,
        padding: 0,
        overflow: 'hidden',
    },
    leaseGradient: {
        padding: spacing.lg,
    },
    leaseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    leaseIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    leaseContent: {
        flex: 1,
    },
    leaseLabel: {
        color: colors.muted,
        marginBottom: 4,
    },
    leaseValue: {
        color: colors.ink,
        fontWeight: '600',
        fontSize: 16,
    },
    leaseDivider: {
        position: 'absolute',
        bottom: 0,
        left: 72,
        right: 0,
        height: 1,
        backgroundColor: colors.divider,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
        marginBottom: spacing.lg,
    },
    amenityCard: {
        width: (width - spacing.lg * 2 - 24) / 3,
        margin: 6,
        padding: spacing.md,
        alignItems: 'center',
    },
    amenityIconGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    amenityLabel: {
        color: colors.ink,
        textAlign: 'center',
        fontSize: 11,
    },
    actionsContainer: {
        gap: spacing.md,
        marginTop: spacing.md,
    },
    primaryActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md + 2,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.lg,
        gap: spacing.sm,
        ...shadows.lg,
    },
    primaryActionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryActionButton: {
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    secondaryActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        backgroundColor: '#FFFFFF',
    },
    secondaryActionText: {
        color: '#667EEA',
        fontSize: 16,
        fontWeight: '600',
    },
});
