import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Animated,
  Platform,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, useUploadProfilePhoto } from '../hooks/useApi';
import { EditProfileModal } from '../components/profile/EditProfileModal';

// Haptics is optional
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

export const ProfileScreen = () => {
  const { logout } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const { data: profile, isLoading, refetch } = useProfile();
  const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } = useUploadProfilePhoto();

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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const handlePress = () => {
    if (Platform.OS === 'ios' && Haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }
  };

  const handlePhotoUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handlePress();
        await uploadPhoto(result.assets[0].uri);
        Alert.alert('Success', 'Profile photo updated successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo.');
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  if (isLoading && !profile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header with Profile */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <LinearGradient
          colors={colors.gradientBlue as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <View style={styles.profileHeaderTop}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handlePhotoUpload}
                disabled={isUploadingPhoto}
              >
                <View style={styles.avatarLarge}>
                  {profile?.profilePhoto ? (
                    <Image source={{ uri: profile.profilePhoto }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </Text>
                  )}
                  {isUploadingPhoto && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={12} color={colors.primary} />
                </View>
              </TouchableOpacity>

              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{profile?.firstName} {profile?.lastName}</Text>
                <Text style={styles.userEmail}>{profile?.email}</Text>

                <View style={styles.headerStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Unit</Text>
                    <Text style={styles.statValue}>{profile?.unit?.unitNumber || 'N/A'}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Status</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Account Info */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <TouchableOpacity
              onPress={() => {
                handlePress();
                setEditModalVisible(true);
              }}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="call-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{profile?.phone || 'Not set'}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lease Period</Text>
                <Text style={styles.infoValue}>
                  {profile?.lease?.startDate ? new Date(profile.lease.startDate).toLocaleDateString() : 'N/A'} - {profile?.lease?.endDate ? new Date(profile.lease.endDate).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Preferences</Text>

          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Payment reminders & updates</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="card-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Auto-pay</Text>
                <Text style={styles.settingDescription}>Automatic monthly payments</Text>
              </View>
              <Switch
                value={autoPayEnabled}
                onValueChange={setAutoPayEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={autoPayEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.actionGroup}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <Card style={styles.actionCard}>
                <View style={styles.actionRow}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#0284C7" />
                  </View>
                  <Text style={styles.actionLabel}>Change Password</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <Card style={styles.actionCard}>
                <View style={styles.actionRow}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="wallet-outline" size={20} color="#16A34A" />
                  </View>
                  <Text style={styles.actionLabel}>Payment Methods</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <Card style={styles.actionCard}>
                <View style={styles.actionRow}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="people-outline" size={20} color="#DC2626" />
                  </View>
                  <Text style={styles.actionLabel}>Emergency Contacts</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Support */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Support</Text>

          <View style={styles.actionGroup}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <Card style={styles.actionCard}>
                <View style={styles.actionRow}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="help-circle-outline" size={20} color="#9333EA" />
                  </View>
                  <Text style={styles.actionLabel}>Help Center</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <Card style={styles.actionCard}>
                <View style={styles.actionRow}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name="mail-outline" size={20} color="#EA580C" />
                  </View>
                  <Text style={styles.actionLabel}>Contact Support</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <Card style={styles.actionCard}>
                <View style={styles.actionRow}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons name="document-text-outline" size={20} color="#475569" />
                  </View>
                  <Text style={styles.actionLabel}>Terms & Privacy</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButtonContainer}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

        <View style={{ height: spacing.xl }} />
      </Animated.ScrollView>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          profile={profile}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'flex-end',
  },
  profileSection: {
    width: '100%',
  },
  profileHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.sm,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 160,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  editLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: radius.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 56,
  },
  settingsCard: {
    padding: spacing.md,
    borderRadius: radius.xl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
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
    marginLeft: 56,
    marginVertical: spacing.xs,
  },
  actionGroup: {
    gap: spacing.md,
  },
  actionCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
  logoutButtonContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
