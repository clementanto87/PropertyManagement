import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Card } from '../components/ui/Card';
import { usePayments, useDashboard } from '../hooks/useApi';
import { SpendingChart } from '../components/SpendingChart';
import { format } from 'date-fns';

// Haptics is optional
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

const { width } = Dimensions.get('window');

export const PaymentsScreen = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [filter, setFilter] = React.useState<'ALL' | 'RENT' | 'UTILITIES'>('ALL');

  const { data: payments, isLoading: isPaymentsLoading } = usePayments();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();

  const isLoading = isPaymentsLoading || isDashboardLoading;

  // Helper for safe date formatting
  const safeFormat = (dateString: string, dateFormat: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return format(date, dateFormat);
    } catch (e) {
      return '';
    }
  };

  // Process data for chart
  const chartData = React.useMemo(() => {
    if (!payments) return [];
    // Group by month and sum amounts
    const last6Months = payments
      .slice(0, 6)
      .reverse()
      .map(p => ({
        label: safeFormat(p.dueDate, 'MMM') || 'N/A',
        value: p.amount,
        fullDate: safeFormat(p.dueDate, 'MMMM yyyy') || 'N/A',
      }));
    return last6Months;
  }, [payments]);

  // Filter payments
  const filteredPayments = React.useMemo(() => {
    if (!payments) return [];
    if (filter === 'ALL') return payments;
    return payments.filter(p => p.type === filter);
  }, [payments, filter]);

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    if (!payments) return { total: 0, count: 0, onTime: 100 };
    const currentYear = new Date().getFullYear();
    const thisYearPayments = payments.filter(p => {
      const date = new Date(p.dueDate);
      return !isNaN(date.getTime()) && date.getFullYear() === currentYear;
    });
    const total = thisYearPayments.reduce((sum, p) => sum + p.amount, 0);
    const count = thisYearPayments.length;
    // Mock on-time calculation
    const onTime = 100;
    return { total, count, onTime };
  }, [payments]);

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

  const handlePress = () => {
    if (Platform.OS === 'ios' && Haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          { opacity: headerOpacity }
        ]}
      >
        <LinearGradient
          colors={colors.gradientBlue as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Payments</Text>
              <Text style={styles.headerSubtitle}>Manage your rent payments</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Next Payment Card - Enhanced */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Card variant="gradient" gradientColors={colors.gradientGreen} style={styles.nextPaymentCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardBadge}>
                    <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                    <Text style={styles.badgeText}>UPCOMING</Text>
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <Text style={styles.nextPaymentAmount}>1,850</Text>
                  </View>
                </View>

                <View style={styles.paymentInfo}>
                  <View>
                    <Text style={styles.nextPaymentLabel}>Next Payment Due</Text>
                    <Text style={styles.nextPaymentDate}>
                      {dashboardData?.nextPayment && !isNaN(new Date(dashboardData.nextPayment.dueDate).getTime())
                        ? safeFormat(dashboardData.nextPayment.dueDate, 'MMMM d, yyyy')
                        : 'No upcoming payments'}
                    </Text>
                  </View>
                  {dashboardData?.nextPayment && !isNaN(new Date(dashboardData.nextPayment.dueDate).getTime()) && (
                    <View style={styles.daysContainer}>
                      <Text style={styles.daysNumber}>
                        {Math.ceil((new Date(dashboardData.nextPayment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </Text>
                      <Text style={styles.daysLabel}>days left</Text>
                    </View>
                  )}
                </View>

                <View style={styles.paymentActions}>
                  <TouchableOpacity
                    style={styles.primaryAction}
                    activeOpacity={0.8}
                    onPress={handlePress}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.25)']}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="card" size={20} color="#FFFFFF" />
                      <Text style={styles.actionText}>Pay Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    activeOpacity={0.8}
                    onPress={handlePress}
                  >
                    <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.secondaryActionText}>Auto-pay</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </Animated.View>

            {/* Payment Methods - Enhanced */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>
                <TouchableOpacity style={styles.addButtonContainer}>
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <Card variant="elevated" style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <View style={styles.cardIconContainer}>
                    <LinearGradient
                      colors={colors.gradientBlue as any}
                      style={styles.cardIcon}
                    >
                      <Ionicons name="card" size={24} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>Visa •••• 4242</Text>
                    <Text style={styles.methodExpiry}>Expires 12/26</Text>
                  </View>
                  <View style={styles.defaultBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <Text style={styles.defaultText}>DEFAULT</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.methodAction}>
                  <Text style={styles.methodActionText}>Edit</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </Card>
            </View>

            {/* Payment History - Enhanced */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment History</Text>
                <View style={styles.filterContainer}>
                  {(['ALL', 'RENT', 'UTILITIES'] as const).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.filterChip, filter === f && styles.filterChipActive]}
                      onPress={() => setFilter(f)}
                    >
                      <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                        {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {filteredPayments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color={colors.light} />
                  <Text style={styles.emptyStateText}>No payments found</Text>
                </View>
              ) : (
                filteredPayments.map((payment, index) => {
                  const cardStyle = index === 0
                    ? StyleSheet.flatten([styles.historyCard, styles.firstHistoryCard])
                    : styles.historyCard;

                  return (
                    <Animated.View
                      key={payment.id}
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                      }}
                    >
                      <Card
                        variant="elevated"
                        style={cardStyle}
                      >
                        <View style={styles.historyHeader}>
                          <View style={styles.historyLeft}>
                            <View style={[styles.historyIcon, { backgroundColor: colors.successLight }]}>
                              <Ionicons
                                name={payment.type === 'RENT' ? 'home' : 'flash'}
                                size={20}
                                color={colors.success}
                              />
                            </View>
                            <View>
                              <Text style={styles.historyDate}>
                                {safeFormat(payment.dueDate, 'MMM d, yyyy') || 'Date N/A'}
                              </Text>
                              <Text style={styles.historyMethod}>
                                {payment.paymentMethod || 'Auto-pay'}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.historyRight}>
                            <Text style={styles.historyAmount}>${payment.amount.toLocaleString()}</Text>
                            <View style={styles.statusBadge}>
                              <View style={styles.statusDot} />
                              <Text style={styles.statusText}>{payment.status}</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.receiptButton}
                          onPress={handlePress}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                          <Text style={styles.receiptText}>View Receipt</Text>
                          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                        </TouchableOpacity>
                      </Card>
                    </Animated.View>
                  );
                })
              )}
            </View>

            {/* Payment Summary - Enhanced */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Card variant="elevated" style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="stats-chart" size={24} color={colors.primary} />
                  <Text style={styles.summaryTitle}>{new Date().getFullYear()} Summary</Text>
                </View>

                {/* Spending Chart */}
                <View style={styles.chartContainer}>
                  <SpendingChart data={chartData} />
                </View>

                <View style={styles.summaryStats}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>${summaryStats.total.toLocaleString()}</Text>
                    <Text style={styles.summaryLabel}>Total Paid</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{summaryStats.count}</Text>
                    <Text style={styles.summaryLabel}>Payments</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <View style={styles.percentageContainer}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.summaryValue}>{summaryStats.onTime}%</Text>
                    </View>
                    <Text style={styles.summaryLabel}>On Time</Text>
                  </View>
                </View>
              </Card>
            </Animated.View>

            <View style={{ height: spacing.xl }} />
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 160,
  },
  nextPaymentCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginRight: 2,
  },
  nextPaymentAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  nextPaymentLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  nextPaymentDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  daysContainer: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daysLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  addButtonContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  methodCard: {
    padding: spacing.lg,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIconContainer: {
    marginRight: spacing.md,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  methodExpiry: {
    fontSize: 14,
    color: colors.muted,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  methodAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 4,
  },
  methodActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  historyCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  firstHistoryCard: {
    shadowColor: shadows.md.shadowColor,
    shadowOffset: shadows.md.shadowOffset,
    shadowOpacity: shadows.md.shadowOpacity,
    shadowRadius: shadows.md.shadowRadius,
    elevation: shadows.md.elevation,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  historyMethod: {
    fontSize: 14,
    color: colors.muted,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.xs,
  },
  receiptText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.muted,
  },
  chartContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
});
