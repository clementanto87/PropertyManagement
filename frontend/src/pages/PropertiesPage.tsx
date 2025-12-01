import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { NotificationBell } from '../components/layout/NotificationBell';
import { Property, PropertyType } from '@/types/property';
import { api } from '@/lib/api';
import { propertyService } from '@/features/properties/propertyService';

export default function PropertiesPage() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for property types
  const propertyTypes = [
    { id: 'all', name: t('properties.types.all'), icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'apartment', name: t('properties.types.apartment'), icon: <Building2 className="w-5 h-5" /> },
    { id: 'house', name: t('properties.types.house'), icon: <Home className="w-5 h-5" /> },
    { id: 'villa', name: t('properties.types.villa'), icon: <Building className="w-5 h-5" /> },
    { id: 'condo', name: t('properties.types.condo'), icon: <Hotel className="w-5 h-5" /> },
  ];

  // Mock data for filters
  const statusFilters = [
    { id: 'all', name: t('properties.status.all') },
    { id: 'vacant', name: t('properties.status.vacant') },
    { id: 'occupied', name: t('properties.status.occupied') },
    { id: 'maintenance', name: t('properties.status.maintenance') },
  ];

  const priceRanges = [
    { id: 'all', name: t('properties.price.all') },
    { id: '0-1000', name: t('properties.price.under1000') },
    { id: '1000-2000', name: t('properties.price.1000to2000') },
    { id: '2000-3000', name: t('properties.price.2000to3000') },
    { id: '3000+', name: t('properties.price.over3000') },
  ];

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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('properties.loading')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Professional Sticky Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center border border-border">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('properties.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('properties.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-border mx-1"></div>
              <Link
                to="/dashboard/properties/add"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t('properties.addProperty')}
              </Link>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm text-foreground"
                placeholder={t('properties.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${showFilters
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                  : 'bg-card border-border text-foreground hover:bg-accent'
                  }`}
                onClick={toggleFilters}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t('properties.filters')}
                {showFilters ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </button>

              <div className="relative">
                <select
                  className="appearance-none bg-card border border-border text-foreground py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium cursor-pointer hover:bg-accent transition-colors"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">{t('properties.sort.newest')}</option>
                  <option value="price-asc">{t('properties.sort.priceLowHigh')}</option>
                  <option value="price-desc">{t('properties.sort.priceHighLow')}</option>
                  <option value="rating">{t('properties.sort.rating')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </div>

              <div className="hidden sm:flex bg-muted p-1 rounded-lg border border-border">
                <button
                  type="button"
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
            <div className="mt-4 bg-muted/50 p-6 rounded-xl border border-border animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('properties.labels.propertyType')}</h3>
                  <div className="space-y-2">
                    {propertyTypes.map((type) => (
                      <label key={type.id} className="flex items-center group cursor-pointer">
                        <input
                          type="radio"
                          name="property-type"
                          className="h-4 w-4 text-primary focus:ring-primary border-input bg-card"
                          checked={selectedType === type.id}
                          onChange={() => setSelectedType(type.id)}
                        />
                        <span className="ml-3 text-sm text-foreground group-hover:text-primary flex items-center transition-colors">
                          <span className="mr-2 text-muted-foreground group-hover:text-primary">{type.icon}</span>
                          {type.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('properties.labels.status')}</h3>
                  <div className="space-y-2">
                    {statusFilters.map((status) => (
                      <label key={status.id} className="flex items-center group cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          className="h-4 w-4 text-primary focus:ring-primary border-input bg-card"
                          checked={selectedStatus === status.id}
                          onChange={() => setSelectedStatus(status.id)}
                        />
                        <span className="ml-3 text-sm text-foreground group-hover:text-primary transition-colors">
                          {status.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('properties.labels.priceRange')}</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.id} className="flex items-center group cursor-pointer">
                        <input
                          type="radio"
                          name="price-range"
                          className="h-4 w-4 text-primary focus:ring-primary border-input bg-card"
                          checked={selectedPrice === range.id}
                          onChange={() => setSelectedPrice(range.id)}
                        />
                        <span className="ml-3 text-sm text-foreground group-hover:text-primary transition-colors">
                          {range.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-border text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  onClick={resetFilters}
                >
                  {t('properties.resetFilters')}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-sm"
                  onClick={() => setShowFilters(false)}
                >
                  {t('properties.applyFilters')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 mt-8">
        {/* Property Count and Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('properties.showing')} <span className="font-semibold text-foreground">{filteredProperties.length}</span> {t('properties.propertiesCount')}
          </p>
        </div>

        {/* Properties Grid/List */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{t('properties.noProperties')}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {t('properties.noPropertiesDesc')}
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                onClick={resetFilters}
              >
                {t('properties.clearFilters')}
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
  const { t } = useTranslation();
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={property.image}
          alt={property.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {property.featured && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {t('properties.featured')}
          </div>
        )}
        <div className={`absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${property.status === 'vacant'
          ? 'bg-emerald-500/90 text-white'
          : property.status === 'occupied'
            ? 'bg-blue-500/90 text-white'
            : 'bg-amber-500/90 text-white'
          }`}>
          {property.status === 'vacant' ? t('properties.available') : property.status === 'occupied' ? t('properties.occupied') : t('properties.maintenance')}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center mt-1 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            {property.address}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-border">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('properties.beds')}</span>
            <div className="flex items-center font-semibold text-foreground">
              <Bed className="h-4 w-4 mr-1.5 text-muted-foreground" />
              {property.bedrooms}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-r border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('properties.baths')}</span>
            <div className="flex items-center font-semibold text-foreground">
              <Bath className="h-4 w-4 mr-1.5 text-muted-foreground" />
              {property.bathrooms}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('properties.area')}</span>
            <div className="flex items-center font-semibold text-foreground">
              <Ruler className="h-4 w-4 mr-1.5 text-muted-foreground" />
              {property.area}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">{t('properties.rent')}</p>
            <div className="text-xl font-bold text-foreground">
              ${property.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
          </div>
          <Link
            to={`/dashboard/properties/${property.id}`}
            className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent/80 transition-colors"
          >
            {t('properties.details')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Property List Item Component (List View)
function PropertyListItem({ property }: { property: Property }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
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
            {property.status === 'vacant' ? t('properties.available') : property.status === 'occupied' ? t('properties.occupied') : t('properties.maintenance')}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{property.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  {property.address}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-foreground">
                  ${property.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                {property.rating && (
                  <div className="flex items-center justify-end mt-1 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-current mr-1" />
                    {property.rating}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium text-foreground">{property.bedrooms}</span> <span className="ml-1">{t('properties.beds')}</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium text-foreground">{property.bathrooms}</span> <span className="ml-1">{t('properties.baths')}</span>
              </div>
              <div className="flex items-center">
                <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium text-foreground">{property.area}</span> <span className="ml-1">{t('properties.sqft')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <div className="flex space-x-2">
              {property.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                  {t('properties.featured')}
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
              </span>
            </div>

            <Link
              to={`/dashboard/properties/${property.id}`}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center"
            >
              {t('properties.viewDetails')}
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
