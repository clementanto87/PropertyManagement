import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  FileText,
  Calendar,
  Home
} from 'lucide-react';
import { leaseService, type Lease } from '@/api/leaseService';
import { NotificationBell } from '../components/layout/NotificationBell';

export default function LeasesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: leasesData, isLoading: loading } = useQuery({
    queryKey: ['leases'],
    queryFn: () => leaseService.getLeases(),
  });

  const filteredItems = leasesData?.items?.filter((lease: Lease) =>
    lease.tenant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lease.unit?.property?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lease.unit?.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('leases.loading')}</h2>
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
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('leases.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('leases.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-border mx-1"></div>
              <Link
                to="/dashboard/leases/new"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t('leases.createLease')}
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
                placeholder={t('leases.searchPlaceholder')}
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
                {t('leases.filters')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8">
        {/* Lease Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('leases.showing')} <span className="font-semibold text-foreground">{filteredItems.length}</span> {t('leases.leasesCount')}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{t('leases.noLeases')}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? t('leases.noLeasesDescSearch') : t('leases.noLeasesDescEmpty')}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Link
                  to="/dashboard/leases/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {t('leases.createFirstLease')}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('leases.table.tenantProperty')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('leases.table.term')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('leases.table.rentDeposit')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('leases.table.status')}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">{t('leases.table.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredItems.map((lease) => (
                    <tr key={lease.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{lease.tenant?.name || t('leases.table.unknownTenant')}</div>
                            <div className="text-sm text-muted-foreground">
                              {lease.unit?.property?.name} • {t('leases.table.unit')} {lease.unit?.unitNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-foreground">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 ml-5">
                          {t('leases.table.duration')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">${lease.rentAmount.toLocaleString()}{t('leases.table.monthlyRent')}</div>
                        <div className="text-xs text-muted-foreground">{t('leases.table.deposit')} ${lease.securityDeposit?.toLocaleString() ?? '0'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${lease.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                          lease.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                          }`}>
                          {lease.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/dashboard/leases/${lease.id}/agreement`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg transition-colors"
                            title={t('leases.table.viewAgreement')}
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          <button className="text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
