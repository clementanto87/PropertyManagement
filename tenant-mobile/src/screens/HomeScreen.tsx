import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Text, H1, H2, H3, Body1, Caption } from '../components/ui/Typography';
import { RefreshControl } from '../components/ui/RefreshControl';
import { useToast } from '../components/ui/Toast';
import { useTheme } from '../contexts/ThemeContext';
import { useDashboard } from '../hooks/useApi';
import { colors, spacing, radius, shadows } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { ActivityTimeline } from '../components/ActivityTimeline';
// Haptics is optional - only use if available
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

const { width } = Dimensions.get('window');

// Helper function to get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

// Helper function to get greeting emoji
const getGreetingEmoji = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '☀️';
  if (hour < 17) return '🌤️';
  if (hour < 21) return '🌆';
  return '🌙';
};

// Helper function to get gradient colors based on time
const getTimeBasedGradient = () => {
  const hour = new Date().getHours();
  if (hour < 12) return ['#FF6B6B', '#FF8E53', '#FFA94D']; // Morning - warm sunrise
  if (hour < 17) return ['#4FACFE', '#00F2FE', '#43E97B']; // Afternoon - bright blue
  if (hour < 21) return ['#FA709A', '#FEE140', '#FF6B6B']; // Evening - sunset
  return ['#2E3192', '#1BFFFF', '#7F00FF']; // Night - deep purple
};

// Helper function to get user initials
const getUserInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const { data: dashboardData, isLoading, error, refetch, isRefetching } = useDashboard();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [greeting, setGreeting] = useState(getGreeting());
  const [greetingEmoji, setGreetingEmoji] = useState(getGreetingEmoji());

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
      setGreetingEmoji(getGreetingEmoji());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Safety check
  if (!theme || !theme.colors) {
    return null;
  }

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load dashboard data');
    }
  }, [error]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const handlePress = () => {
    if (Platform.OS === 'ios' && Haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }
  };

  // Get user data
  const userName = dashboardData?.tenant?.firstName && dashboardData?.tenant?.lastName
    ? `${dashboardData.tenant.firstName} ${dashboardData.tenant.lastName}`
    : 'Tenant';
  const userInitials = getUserInitials(userName);
  const timeBasedGradient = getTimeBasedGradient();
  const propertyName = dashboardData?.tenant?.unit?.property?.name || "Here's what's happening with your property";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background || '#F8FAFC' }]}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ scale: headerScale }],
          },
        ]}
      >
        <LinearGradient
          colors={timeBasedGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.greetingRow}>
                <Text style={styles.greetingEmoji}>{greetingEmoji}</Text>
                <Text style={styles.greeting}>{greeting}</Text>
              </View>
              <H1 style={styles.welcomeTitle}>{userName}!</H1>
            </View>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userInitials}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Body1 style={styles.subtitle}>
            {propertyName}
          </Body1>
        </LinearGradient>
      </Animated.View>

      {isLoading && !dashboardData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        >
          {/* Quick Stats */}
          <Animated.View
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Card variant="elevated" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="home" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {dashboardData?.tenant?.unit?.unitNumber || '4B'}
              </Text>
              <Text style={styles.statLabel}>Your Unit</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <Text style={styles.statValue}>
                {dashboardData?.stats?.onTimePayments
                  ? `${Math.round((dashboardData.stats.onTimePayments / dashboardData.stats.totalPayments) * 100)}%`
                  : '100%'}
              </Text>
              <Text style={styles.statLabel}>On Time</Text>
            </Card>

            <Card variant="elevated" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="time" size={24} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>
                {dashboardData?.stats?.activeRequests || 0}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </Card>
          </Animated.View>

          {/* Property Overview Card - Enhanced */}
          <Animated.View
            style={[
              styles.propertyCardContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Card variant="elevated" style={styles.propertyCard}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.propertyCardGradient}
              >
                <View style={styles.propertyHeader}>
                  <View style={styles.propertyIconWrapper}>
                    <LinearGradient
                      colors={['#3B82F6', '#2563EB']}
                      style={styles.propertyIcon}
                    >
                      <Ionicons name="business" size={28} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.propertyInfo}>
                    <H3 style={styles.propertyTitle}>
                      {dashboardData?.tenant?.unit?.property?.name || '123 Main Street'}
                    </H3>
                    <Body1 style={styles.propertySubtitle}>
                      Unit {dashboardData?.tenant?.unit?.unitNumber || '4B'}
                    </Body1>
                  </View>
                  <TouchableOpacity
                    style={styles.propertyMoreButton}
                    onPress={() => {
                      handlePress();
                      console.log('More options');
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.propertyDivider} />

                <View style={styles.propertyDetails}>
                  <View style={styles.propertyDetailItem}>
                    <View style={styles.propertyDetailIcon}>
                      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.propertyDetailLabel}>Lease Until</Text>
                      <Text style={styles.propertyDetailValue}>
                        {dashboardData?.tenant?.lease?.endDate
                          ? new Date(dashboardData.tenant.lease.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'Jun 2026'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.propertyDetailItem}>
                    <View style={styles.propertyDetailIcon}>
                      <Ionicons name="bed-outline" size={18} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.propertyDetailLabel}>Unit Size</Text>
                      <Text style={styles.propertyDetailValue}>
                        {dashboardData?.tenant?.unit?.bedrooms || 2} Bed, {dashboardData?.tenant?.unit?.bathrooms || 1} Bath
                      </Text>
                    </View>
                  </View>
                </View>

                <Button
                  title="View Details"
                  variant="outline"
                  onPress={() => {
                    handlePress();
                    navigation.navigate('PropertyDetails');
                  }}
                  style={styles.propertyButton}
                />
              </LinearGradient>
            </Card>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            style={[
              styles.quickActionsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {/* Pay Rent - Highlighted if payment is due soon */}
              <Card
                variant="elevated"
                style={{
                  ...styles.quickActionCard,
                  ...(dashboardData?.nextPayment?.status === 'PENDING' ? styles.quickActionHighlighted : {})
                }}
                onPress={() => {
                  handlePress();
                  console.log('Pay rent');
                }}
              >
                <LinearGradient
                  colors={
                    dashboardData?.nextPayment?.status === 'PENDING'
                      ? ['#EF4444', '#DC2626'] // Red for urgent
                      : (colors.gradientGreen as any)
                  }
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="card" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickActionLabel}>Pay Rent</Text>
                <Text style={styles.quickActionSubtext}>
                  {dashboardData?.nextPayment
                    ? `$${dashboardData.nextPayment.amount}`
                    : 'No payment due'}
                </Text>
                {dashboardData?.nextPayment?.status === 'PENDING' && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>Due Soon</Text>
                  </View>
                )}
              </Card>

              {/* Maintenance - Shows active request count */}
              <Card
                variant="elevated"
                style={{
                  ...styles.quickActionCard,
                  ...((dashboardData?.stats?.activeRequests || 0) > 0 ? styles.quickActionActive : {})
                }}
                onPress={() => {
                  handlePress();
                  console.log('Request maintenance');
                }}
              >
                <LinearGradient
                  colors={colors.gradientOrange as any}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="build" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickActionLabel}>Maintenance</Text>
                <Text style={styles.quickActionSubtext}>
                  {(dashboardData?.stats?.activeRequests || 0) > 0
                    ? `${dashboardData.stats.activeRequests} active`
                    : 'Request service'}
                </Text>
                {(dashboardData?.stats?.activeRequests || 0) > 0 && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>
                      {dashboardData?.stats?.activeRequests || 0}
                    </Text>
                  </View>
                )}
              </Card>

              {/* Documents */}
              <Card
                variant="elevated"
                style={styles.quickActionCard}
                onPress={() => {
                  handlePress();
                  console.log('View documents');
                }}
              >
                <LinearGradient
                  colors={colors.gradientPurple as any}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="document-text" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickActionLabel}>Documents</Text>
                <Text style={styles.quickActionSubtext}>View & download</Text>
              </Card>

              {/* Contact */}
              <Card
                variant="elevated"
                style={styles.quickActionCard}
                onPress={() => {
                  handlePress();
                  console.log('Contact support');
                }}
              >
                <LinearGradient
                  colors={colors.gradientBlue as any}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="chatbubbles" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickActionLabel}>Contact</Text>
                <Text style={styles.quickActionSubtext}>Get help</Text>
              </Card>
            </View>
          </Animated.View>

          {/* Important Notice */}
          <Card variant="gradient" gradientColors={colors.gradientOrange as any} style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <View style={styles.noticeIconContainer}>
                <Ionicons name="notifications" size={24} color="#FFFFFF" />
              </View>
              <H3 style={styles.noticeTitle}>Important Notice</H3>
            </View>
            <Body1 style={styles.noticeText}>
              The building's water will be temporarily shut off tomorrow from 9 AM to 12 PM for maintenance.
            </Body1>
            <View style={styles.noticeFooter}>
              <Text style={styles.noticeDate}>📅 Dec 15, 2025</Text>
              <Button
                title="View Details"
                variant="outline"
                onPress={() => console.log('View notice details')}
                style={styles.noticeButton}
                textStyle={styles.noticeButtonText}
              />
            </View>
          </Card>

          {/* Recent Activity */}
          {/* Activity Timeline */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3 style={styles.sectionTitle}>Recent Activity</H3>
              <TouchableOpacity onPress={() => console.log('View all activity')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <Card variant="elevated" style={styles.timelineCard}>
              <ActivityTimeline
                activities={dashboardData?.activities || []}
                onActivityPress={(activity) => {
                  console.log('Activity pressed:', activity);
                  if (activity.actionRoute) {
                    // Handle navigation
                  }
                }}
              />
            </Card>
          </View>

          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    minHeight: 140,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 240, // Increased from 200 to prevent overlap with header
    padding: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  propertyCardContainer: {
    marginBottom: spacing.lg,
  },
  propertyCard: {
    padding: 0,
    overflow: 'hidden',
  },
  propertyCardGradient: {
    padding: spacing.lg,
  },
  propertyHeader: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  propertyIconContainer: {
    marginRight: spacing.md,
  },
  propertyIconWrapper: {
    marginRight: spacing.md,
  },
  propertyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    marginBottom: 4,
  },
  propertySubtitle: {
    color: colors.muted,
  },
  propertyMoreButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  propertyDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  propertyDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyDetailIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  propertyDetailLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 2,
  },
  propertyDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  propertyButton: {
    marginTop: spacing.sm,
  },
  quickActionsContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (width - spacing.lg * 3) / 2,
    maxWidth: (width - spacing.lg * 3) / 2,
    padding: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  quickActionHighlighted: {
    borderWidth: 2,
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActionActive: {
    borderWidth: 1,
    borderColor: colors.warning,
  },
  quickActionGradient: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtext: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DC2626',
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.warningLight,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
  noticeCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  noticeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  noticeTitle: {
    flex: 1,
  },
  noticeText: {
    color: 'rgba(255,255,255,0.95)',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  noticeDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  noticeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  noticeButtonText: {
    color: '#FFFFFF',
  },
  activitySection: {
    marginBottom: spacing.lg,
  },
  activityCard: {
    padding: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  activityDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  timelineCard: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 200,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.muted,
  },
});
