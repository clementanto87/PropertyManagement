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

export const DocumentsScreen = () => {
  const documents = [
    { id: 1, name: 'Lease Agreement', type: 'PDF', size: '2.4 MB', date: 'Jun 1, 2025', category: 'lease' },
    { id: 2, name: 'Move-in Inspection', type: 'PDF', size: '1.8 MB', date: 'Jun 1, 2025', category: 'inspection' },
    { id: 3, name: 'Rent Receipt - Nov', type: 'PDF', size: '156 KB', date: 'Nov 1, 2025', category: 'receipt' },
    { id: 4, name: 'Rent Receipt - Oct', type: 'PDF', size: '156 KB', date: 'Oct 1, 2025', category: 'receipt' },
    { id: 5, name: 'Property Rules', type: 'PDF', size: '890 KB', date: 'Jun 1, 2025', category: 'other' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lease':
        return '📋';
      case 'inspection':
        return '🔍';
      case 'receipt':
        return '🧾';
      default:
        return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={colors.gradientPurple} style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
        <Text style={styles.headerSubtitle}>Your important files</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
      >
        {/* Storage Info */}
        <Card style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Text style={styles.storageTitle}>Storage Used</Text>
            <Text style={styles.storageAmount}>5.4 MB / 50 MB</Text>
          </View>
          <View style={styles.storageBar}>
            <View style={[styles.storageProgress, { width: '11%' }]} />
          </View>
          <Text style={styles.storageText}>89% available</Text>
        </Card>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.primaryMuted }]}>
                <Text style={styles.categoryEmoji}>📋</Text>
              </View>
              <Text style={styles.categoryLabel}>Lease</Text>
              <Text style={styles.categoryCount}>2</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.successLight }]}>
                <Text style={styles.categoryEmoji}>🧾</Text>
              </View>
              <Text style={styles.categoryLabel}>Receipts</Text>
              <Text style={styles.categoryCount}>11</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.warningLight }]}>
                <Text style={styles.categoryEmoji}>🔍</Text>
              </View>
              <Text style={styles.categoryLabel}>Inspections</Text>
              <Text style={styles.categoryCount}>3</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.categoryEmoji}>📄</Text>
              </View>
              <Text style={styles.categoryLabel}>Other</Text>
              <Text style={styles.categoryCount}>5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Documents</Text>
            <TouchableOpacity>
              <Text style={styles.uploadButton}>+ Upload</Text>
            </TouchableOpacity>
          </View>

          {documents.map((doc) => (
            <Card key={doc.id} style={styles.documentCard}>
              <View style={styles.documentContent}>
                <View style={[styles.docIcon, { backgroundColor: getCategoryColor(doc.category) }]}>
                  <Text style={styles.docEmoji}>{getCategoryIcon(doc.category)}</Text>
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <View style={styles.docMeta}>
                    <Text style={styles.docSize}>{doc.size}</Text>
                    <Text style={styles.docDot}>•</Text>
                    <Text style={styles.docDate}>{doc.date}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.docActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>👁️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>⬇️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📤</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Upload Card */}
        <Card variant="gradient" gradientColors={colors.gradientBlue} style={styles.uploadCard}>
          <Text style={styles.uploadIcon}>📤</Text>
          <Text style={styles.uploadTitle}>Upload Documents</Text>
          <Text style={styles.uploadText}>
            Share important documents with your property manager
          </Text>
          <TouchableOpacity style={styles.uploadActionButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
              style={styles.uploadActionGradient}
            >
              <Text style={styles.uploadActionText}>Choose Files</Text>
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
  storageCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  storageAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  storageBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  storageProgress: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  storageText: {
    fontSize: 12,
    color: colors.muted,
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
  categoryEmoji: {
    fontSize: 28,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  docEmoji: {
    fontSize: 24,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
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
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 16,
  },
  uploadCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  uploadIcon: {
    fontSize: 48,
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
  },
  uploadActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
