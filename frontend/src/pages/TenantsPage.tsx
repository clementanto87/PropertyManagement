import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  ArrowRight,
  User,
  Bell,
  Filter,
  MoreHorizontal,
  Building2,
  Calendar
} from 'lucide-react';

type Tenant = { id: string; name: string; email?: string | null; phone?: string | null };

type ListResponse<T> = { items: T[] };

export default function TenantsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<ListResponse<Tenant>>('/tenants');
        setItems(data.items);
      } catch (err) {
        console.error('Failed to load tenants:', err);
        // Use placeholder data
        setItems([
          { id: '1', name: 'Sarah Doe', email: 's.doe@email.com', phone: '(555) 867-5309' },
          { id: '2', name: 'John Smith', email: 'j.smith@email.com', phone: '(555) 123-4567' },
          { id: '3', name: 'Emily Johnson', email: 'e.johnson@email.com', phone: '(555) 987-6543' },
          { id: '4', name: 'Michael Brown', email: 'm.brown@email.com', phone: '(555) 456-7890' },
          { id: '5', name: 'Jessica Davis', email: 'j.davis@email.com', phone: '(555) 234-5678' },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Loading Tenants</h2>
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
                <h1 className="text-xl font-bold text-gray-900">Tenants</h1>
                <p className="text-sm text-gray-500">Manage your tenants and leases</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <Link
                to="/dashboard/tenants/new"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Tenant
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
                placeholder="Search tenants by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8">
        {/* Tenant Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredItems.length}</span> tenants
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No tenants found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery ? 'Try a different search term.' : 'Get started by adding your first tenant.'}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Link
                  to="/dashboard/tenants/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                >
                  Add First Tenant
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/dashboard/tenants/${tenant.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg border border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{tenant.name}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                          Active Lease
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-50">
                    {tenant.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 flex justify-center">
                          <Mail className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="truncate">{tenant.email}</span>
                      </div>
                    )}
                    {tenant.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 flex justify-center">
                          <Phone className="w-4 h-4 text-gray-400" />
                        </div>
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 flex justify-center">
                        <Building2 className="w-4 h-4 text-gray-400" />
                      </div>
                      <span>Sunset Villas - Unit A101</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Last payment: 2 days ago</span>
                  <span className="text-sm font-medium text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                    View Profile <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
