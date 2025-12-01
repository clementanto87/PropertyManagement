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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { useCreateMaintenanceRequest, useUploadMaintenanceImage } from '../hooks/useApi';

// Haptics is optional
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
type Category = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'other';

export const NewRequestScreen = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [category, setCategory] = useState<Category>('other');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { mutate: createRequest, isPending: isCreating } = useCreateMaintenanceRequest();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadMaintenanceImage();

  const [images, setImages] = useState<string[]>([]);

  const handleImagePick = async () => {
    handlePress();

    // Check permissions (optional, as expo-image-picker handles this automatically on most platforms)

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false, // Simplified for now
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    handlePress();
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    handlePress();

    try {
      // 1. Upload images first
      const uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        for (const imageUri of images) {
          try {
            const response = await uploadImage(imageUri);
            if (response.url) {
              uploadedImageUrls.push(response.url);
            }
          } catch (error) {
            console.error('Failed to upload image:', error);
            // Continue with other images or fail? Let's continue but warn
          }
        }
      }

      // 2. Create request
      createRequest(
        {
          title,
          description,
          priority,
          category,
          location,
          images: uploadedImageUrls,
        },
        {
          onSuccess: () => {
            Alert.alert(
              'Request Submitted',
              'Your maintenance request has been submitted successfully.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          },
          onError: (error: any) => {
            Alert.alert('Error', error.message || 'Failed to submit request');
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const priorityOptions: { value: Priority; label: string; emoji: string; color: string }[] = [
    { value: 'URGENT', label: 'Urgent', emoji: '🔴', color: colors.error },
    { value: 'HIGH', label: 'High', emoji: '🟠', color: colors.warning },
    { value: 'MEDIUM', label: 'Medium', emoji: '🟡', color: '#FCD34D' },
    { value: 'LOW', label: 'Low', emoji: '🟢', color: colors.success },
  ];

  const categoryOptions: { value: Category; label: string; icon: string }[] = [
    { value: 'plumbing', label: 'Plumbing', icon: 'water' },
    { value: 'electrical', label: 'Electrical', icon: 'flash' },
    { value: 'hvac', label: 'HVAC', icon: 'snow' },
    { value: 'appliance', label: 'Appliance', icon: 'cube' },
    { value: 'other', label: 'Other', icon: 'construct' },
  ];

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
          colors={colors.gradientOrange as any}
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
          <Text style={styles.headerTitle}>New Request</Text>
          <Text style={styles.headerSubtitle}>Submit a maintenance request</Text>
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
        {/* Title Input */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.inputCard}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Kitchen Faucet Leaking"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.helperText}>{title.length}/100 characters</Text>
          </Card>
        </Animated.View>

        {/* Description Input */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.inputCard}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe the issue in detail..."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.helperText}>{description.length}/500 characters</Text>
          </Card>
        </Animated.View>

        {/* Priority Selection */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.inputCard}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.priorityOption,
                    priority === option.value && {
                      backgroundColor: option.color + '20',
                      borderColor: option.color,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => {
                    setPriority(option.value);
                    handlePress();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.priorityEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.priorityLabel,
                      priority === option.value && { color: option.color, fontWeight: '700' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Category Selection */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.inputCard}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryOption,
                    category === option.value && styles.categoryOptionActive,
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
                      category === option.value && styles.categoryIconActive,
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={category === option.value ? colors.primary : colors.muted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === option.value && styles.categoryLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Location Input */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.inputCard}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Kitchen, Bedroom, Living Room"
              placeholderTextColor={colors.muted}
              value={location}
              onChangeText={setLocation}
              maxLength={50}
            />
            <Text style={styles.helperText}>Optional - Specify the exact location</Text>
          </Card>
        </Animated.View>

        {/* Photo Upload Section */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.inputCard}>
            <Text style={styles.label}>Photos</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleImagePick}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={32} color={colors.primary} />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <Text style={styles.helperText}>Upload up to 5 photos to help us understand the issue</Text>
          </Card>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Button
            title={isSubmitting ? 'Submitting...' : 'Submit Request'}
            onPress={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
            loading={isSubmitting}
            style={styles.submitButton}
            size="lg"
          />
        </Animated.View>

        <View style={{ height: spacing.xl }} />
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
    paddingTop: 180,
  },
  inputCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  helperText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  priorityOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  priorityEmoji: {
    fontSize: 20,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  categoryOption: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryOptionActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoryIconActive: {
    backgroundColor: colors.primaryMuted,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.primaryMuted,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  imagesScroll: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});

