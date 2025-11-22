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
import { Button } from '../components/ui/Button';

export const MaintenanceScreen = () => {
  const requests = [
    {
      id: 1,
      title: 'Kitchen Faucet Repair',
      description: 'Leaking faucet in kitchen sink',
      status: 'in_progress',
      priority: 'high',
      date: '2 days ago',
      assignee: 'John Doe',
      scheduled: 'Today 2PM',
    },
    {
      id: 2,
      title: 'AC Not Cooling',
      description: 'Air conditioner not working properly',
      status: 'pending',
      priority: 'urgent',
      date: '1 week ago',
      assignee: null,
      scheduled: null,
    },
    {
      id: 3,
      title: 'Light Bulb Replacement',
      description: 'Bedroom ceiling light needs replacement',
      status: 'completed',
      priority: 'low',
      date: '2 weeks ago',
      assignee: 'Jane Smith',
      scheduled: null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return { bg: colors.warningLight, text: colors.warning };
      case 'pending':
        return { bg: colors.errorLight, text: colors.error };
      case 'completed':
        return { bg: colors.successLight, text: colors.success };
      default:
        return { bg: colors.primaryMuted, text: colors.primary };
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={colors.gradientOrange} style={styles.header}>
        <Text style={styles.headerTitle}>Maintenance</Text>
        <Text style={styles.headerSubtitle}>Track your service requests</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
      >
        {/* New Request Button */}
        <Button
          title="+ New Request"
          onPress={() => { }}
          style={styles.newRequestButton}
        />

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Requests List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Requests</Text>

          {requests.map((request) => {
            const statusColor = getStatusColor(request.status);
            return (
              <Card key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityEmoji}>{getPriorityEmoji(request.priority)}</Text>
                    <Text style={styles.priorityText}>{request.priority}</Text>
                  </View>
                </View>

                <Text style={styles.requestTitle}>{request.title}</Text>
                <Text style={styles.requestDescription}>{request.description}</Text>

                <View style={styles.requestFooter}>
                  <Text style={styles.requestDate}>📅 {request.date}</Text>
                  {request.assignee && (
                    <View style={styles.assigneeContainer}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {request.assignee.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <Text style={styles.assigneeName}>{request.assignee}</Text>
                    </View>
                  )}
                </View>

                {request.scheduled && (
                  <View style={styles.scheduledBanner}>
                    <Text style={styles.scheduledText}>⏰ Scheduled: {request.scheduled}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details →</Text>
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>

        {/* Help Card */}
        <Card variant="gradient" gradientColors={colors.gradientPurple} style={styles.helpCard}>
          <Text style={styles.helpIcon}>💡</Text>
          <Text style={styles.helpTitle}>Need Emergency Help?</Text>
          <Text style={styles.helpText}>
            For urgent issues like gas leaks or flooding, call our 24/7 emergency line
          </Text>
          <TouchableOpacity style={styles.callButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
              style={styles.callButtonGradient}
            >
              <Text style={styles.callButtonText}>📞 Call Emergency Line</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  newRequestButton: {
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  requestCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  priorityEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  requestDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginBottom: spacing.md,
  },
  requestDate: {
    fontSize: 12,
    color: colors.muted,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assigneeName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink,
  },
  scheduledBanner: {
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  scheduledText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
    textAlign: 'center',
  },
  viewButton: {
    paddingVertical: spacing.sm,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  helpCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  helpIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  callButton: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  callButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
