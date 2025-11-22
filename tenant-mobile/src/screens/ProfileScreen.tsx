import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = React.useState(true);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Profile */}
      <LinearGradient colors={colors.gradientBlue} style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {user?.name?.split(' ').map(n => n[0]).join('') || 'RC'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Regina Clement'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'regina_clement@outlook.com'}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
      >
        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>+1 (555) 123-4567</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Unit</Text>
              <Text style={styles.infoValue}>4B</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lease Start</Text>
              <Text style={styles.infoValue}>Jun 1, 2025</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lease End</Text>
              <Text style={styles.infoValue}>Jun 1, 2026</Text>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <Text style={styles.settingDescription}>Payment reminders & updates</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : colors.muted}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>💳</Text>
                <View>
                  <Text style={styles.settingLabel}>Auto-pay</Text>
                  <Text style={styles.settingDescription}>Automatic monthly payments</Text>
                </View>
              </View>
              <Switch
                value={autoPayEnabled}
                onValueChange={setAutoPayEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={autoPayEnabled ? colors.primary : colors.muted}
              />
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity>
            <Card style={styles.actionCard}>
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.actionLabel}>Edit Profile</Text>
              <Text style={styles.actionChevron}>›</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card style={styles.actionCard}>
              <Text style={styles.actionIcon}>🔐</Text>
              <Text style={styles.actionLabel}>Change Password</Text>
              <Text style={styles.actionChevron}>›</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card style={styles.actionCard}>
              <Text style={styles.actionIcon}>💳</Text>
              <Text style={styles.actionLabel}>Payment Methods</Text>
              <Text style={styles.actionChevron}>›</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card style={styles.actionCard}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>Emergency Contacts</Text>
              <Text style={styles.actionChevron}>›</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity>
            <Card style={styles.actionCard}>
              <Text style={styles.actionIcon}>❓</Text>
              <Text style={styles.actionLabel}>Help Center</Text>
              <Text style={styles.actionChevron}>›</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card style={styles.actionCard}>
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={styles.actionLabel}>Contact Support</Text>
              <Text style={styles.actionChevron}>›</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card style={styles.actionCard}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionLabel}>Terms & Privacy</Text>
              <Text style={styles.actionChevron}>›</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

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
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  infoCard: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  settingsCard: {
    padding: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.muted,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  actionCard: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
  },
  actionChevron: {
    fontSize: 24,
    color: colors.muted,
  },
  logoutButton: {
    marginBottom: spacing.lg,
  },
  versionText: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
});
