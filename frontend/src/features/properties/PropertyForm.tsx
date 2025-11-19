import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, X, Upload } from 'lucide-react';
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
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(externalIsSubmitting);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
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
      toast.error('Image size should be less than 5MB');
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
        toast.success('Property updated successfully');
        onSuccess?.();
      } else {
        await propertyService.createProperty(data);
        toast.success('Property created successfully');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error saving property:', error);
      if (!handleFormSubmit) {
        toast.error('Failed to save property. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('title')}
                placeholder="e.g., Modern Downtown Apartment"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('type')}
                className={`block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${errors.type ? 'border-red-500' : ''}`}
              >
                <option value="">Select property type</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status')}
                className={`block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${errors.status ? 'border-red-500' : ''}`}
                defaultValue="vacant"
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('price')}
                placeholder="e.g., 250000"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('bedrooms')}
                placeholder="e.g., 3"
                className={errors.bedrooms ? 'border-red-500' : ''}
              />
              {errors.bedrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.5"
                {...register('bathrooms')}
                placeholder="e.g., 2.5"
                className={errors.bathrooms ? 'border-red-500' : ''}
              />
              {errors.bathrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (sq ft) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                {...register('area')}
                placeholder="e.g., 1500"
                className={errors.area ? 'border-red-500' : ''}
              />
              {errors.area && (
                <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <Input
                type="number"
                {...register('yearBuilt')}
                placeholder="e.g., 2020"
                className={errors.yearBuilt ? 'border-red-500' : ''}
              />
              {errors.yearBuilt && (
                <p className="mt-1 text-sm text-red-600">{errors.yearBuilt.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parking Spaces
              </label>
              <Input
                type="number"
                {...register('parkingSpaces')}
                placeholder="e.g., 2"
                className={errors.parkingSpaces ? 'border-red-500' : ''}
              />
              {errors.parkingSpaces && (
                <p className="mt-1 text-sm text-red-600">{errors.parkingSpaces.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Address</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('address')}
              placeholder="e.g., 123 Main St, Anytown, CA 12345"
              className={`w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${errors.address ? 'border-red-500' : ''}`}
              rows={2}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Property Image</h3>
          <div className="mt-1 flex items-center">
            <label
              htmlFor="property-image"
              className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload an image</span>
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
              <div className="h-48 w-full rounded-md overflow-hidden bg-gray-100">
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Description</h3>
          <div>
            <textarea
              {...register('description')}
              placeholder="Enter property description"
              className={`min-h-[100px] w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Features</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="feature-pool"
                type="checkbox"
                value="Swimming Pool"
                {...register('features')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="feature-pool" className="ml-2 block text-sm text-gray-700">
                Swimming Pool
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
              <label htmlFor="feature-gym" className="ml-2 block text-sm text-gray-700">
                Gym
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
              <label htmlFor="feature-parking" className="ml-2 block text-sm text-gray-700">
                Parking
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
              <label htmlFor="feature-laundry" className="ml-2 block text-sm text-gray-700">
                In-Unit Laundry
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
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {property || initialData ? 'Update Property' : 'Add Property'}
        </Button>
      </div>
    </form>
  );
}
