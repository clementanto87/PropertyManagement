import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// Document picker - use expo-document-picker if available, otherwise fallback
let DocumentPicker: any = null;
try {
  DocumentPicker = require('expo-document-picker');
} catch (e) {
  // Document picker not available
}
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useUploadDocument } from '../hooks/useApi';

// Haptics is optional
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

const { width } = Dimensions.get('window');

type DocumentCategory = 'lease' | 'receipt' | 'inspection' | 'other';

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export const UploadDocumentScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map((asset: any) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize,
        }));
        setSelectedFiles([...selectedFiles, ...newFiles]);
        handlePress();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickDocument = async () => {
    try {
      if (!DocumentPicker) {
        // Fallback: Use image picker for all file types if document picker not available
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to access your files.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsMultipleSelection: true,
          quality: 1,
        });

        if (!result.canceled && result.assets) {
          const newFiles = result.assets.map((asset: any) => ({
            uri: asset.uri,
            name: asset.fileName || `file_${Date.now()}.${asset.uri.split('.').pop()}`,
            type: asset.mimeType || 'application/octet-stream',
            size: asset.fileSize,
          }));
          setSelectedFiles([...selectedFiles, ...newFiles]);
          handlePress();
        }
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map((asset: any) => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
          size: asset.size,
        }));
        setSelectedFiles([...selectedFiles, ...newFiles]);
        handlePress();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    handlePress();
  };

  const { mutateAsync: uploadDocument } = useUploadDocument();

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    handlePress();

    try {
      let successCount = 0;
      let failCount = 0;

      for (const file of selectedFiles) {
        try {
          await uploadDocument({
            fileUri: file.uri,
            name: file.name,
            type: file.type,
            category: category,
            description: description,
          });
          successCount++;
        } catch (error) {
          console.error('Failed to upload file:', file.name, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        Alert.alert(
          failCount > 0 ? 'Upload Completed with Errors' : 'Upload Successful',
          `${successCount} file(s) uploaded successfully.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Upload Failed', 'Failed to upload files. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const categoryOptions: { value: DocumentCategory; label: string; icon: string; color: string; description: string }[] = [
    { value: 'lease', label: 'Lease', icon: 'document-text', color: colors.primary, description: 'Contracts & agreements' },
    { value: 'receipt', label: 'Receipt', icon: 'receipt', color: colors.success, description: 'Payment proofs' },
    { value: 'inspection', label: 'Inspection', icon: 'search', color: colors.warning, description: 'Property checks' },
    { value: 'other', label: 'Other', icon: 'document', color: colors.muted, description: 'Miscellaneous files' },
  ];

  const isImage = (type: string) => {
    return type.startsWith('image/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Documents</Text>
          <Text style={styles.headerSubtitle}>Add files to your document library</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* File Selection Area */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.sectionTitle}>1. Select Files</Text>
          <Card style={styles.uploadAreaCard}>
            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={styles.uploadAction}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[colors.primaryLight + '40', colors.primaryLight + '10']}
                  style={styles.uploadActionGradient}
                >
                  <View style={[styles.uploadIconCircle, { backgroundColor: colors.primary }]}>
                    <Ionicons name="image" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.uploadActionTitle}>Upload Photos</Text>
                  <Text style={styles.uploadActionSubtitle}>JPG, PNG</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadAction}
                onPress={pickDocument}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[colors.successLight + '40', colors.successLight + '10']}
                  style={styles.uploadActionGradient}
                >
                  <View style={[styles.uploadIconCircle, { backgroundColor: colors.success }]}>
                    <Ionicons name="document-text" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.uploadActionTitle}>Upload Files</Text>
                  <Text style={styles.uploadActionSubtitle}>PDF, DOC</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.uploadHelper}>
              Max file size: 10MB • Supported formats: PDF, JPG, PNG
            </Text>
          </Card>
        </Animated.View>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: spacing.lg,
            }}
          >
            <View style={styles.filesHeader}>
              <Text style={styles.sectionTitle}>Selected ({selectedFiles.length})</Text>
              <TouchableOpacity onPress={() => setSelectedFiles([])} activeOpacity={0.7}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filesScroll}>
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileCard}>
                  <View style={styles.filePreviewContainer}>
                    {isImage(file.type) ? (
                      <Image source={{ uri: file.uri }} style={styles.filePreviewImage} />
                    ) : (
                      <View style={[styles.filePreviewIcon, { backgroundColor: colors.primaryMuted }]}>
                        <Ionicons name="document" size={32} color={colors.primary} />
                        <Text style={styles.fileExt}>{file.name.split('.').pop()?.toUpperCase()}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeFileButton}
                      onPress={() => removeFile(index)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                </View>
              ))}
              <View style={{ width: spacing.md }} />
            </ScrollView>
          </Animated.View>
        )}

        {/* Category Selection */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: spacing.xl,
          }}
        >
          <Text style={styles.sectionTitle}>2. Choose Category</Text>
          <View style={styles.categoriesList}>
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.categoryRow,
                  category === option.value && styles.categoryRowActive,
                  category === option.value && { borderColor: option.color }
                ]}
                onPress={() => {
                  setCategory(option.value);
                  handlePress();
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: option.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={option.color}
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={[
                    styles.categoryLabel,
                    category === option.value && { color: option.color }
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.categoryDescription}>{option.description}</Text>
                </View>
                <View style={styles.radioButton}>
                  {category === option.value && (
                    <View style={[styles.radioButtonInner, { backgroundColor: option.color }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Description Input */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: spacing.xl,
          }}
        >
          <Text style={styles.sectionTitle}>3. Add Details</Text>
          <Card style={styles.inputCard}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Add a description (optional)..."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </Card>
        </Animated.View>

        {/* Upload Button */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: spacing.xl,
          }}
        >
          <Button
            title={isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
            onPress={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            loading={isUploading}
            style={styles.uploadButton}
            size="lg"
          />
        </Animated.View>

        <View style={{ height: spacing.xl * 2 }} />
      </Animated.ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  uploadAreaCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  uploadAction: {
    flex: 1,
    height: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  uploadActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: radius.lg,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  uploadActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 2,
  },
  uploadActionSubtitle: {
    fontSize: 12,
    color: colors.muted,
  },
  uploadHelper: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  filesScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  fileCard: {
    width: 120,
    marginRight: spacing.md,
  },
  filePreviewContainer: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  filePreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  filePreviewIcon: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileExt: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  removeFileButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 11,
    color: colors.muted,
  },
  categoriesList: {
    gap: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  categoryRowActive: {
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.muted,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  inputCard: {
    padding: spacing.md,
  },
  textInput: {
    fontSize: 16,
    color: colors.ink,
    textAlignVertical: 'top',
    padding: 0,
  },
  textArea: {
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  uploadButton: {
    ...shadows.md,
  },
});

