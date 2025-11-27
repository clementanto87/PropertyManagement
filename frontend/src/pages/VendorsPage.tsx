import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  User,
  Phone,
  Mail,
  Building2,
  MoreHorizontal,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Filter
} from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import { vendorService, Vendor } from '@/api/vendorService';
import { toast } from 'sonner';

export default function VendorsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await vendorService.getVendors();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Loading Vendors</h2>
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
                <h1 className="text-xl font-bold text-gray-900">Vendors</h1>
                <p className="text-sm text-gray-500">Manage service providers and contractors</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <Button
                onClick={() => navigate('/dashboard/vendors/new')}
                className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                New Vendor
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="Search by name, company, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 text-gray-600">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="px-6 mt-8 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredItems.length}</span> vendors
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery ? 'Try a different search term.' : 'Get started by adding your first vendor.'}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Button
                  onClick={() => navigate('/dashboard/vendors/new')}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Add Vendor
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => navigate(`/dashboard/vendors/${vendor.id}/edit`)}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-blue-200 cursor-pointer flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {vendor.name}
                      </h3>
                      {vendor.companyName && (
                        <p className="text-sm text-gray-500">{vendor.companyName}</p>
                      )}
                    </div>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </div>

                <div className="space-y-3 flex-1">
                  {vendor.category && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Wrench className="w-4 h-4 text-gray-400" />
                      <span>{vendor.category}</span>
                    </div>
                  )}

                  {vendor.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}

                  {vendor.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${vendor.insured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                    {vendor.insured ? (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        Insured
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3 h-3" />
                        Uninsured
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    Added {new Date(vendor.createdAt).toLocaleDateString()}
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
