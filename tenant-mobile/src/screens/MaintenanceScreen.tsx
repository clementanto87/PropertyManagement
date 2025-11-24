import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMaintenanceRequests } from '../hooks/useApi';

// Haptics is optional
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

export const MaintenanceScreen = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { data: requests, isLoading, refetch } = useMaintenanceRequests();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
        return { bg: colors.warningLight, text: colors.warning };
      case 'PENDING':
        return { bg: colors.errorLight, text: colors.error };
      case 'COMPLETED':
        return { bg: colors.successLight, text: colors.success };
      default:
        return { bg: colors.primaryMuted, text: colors.primary };
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    if (!requests) return { active: 0, pending: 0, completed: 0 };
    return {
      active: requests.filter((r: any) => r.status === 'IN_PROGRESS').length,
      pending: requests.filter((r: any) => r.status === 'PENDING').length,
      completed: requests.filter((r: any) => r.status === 'COMPLETED').length,
    };
  }, [requests]);

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

  const handleNewRequest = () => {
    handlePress();
    navigation.navigate('NewRequest' as never);
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
          colors={colors.gradientOrange as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Maintenance</Text>
          <Text style={styles.headerSubtitle}>Track your service requests</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* New Request Button */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Button
            title="+ New Request"
            onPress={handleNewRequest}
            style={styles.newRequestButton}
          />
        </Animated.View>

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
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </Animated.View>

        {/* Requests List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Requests</Text>

          {isLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.muted }}>Loading requests...</Text>
            </View>
          ) : !requests || requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🔧</Text>
              <Text style={styles.emptyStateText}>No maintenance requests found</Text>
              <Text style={styles.emptyStateSubtext}>Everything seems to be working perfectly!</Text>
            </View>
          ) : (
            requests.map((request: any, index: number) => {
              const statusColor = getStatusColor(request.status);
              return (
                <Animated.View
                  key={request.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <Card style={styles.requestCard}>
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
                      <Text style={styles.requestDate}>📅 {new Date(request.createdAt).toLocaleDateString()}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={handlePress}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewButtonText}>View Details →</Text>
                    </TouchableOpacity>
                  </Card>
                </Animated.View>
              );
            })
          )}
        </View>

        {/* Help Card */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card variant="gradient" gradientColors={colors.gradientPurple as any} style={styles.helpCard}>
            <Text style={styles.helpIcon}>💡</Text>
            <Text style={styles.helpTitle}>Need Emergency Help?</Text>
            <Text style={styles.helpText}>
              For urgent issues like gas leaks or flooding, call our 24/7 emergency line
            </Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                style={styles.callButtonGradient}
              >
                <Text style={styles.callButtonText}>📞 Call Emergency Line</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card>
        </Animated.View>

        <View style={{ height: spacing.xl }} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 160,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
});
