import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
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
import { NotificationBell } from '../components/layout/NotificationBell';

type Tenant = { id: string; name: string; email?: string | null; phone?: string | null };

type ListResponse<T> = { items: T[] };

export default function TenantsPage() {
  const { t } = useTranslation();
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('tenants.loading')}</h2>
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
                <h1 className="text-xl font-bold text-foreground">{t('tenants.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('tenants.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-border mx-1"></div>
              <Link
                to="/dashboard/tenants/new"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                {t('tenants.addTenant')}
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
                placeholder={t('tenants.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('tenants.filters')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8">
        {/* Tenant Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('tenants.showing')} <span className="font-semibold text-foreground">{filteredItems.length}</span> {filteredItems.length === 1 ? t('tenants.count_one') : t('tenants.count_other')}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{t('tenants.noTenants')}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? t('tenants.noTenantsDescSearch') : t('tenants.noTenantsDescEmpty')}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Link
                  to="/dashboard/tenants/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {t('tenants.addFirstTenant')}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/dashboard/tenants/${tenant.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-muted-foreground font-bold text-lg border border-border group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tenant.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                          {t('tenants.activeLease')}
                        </div>
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    {tenant.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="w-8 flex justify-center">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="truncate">{tenant.email}</span>
                      </div>
                    )}
                    {tenant.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="w-8 flex justify-center">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-8 flex justify-center">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span>Sunset Villas - Unit A101</span>
                    </div>
                  </div>
                </div>
                <div className="bg-accent/50 px-6 py-3 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">{t('tenants.lastPayment')} {t('tenants.mockPaymentTime')}</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center group-hover:translate-x-1 transition-transform">
                    {t('tenants.viewProfile')} <ArrowRight className="w-4 h-4 ml-1" />
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
