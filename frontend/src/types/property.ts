export type PropertyStatus = 'vacant' | 'occupied' | 'maintenance';
export type PropertyType = 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse' | 'commercial' | 'land' | 'other';

export interface Property {
  id: string;
  title: string;
  address: string;
  type: PropertyType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // in square feet
  status: PropertyStatus;
  rating?: number;
  image: string;
  description?: string;
  features?: string[];
  yearBuilt?: number;
  lastRenovated?: number;
  parkingSpaces?: number;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields can be added as needed
  // e.g., location coordinates, amenities, etc.
}

export interface PropertyFilters {
  searchQuery?: string;
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  // Add other form fields as needed
}
