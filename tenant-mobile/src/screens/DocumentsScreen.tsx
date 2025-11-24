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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Card } from '../components/ui/Card';
import { useDocuments, useDownloadDocument } from '../hooks/useApi';

// Haptics is optional
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

export const DocumentsScreen = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { data: documentsData, isLoading, refetch } = useDocuments();
  const { mutate: downloadDocument } = useDownloadDocument();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredDocuments = React.useMemo(() => {
    if (!documentsData) return [];
    if (!selectedCategory) return documentsData;
    return documentsData.filter(doc => doc.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [documentsData, selectedCategory]);

  const getCategoryIcon = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'lease':
        return 'document-text';
      case 'inspection':
        return 'search';
      case 'receipt':
        return 'receipt';
      default:
        return 'document';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lease':
        return colors.primaryMuted;
      case 'inspection':
        return colors.warningLight;
      case 'receipt':
        return colors.successLight;
      default:
        return colors.background;
    }
  };

  const getCategoryCount = (category: string) => {
    if (!documentsData) return 0;
    return documentsData.filter(doc => doc.category.toLowerCase() === category.toLowerCase()).length;
  };

  const handleDownload = (doc: any) => {
    handlePress();
    // In a real app, this would download the file or open it
    // For now, we'll just show an alert or log it
    // downloadDocument(doc.id);
    Alert.alert('Download', `Downloading ${doc.name}...`);
  };

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

  const toggleCategory = (category: string) => {
    handlePress();
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
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
          colors={colors.gradientPurple as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Documents</Text>
          <Text style={styles.headerSubtitle}>Your important files</Text>
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
        {/* Categories */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === 'lease' && styles.categoryCardActive
              ]}
              onPress={() => toggleCategory('lease')}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="document-text" size={28} color={colors.primary} />
              </View>
              <Text style={styles.categoryLabel}>Lease</Text>
              <Text style={styles.categoryCount}>{getCategoryCount('lease')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === 'receipt' && styles.categoryCardActive
              ]}
              onPress={() => toggleCategory('receipt')}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: colors.successLight }]}>
                <Ionicons name="receipt" size={28} color={colors.success} />
              </View>
              <Text style={styles.categoryLabel}>Receipts</Text>
              <Text style={styles.categoryCount}>{getCategoryCount('receipt')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === 'inspection' && styles.categoryCardActive
              ]}
              onPress={() => toggleCategory('inspection')}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="search" size={28} color={colors.warning} />
              </View>
              <Text style={styles.categoryLabel}>Inspections</Text>
              <Text style={styles.categoryCount}>{getCategoryCount('inspection')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === 'other' && styles.categoryCardActive
              ]}
              onPress={() => toggleCategory('other')}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="document" size={28} color={colors.primary} />
              </View>
              <Text style={styles.categoryLabel}>Other</Text>
              <Text style={styles.categoryCount}>{getCategoryCount('other')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Documents`
                : 'All Documents'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                handlePress();
                navigation.navigate('UploadDocument' as never);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.uploadButton}>+ Upload</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.muted }}>Loading documents...</Text>
            </View>
          ) : !filteredDocuments || filteredDocuments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📂</Text>
              <Text style={styles.emptyStateText}>No documents found</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedCategory
                  ? `No documents in ${selectedCategory} category`
                  : 'Upload documents to keep them safe and organized'}
              </Text>
            </View>
          ) : (
            filteredDocuments.map((doc, index) => (
              <Animated.View
                key={doc.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <Card style={styles.documentCard}>
                  <View style={styles.documentContent}>
                    <View style={[styles.docIcon, { backgroundColor: getCategoryColor(doc.category) }]}>
                      <Ionicons
                        name={getCategoryIcon(doc.category) as any}
                        size={22}
                        color={doc.category.toLowerCase() === 'lease' ? colors.primary :
                          doc.category.toLowerCase() === 'receipt' ? colors.success :
                            doc.category.toLowerCase() === 'inspection' ? colors.warning : colors.primary}
                      />
                    </View>
                    <View style={styles.docInfo}>
                      <Text
                        style={styles.docName}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {doc.name}
                      </Text>
                      <View style={styles.docMeta}>
                        <Text style={styles.docSize}>{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Unknown'}</Text>
                        <Text style={styles.docDot}>•</Text>
                        <Text style={styles.docDate}>{new Date(doc.uploadedAt).toLocaleDateString()}</Text>
                      </View>
                    </View>
                    <View style={styles.docActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDownload(doc)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="eye-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDownload(doc)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="download-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))
          )}
        </View>

        {/* Upload Card */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card variant="gradient" gradientColors={colors.gradientBlue as any} style={styles.uploadCard}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="cloud-upload-outline" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.uploadTitle}>Upload Documents</Text>
            <Text style={styles.uploadText}>
              Share important documents with your property manager
            </Text>
            <TouchableOpacity
              style={styles.uploadActionButton}
              onPress={() => {
                handlePress();
                navigation.navigate('UploadDocument' as never);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                style={styles.uploadActionGradient}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.uploadActionText}>Choose Files</Text>
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
  uploadButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  categoryCard: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 10,
    color: colors.muted,
  },
  documentCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  docInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.md,
  },
  docName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
    lineHeight: 22,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docSize: {
    fontSize: 12,
    color: colors.muted,
  },
  docDot: {
    fontSize: 12,
    color: colors.muted,
    marginHorizontal: 4,
  },
  docDate: {
    fontSize: 12,
    color: colors.muted,
  },
  docActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexShrink: 0,
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  uploadActionButton: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  uploadActionGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryCardActive: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
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
