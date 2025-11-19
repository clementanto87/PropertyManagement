import { api } from '@/lib/api';
import { Property, PropertyFormData } from '@/types/property';

export const propertyService = {
  async getProperties(params?: Record<string, any>): Promise<Property[]> {
    const query = new URLSearchParams(params).toString();
    const response = await api.get<{ items: any[] }>(`/properties?${query}`);
    return response.items.map((item: any) => ({
      ...item,
      title: item.name, // Map backend 'name' to frontend 'title'
    }));
  },

  async getPropertyById(id: string): Promise<Property> {
    const item = await api.get<any>(`/properties/${id}`);
    return {
      ...item,
      title: item.name, // Map backend 'name' to frontend 'title'
    };
  },

  async createProperty(property: Omit<PropertyFormData, 'id'>): Promise<Property> {
    return api.post<Property>('/properties', property);
  },

  async updateProperty(id: string, property: Partial<PropertyFormData>): Promise<Property> {
    return api.patch<Property>(`/properties/${id}`, property);
  },

  async deleteProperty(id: string): Promise<void> {
    return api.delete(`/properties/${id}`);
  },

  async getPropertyTypes(): Promise<string[]> {
    return api.get<string[]>('/properties/types');
  }
};
