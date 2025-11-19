import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Home,
  MapPin,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  Star,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ArrowUpDown,
  Home as HomeIcon,
  Building2,
  Building,
  Hotel,
  User,
  Bell,
  Settings,
  LayoutGrid,
  List
} from 'lucide-react';
import { Property, PropertyType } from '@/types/property';
import { api } from '@/lib/api';
import { propertyService } from '@/features/properties/propertyService';

// Mock data for property types
const propertyTypes = [
  { id: 'all', name: 'All Properties', icon: <HomeIcon className="w-5 h-5" /> },
  { id: 'apartment', name: 'Apartments', icon: <Building2 className="w-5 h-5" /> },
  { id: 'house', name: 'Houses', icon: <Home className="w-5 h-5" /> },
  { id: 'villa', name: 'Villas', icon: <Building className="w-5 h-5" /> },
  { id: 'condo', name: 'Condos', icon: <Hotel className="w-5 h-5" /> },
];

// Mock data for filters
const statusFilters = [
  { id: 'all', name: 'All Status' },
  { id: 'vacant', name: 'Vacant' },
  { id: 'occupied', name: 'Occupied' },
  { id: 'maintenance', name: 'Under Maintenance' },
];

const priceRanges = [
  { id: 'all', name: 'Any Price' },
  { id: '0-1000', name: 'Under $1,000' },
  { id: '1000-2000', name: '$1,000 - $2,000' },
  { id: '2000-3000', name: '$2,000 - $3,000' },
  { id: '3000+', name: 'Over $3,000' },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getProperties();
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || property.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || property.status === selectedStatus;

    let matchesPrice = true;
    if (selectedPrice !== 'all') {
      const [min, max] = selectedPrice.split('-').map(Number);
      if (selectedPrice.endsWith('+')) {
        matchesPrice = property.price >= Number(selectedPrice.replace('+', ''));
      } else if (!isNaN(min) && !isNaN(max)) {
        matchesPrice = property.price >= min && property.price <= max;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesPrice;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
      default:
        return 0; // In a real app, sort by creation date
    }
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedPrice('all');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Loading Properties</h2>
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
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Properties</h1>
                <p className="text-sm text-gray-500">Manage your property portfolio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <Link
                to="/dashboard/properties/add"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </Link>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="Search properties by name, address, or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${showFilters
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={toggleFilters}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </button>

              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </div>

              <div className="hidden sm:flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  type="button"
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Property Type</h3>
                  <div className="space-y-2">
                    {propertyTypes.map((type) => (
                      <label key={type.id} className="flex items-center group cursor-pointer">
                        <input
                          type="radio"
                          name="property-type"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={selectedType === type.id}
                          onChange={() => setSelectedType(type.id)}
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 flex items-center transition-colors">
                          <span className="mr-2 text-gray-400 group-hover:text-gray-600">{type.icon}</span>
                          {type.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
                  <div className="space-y-2">
                    {statusFilters.map((status) => (
                      <label key={status.id} className="flex items-center group cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={selectedStatus === status.id}
                          onChange={() => setSelectedStatus(status.id)}
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {status.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.id} className="flex items-center group cursor-pointer">
                        <input
                          type="radio"
                          name="price-range"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={selectedPrice === range.id}
                          onChange={() => setSelectedPrice(range.id)}
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {range.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors shadow-sm"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 mt-8">
        {/* Property Count and Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredProperties.length}</span> properties
          </p>
        </div>

        {/* Properties Grid/List */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              We couldn't find any properties matching your current filters. Try adjusting your search or clearing filters.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                onClick={resetFilters}
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedProperties.map((property) => (
              <PropertyListItem key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Property Card Component (Grid View)
function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={property.image}
          alt={property.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {property.featured && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Featured
          </div>
        )}
        <div className={`absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${property.status === 'vacant'
            ? 'bg-emerald-500/90 text-white'
            : property.status === 'occupied'
              ? 'bg-blue-500/90 text-white'
              : 'bg-amber-500/90 text-white'
          }`}>
          {property.status === 'vacant' ? 'Available' : property.status === 'occupied' ? 'Occupied' : 'Maintenance'}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{property.title}</h3>
          <p className="text-sm text-gray-500 flex items-center mt-1 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            {property.address}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-gray-50">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Beds</span>
            <div className="flex items-center font-semibold text-gray-700">
              <Bed className="h-4 w-4 mr-1.5 text-gray-400" />
              {property.bedrooms}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-r border-gray-50">
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Baths</span>
            <div className="flex items-center font-semibold text-gray-700">
              <Bath className="h-4 w-4 mr-1.5 text-gray-400" />
              {property.bathrooms}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Area</span>
            <div className="flex items-center font-semibold text-gray-700">
              <Ruler className="h-4 w-4 mr-1.5 text-gray-400" />
              {property.area}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium">Rent</p>
            <div className="text-xl font-bold text-gray-900">
              ${property.price.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span>
            </div>
          </div>
          <Link
            to={`/dashboard/properties/${property.id}`}
            className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// Property List Item Component (List View)
function PropertyListItem({ property }: { property: Property }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-48 sm:h-auto relative flex-shrink-0">
          <img
            className="h-full w-full object-cover"
            src={property.image}
            alt={property.title}
          />
          <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${property.status === 'vacant'
              ? 'bg-emerald-500/90 text-white'
              : property.status === 'occupied'
                ? 'bg-blue-500/90 text-white'
                : 'bg-amber-500/90 text-white'
            }`}>
            {property.status === 'vacant' ? 'Available' : property.status === 'occupied' ? 'Occupied' : 'Maintenance'}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{property.title}</h3>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  {property.address}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  ${property.price.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span>
                </div>
                {property.rating && (
                  <div className="flex items-center justify-end mt-1 text-sm text-gray-500">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-current mr-1" />
                    {property.rating}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">{property.bedrooms}</span> <span className="ml-1 text-gray-400">Beds</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">{property.bathrooms}</span> <span className="ml-1 text-gray-400">Baths</span>
              </div>
              <div className="flex items-center">
                <Ruler className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">{property.area}</span> <span className="ml-1 text-gray-400">sqft</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex space-x-2">
              {property.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  Featured
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
              </span>
            </div>

            <Link
              to={`/dashboard/properties/${property.id}`}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center"
            >
              View Details
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
