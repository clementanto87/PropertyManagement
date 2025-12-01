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

export const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={colors.gradientBlue}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>Regina Clement</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
      >
        {/* Next Payment Card */}
        <Card variant="gradient" gradientColors={colors.gradientBlue} style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Next Payment Due</Text>
            <Text style={styles.cardBadge}>AUTO-PAY ON</Text>
          </View>
          <Text style={styles.paymentAmount}>$1,850</Text>
          <Text style={styles.paymentDate}>December 1, 2025</Text>
          <TouchableOpacity style={styles.payButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
              style={styles.payButtonGradient}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
              <Text style={styles.payButtonIcon}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryMuted }]}>
                <Text style={styles.actionEmoji}>🔧</Text>
              </View>
              <Text style={styles.actionLabel}>Maintenance</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: colors.successLight }]}>
                <Text style={styles.actionEmoji}>💳</Text>
              </View>
              <Text style={styles.actionLabel}>Payments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: colors.warningLight }]}>
                <Text style={styles.actionEmoji}>📄</Text>
              </View>
              <Text style={styles.actionLabel}>Documents</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.actionEmoji}>👥</Text>
              </View>
              <Text style={styles.actionLabel}>Community</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Maintenance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Requests</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.maintenanceCard}>
            <View style={styles.maintenanceHeader}>
              <View style={[styles.statusBadge, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.statusText, { color: colors.warning }]}>IN PROGRESS</Text>
              </View>
              <Text style={styles.maintenanceDate}>2 days ago</Text>
            </View>
            <Text style={styles.maintenanceTitle}>Kitchen Faucet Repair</Text>
            <Text style={styles.maintenanceDescription}>
              Leaking faucet in kitchen sink needs immediate attention
            </Text>
            <View style={styles.maintenanceFooter}>
              <View style={styles.assignee}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>JD</Text>
                </View>
                <Text style={styles.assigneeName}>John Doe</Text>
              </View>
              <Text style={styles.maintenanceTime}>Scheduled: Today 2PM</Text>
            </View>
          </Card>
        </View>

        {/* Property Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Property</Text>
          <Card style={styles.propertyCard}>
            <View style={styles.propertyHeader}>
              <View style={styles.propertyIcon}>
                <Text style={styles.propertyEmoji}>🏠</Text>
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyName}>Sunset Apartments</Text>
                <Text style={styles.propertyAddress}>Unit 4B • 123 Main St</Text>
              </View>
            </View>
            <View style={styles.propertyStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Months</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>$1,850</Text>
                <Text style={styles.statLabel}>Monthly Rent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>Jun 2026</Text>
                <Text style={styles.statLabel}>Lease Ends</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Bottom Spacing */}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  paymentCard: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  paymentAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.lg,
  },
  payButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: spacing.sm,
  },
  payButtonIcon: {
    fontSize: 20,
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
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  actionCard: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink,
    textAlign: 'center',
  },
  maintenanceCard: {
    padding: spacing.lg,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  maintenanceDate: {
    fontSize: 12,
    color: colors.muted,
  },
  maintenanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  maintenanceDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  maintenanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
  },
  maintenanceTime: {
    fontSize: 12,
    color: colors.muted,
  },
  propertyCard: {
    padding: spacing.lg,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  propertyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  propertyEmoji: {
    fontSize: 28,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: colors.muted,
  },
  propertyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
});
