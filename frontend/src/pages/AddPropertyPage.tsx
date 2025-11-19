import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, User, Bell } from 'lucide-react';
import { propertyService } from '../features/properties/propertyService';
import { toast } from 'sonner';
import { PropertyForm, PropertyFormData } from '../features/properties/PropertyForm';

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<PropertyFormData | undefined>();
  const [loading, setLoading] = useState(!!id);

  const isEditMode = !!id;

  useEffect(() => {
    if (id) {
      loadPropertyData(id);
    }
  }, [id]);

  const loadPropertyData = async (propertyId: string) => {
    try {
      const property = await propertyService.getPropertyById(propertyId);
      setInitialData(property as PropertyFormData);
    } catch (error) {
      console.error('Error loading property:', error);
      toast.error('Failed to load property data');
      navigate('/dashboard/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      setIsSubmitting(true);
      if (isEditMode && id) {
        await propertyService.updateProperty(id, data);
        toast.success('Property updated successfully');
      } else {
        await propertyService.createProperty(data);
        toast.success('Property added successfully');
      }
      navigate('/dashboard/properties');
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} property. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Loading Property Data</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Professional Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Property' : 'Add New Property'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEditMode ? 'Update property information' : 'Create a new property listing'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl p-6 mt-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900">Property Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode
                ? 'Update the information below to modify this property.'
                : 'Please provide the information below to list a new property.'}
            </p>
          </div>
          <div className="p-6">
            <PropertyForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialData={initialData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
