import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
// Import components with relative paths
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { propertyService } from './propertyService';

// Define types locally to avoid module resolution issues
type PropertyStatus = 'vacant' | 'occupied' | 'maintenance';
type PropertyType = 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse' | 'commercial' | 'land' | 'other';

export interface Property {
  id: string;
  title: string;
  address: string;
  type: PropertyType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: PropertyStatus;
  description: string;
  features: string[];
  yearBuilt?: number;
  parkingSpaces?: number;
  image?: string;
}

export interface PropertyFormData {
  title: string;
  address: string;
  type: PropertyType;
  price: number | string;
  bedrooms: number | string;
  bathrooms: number | string;
  area: number | string;
  status: PropertyStatus;
  description: string;
  features: string[];
  yearBuilt?: number | string;
  parkingSpaces?: number | string;
  image?: string;
}

type PropertyFormProps = {
  property?: Property;
  initialData?: PropertyFormData;
  onSubmit?: (data: PropertyFormData) => Promise<void>;
  isSubmitting?: boolean;
  onSuccess?: () => void; // Keep for backward compatibility
};

export function PropertyForm({
  property,
  initialData,
  onSubmit: handleFormSubmit,
  isSubmitting: externalIsSubmitting = false,
  onSuccess
}: PropertyFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(externalIsSubmitting);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const uploadSchema = z.object({
    title: z.string().min(1, t('editProperty.form.validation.titleRequired')),
    type: z.string().min(1, t('editProperty.form.validation.typeRequired')),
    status: z.string().min(1, t('editProperty.form.validation.statusRequired')),
    price: z.string().min(1, t('editProperty.form.validation.priceRequired')),
    address: z.string().min(1, t('editProperty.form.validation.addressRequired')),
    description: z.string().min(1, t('editProperty.form.validation.descriptionRequired')),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    defaultValues: initialData || {
      title: '',
      address: '',
      type: 'apartment',
      price: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      status: 'vacant',
      description: '',
      features: [],
      yearBuilt: '',
      parkingSpaces: '',
      image: '',
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.image) {
        setPreviewImage(initialData.image);
      }
    }
  }, [initialData, reset]);

  useEffect(() => {
    // Load property types
    const loadPropertyTypes = async () => {
      try {
        const types = await propertyService.getPropertyTypes();
        setPropertyTypes(types);
      } catch (error) {
        console.error('Failed to load property types', error);
        toast.error('Failed to load property types');
      }
    };

    loadPropertyTypes();

    // If editing, load the property data
    if (property) {
      reset({
        ...property,
        price: property.price.toString(),
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        area: property.area.toString(),
        yearBuilt: property.yearBuilt?.toString() || '',
        parkingSpaces: property.parkingSpaces?.toString() || '',
      });
      if (property.image) {
        setPreviewImage(property.image);
      }
    }
  }, [property, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('editProperty.form.imageSizeError'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setValue('image' as keyof PropertyFormData, result);
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      // Convert string values to appropriate types
      const data: PropertyFormData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        bedrooms: parseInt(formData.bedrooms, 10) || 0,
        bathrooms: parseFloat(formData.bathrooms) || 0,
        area: parseInt(formData.area, 10) || 0,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt, 10) : undefined,
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces, 10) : undefined,
      };

      if (handleFormSubmit) {
        await handleFormSubmit(data);
      } else if (property) {
        await propertyService.updateProperty(property.id, data);
        toast.success(t('editProperty.success'));
        onSuccess?.();
      } else {
        await propertyService.createProperty(data);
        toast.success(t('editProperty.addSuccess'));
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error saving property:', error);
      if (!handleFormSubmit) {
        toast.error(t('editProperty.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="bg-white dark:bg-card p-6 rounded-lg shadow border border-gray-200 dark:border-border">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-foreground">{t('editProperty.form.basicInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">
                {t('editProperty.form.propertyTitle')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('title', { required: t('editProperty.form.validation.titleRequired') })}
                placeholder={t('editProperty.form.titlePlaceholder')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">
                  {typeof errors.image === 'string' ? errors.image : 'Invalid image'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">
                {t('editProperty.form.propertyType')} <span className="text-red-500">*</span>
              </label>
              <select
                {...register('type', { required: t('editProperty.form.validation.typeRequired') })}
                className={`block w-full rounded-md border border-input bg-background py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-foreground ${errors.type ? 'border-red-500' : ''}`}
              >
                <option value="">{t('editProperty.form.selectType')}</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`properties.types.${type}`) || type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">
                {t('editProperty.form.status')} <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status', { required: t('editProperty.form.validation.statusRequired') })}
                className={`block w-full rounded-md border border-input bg-background py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-foreground ${errors.status ? 'border-red-500' : ''}`}
                defaultValue="vacant"
              >
                <option value="vacant">{t('properties.status.vacant')}</option>
                <option value="occupied">{t('properties.status.occupied')}</option>
                <option value="maintenance">{t('properties.status.maintenance')}</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">
                {t('editProperty.form.price')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('price', { required: t('editProperty.form.validation.priceRequired') })}
                placeholder={t('editProperty.form.pricePlaceholder')}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>
        </div>



        {/* Address */}
        <div className="bg-white dark:bg-card p-6 rounded-lg shadow border border-gray-200 dark:border-border">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-foreground">{t('editProperty.form.address')}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">
              {t('editProperty.form.fullAddress')} <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('address', { required: t('editProperty.form.validation.addressRequired') })}
              placeholder={t('editProperty.form.addressPlaceholder')}
              className={`w-full rounded-md border border-input bg-background py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-foreground ${errors.address ? 'border-red-500' : ''}`}
              rows={2}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white dark:bg-card p-6 rounded-lg shadow border border-gray-200 dark:border-border">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-foreground">{t('editProperty.form.propertyImage')}</h3>
          <div className="mt-1 flex items-center">
            <label
              htmlFor="property-image"
              className="relative cursor-pointer rounded-md bg-white dark:bg-secondary font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span className="px-3 py-2">{t('editProperty.form.uploadImage')}</span>
              <input
                id="property-image"
                name="property-image"
                type="file"
                className="sr-only"
                onChange={handleImageChange}
                disabled={isSubmitting}
                accept="image/*"
              />
            </label>

          </div>

          {previewImage && (
            <div className="mt-4 relative">
              <div className="h-48 w-full rounded-md overflow-hidden bg-gray-100 dark:bg-secondary">
                <img
                  src={previewImage}
                  alt="Property preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setValue('image', '');
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-card p-6 rounded-lg shadow border border-gray-200 dark:border-border">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-foreground">{t('editProperty.form.description')}</h3>
          <div>
            <textarea
              {...register('description', { required: t('editProperty.form.validation.descriptionRequired') })}
              placeholder={t('editProperty.form.descriptionPlaceholder')}
              className={`min-h-[100px] w-full rounded-md border border-input bg-background py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-foreground ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-card p-6 rounded-lg shadow border border-gray-200 dark:border-border">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-foreground">{t('editProperty.form.features')}</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="feature-pool"
                type="checkbox"
                value="Swimming Pool"
                {...register('features')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="feature-pool" className="ml-2 block text-sm text-gray-700 dark:text-muted-foreground">
                {t('editProperty.form.featureList.pool')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="feature-gym"
                type="checkbox"
                value="Gym"
                {...register('features')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="feature-gym" className="ml-2 block text-sm text-gray-700 dark:text-muted-foreground">
                {t('editProperty.form.featureList.gym')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="feature-parking"
                type="checkbox"
                value="Parking"
                {...register('features')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="feature-parking" className="ml-2 block text-sm text-gray-700 dark:text-muted-foreground">
                {t('editProperty.form.featureList.parking')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="feature-laundry"
                type="checkbox"
                value="Laundry"
                {...register('features')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="feature-laundry" className="ml-2 block text-sm text-gray-700 dark:text-muted-foreground">
                {t('editProperty.form.featureList.laundry')}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          {t('editProperty.form.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {property || initialData ? t('editProperty.form.update') : t('editProperty.form.add')}
        </Button>
      </div>
    </form >
  );
}
