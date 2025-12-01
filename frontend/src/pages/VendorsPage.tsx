import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MoreHorizontal,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Filter,
  Trash2
} from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import { vendorService, Vendor } from '@/api/vendorService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function VendorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Vendor | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await vendorService.getVendors();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
      toast.error(t('vendors.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await vendorService.deleteVendor(selectedItem.id);
      setIsDeleteOpen(false);
      loadVendors();
      toast.success(t('vendors.deleteSuccess') || 'Vendor deleted successfully');
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      toast.error(t('vendors.deleteError') || 'Failed to delete vendor');
    }
  };

  const openDeleteModal = (item: Vendor) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('vendors.loading')}</h2>
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
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('vendors.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('vendors.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-border mx-1"></div>
              <Button
                onClick={() => navigate('/dashboard/vendors/new', { state: { returnTo: location.pathname } })}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('vendors.newVendor')}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm text-foreground"
                placeholder={t('vendors.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" />
              {t('vendors.filters')}
            </Button>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="px-6 mt-8 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('vendors.showing')} <span className="font-semibold text-foreground">{filteredItems.length}</span> {t('vendors.vendorsCount')}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{t('vendors.noVendors')}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? t('vendors.noVendorsDescSearch') : t('vendors.noVendorsDescEmpty')}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Button
                  onClick={() => navigate('/dashboard/vendors/new', { state: { returnTo: location.pathname } })}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {t('vendors.addVendor')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => navigate(`/dashboard/vendors/${vendor.id}/edit`, { state: { returnTo: location.pathname } })}
                className="group bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {vendor.name}
                      </h3>
                      {vendor.companyName && (
                        <p className="text-sm text-muted-foreground">{vendor.companyName}</p>
                      )}
                    </div>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </div>

                <div className="space-y-3 flex-1">
                  {vendor.category && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      <span>{vendor.category}</span>
                    </div>
                  )}

                  {vendor.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}

                  {vendor.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${vendor.insured
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                    }`}>
                    {vendor.insured ? (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        {t('vendors.insured')}
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3 h-3" />
                        {t('vendors.uninsured')}
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 -mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(vendor);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('vendors.deleteTitle') || 'Delete Vendor'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('vendors.deleteConfirmation') || `Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t('common.cancel') || 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('common.delete') || 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
