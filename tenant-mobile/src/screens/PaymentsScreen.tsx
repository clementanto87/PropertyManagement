import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Card } from '../components/ui/Card';

export const PaymentsScreen = () => {
  const payments = [
    { id: 1, date: 'Nov 1, 2025', amount: 1850, status: 'paid', method: 'Auto-pay' },
    { id: 2, date: 'Oct 1, 2025', amount: 1850, status: 'paid', method: 'Credit Card' },
    { id: 3, date: 'Sep 1, 2025', amount: 1850, status: 'paid', method: 'Auto-pay' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={colors.gradientBlue} style={styles.header}>
        <Text style={styles.headerTitle}>Payments</Text>
        <Text style={styles.headerSubtitle}>Manage your rent payments</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
      >
        {/* Next Payment Card */}
        <Card variant="gradient" gradientColors={colors.gradientGreen} style={styles.nextPaymentCard}>
          <View style={styles.cardBadge}>
            <Text style={styles.badgeText}>UPCOMING</Text>
          </View>
          <Text style={styles.nextPaymentLabel}>Next Payment</Text>
          <Text style={styles.nextPaymentAmount}>$1,850</Text>
          <Text style={styles.nextPaymentDate}>Due December 1, 2025</Text>

          <View style={styles.paymentActions}>
            <TouchableOpacity style={styles.primaryAction}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionText}>💳 Pay Now</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>⚙️ Auto-pay</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>💳</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>Visa •••• 4242</Text>
                <Text style={styles.methodExpiry}>Expires 12/26</Text>
              </View>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>DEFAULT</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>

          {payments.map((payment) => (
            <Card key={payment.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View>
                  <Text style={styles.historyDate}>{payment.date}</Text>
                  <Text style={styles.historyMethod}>{payment.method}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>${payment.amount.toLocaleString()}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Paid</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.receiptButton}>
                <Text style={styles.receiptText}>📄 View Receipt</Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Payment Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>2025 Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>$20,350</Text>
              <Text style={styles.summaryLabel}>Total Paid</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>11</Text>
              <Text style={styles.summaryLabel}>Payments</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>100%</Text>
              <Text style={styles.summaryLabel}>On Time</Text>
            </View>
          </View>
        </Card>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  nextPaymentCard: {
    marginBottom: spacing.lg,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextPaymentLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  nextPaymentAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nextPaymentDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.lg,
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
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
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
  addButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  methodCard: {
    padding: spacing.lg,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardIconText: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  methodExpiry: {
    fontSize: 14,
    color: colors.muted,
  },
  defaultBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  historyCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
    fontSize: 20,
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
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  receiptButton: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  receiptText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.lg,
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
  summaryLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
});
