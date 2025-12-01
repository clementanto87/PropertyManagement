import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Bell,
  Plus,
  Droplet,
  Thermometer,
  Square,
  Snowflake,
  AlertCircle,
  Wrench,
  Calendar,
  User,
  Building2,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  PauseCircle,
  UserPlus
} from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import { workOrderService, WorkOrder, WorkOrderStatus } from '@/api/workOrderService';
import { toast } from 'sonner';

const getStatusBadge = (status: WorkOrderStatus, t: any) => {
  switch (status) {
    case 'NEW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
          <Clock className="w-3 h-3 mr-1" />
          {t('workOrders.status.new')}
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
          <UserPlus className="w-3 h-3 mr-1" />
          {t('workOrders.status.assigned')}
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
          <Wrench className="w-3 h-3 mr-1" />
          {t('workOrders.status.inProgress')}
        </span>
      );
    case 'ON_HOLD':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
          <PauseCircle className="w-3 h-3 mr-1" />
          {t('workOrders.status.onHold')}
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {t('workOrders.status.completed')}
        </span>
      );
    default:
      return null;
  }
};

const getIconBackground = (status: WorkOrderStatus) => {
  switch (status) {
    case 'ON_HOLD': return 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
    case 'IN_PROGRESS': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
    case 'COMPLETED': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
    case 'ASSIGNED': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
    default: return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
  }
};

const getWorkOrderIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('faucet') || lowerTitle.includes('leak') || lowerTitle.includes('water')) {
    return <Droplet className="w-5 h-5" />;
  }
  if (lowerTitle.includes('heating') || lowerTitle.includes('heat')) {
    return <Thermometer className="w-5 h-5" />;
  }
  if (lowerTitle.includes('window')) {
    return <Square className="w-5 h-5" />;
  }
  if (lowerTitle.includes('ac') || lowerTitle.includes('cooling')) {
    return <Snowflake className="w-5 h-5" />;
  }
  if (lowerTitle.includes('electrical') || lowerTitle.includes('outlet')) {
    return <AlertCircle className="w-5 h-5" />;
  }
  if (lowerTitle.includes('door') || lowerTitle.includes('lock')) {
    return <Wrench className="w-5 h-5" />;
  }
  return <Wrench className="w-5 h-5" />;
};

export default function WorkOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<WorkOrderStatus | 'ALL'>('NEW');

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      const data = await workOrderService.getWorkOrders();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load work orders:', err);
      toast.error(t('workOrders.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.unit?.unitNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.unit?.property?.title || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'ALL' || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('workOrders.loading')}</h2>
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
                  <Wrench className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('workOrders.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('workOrders.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-border mx-1"></div>
              <Button
                onClick={() => navigate('/dashboard/work-orders/new')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('workOrders.newWorkOrder')}
              </Button>
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
                placeholder={t('workOrders.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-1 bg-accent/50 p-1 rounded-xl border border-border overflow-x-auto">
              {(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeFilter === status
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                >
                  {status === 'NEW' ? t('workOrders.status.new') : status === 'ASSIGNED' ? t('workOrders.status.assigned') : status === 'IN_PROGRESS' ? t('workOrders.status.inProgress') : t('workOrders.status.completed')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="px-6 mt-8 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t('workOrders.showing')} <span className="font-semibold text-foreground">{filteredItems.length}</span> {t('workOrders.requests')}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{t('workOrders.noWorkOrders')}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? t('workOrders.noWorkOrdersDescSearch') : t('workOrders.noWorkOrdersDescFilter')}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Button
                  onClick={() => navigate('/dashboard/work-orders/new')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {t('workOrders.createFirstWorkOrder')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/dashboard/work-orders/${order.id}`)}
                className="group bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getIconBackground(order.status)} flex items-center justify-center flex-shrink-0`}>
                      {getWorkOrderIcon(order.title)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {order.title}
                        </h3>
                        {getStatusBadge(order.status, t)}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
                        {order.unit && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium text-foreground">
                              {t('workOrders.unit')} {order.unit.unitNumber}
                              {order.unit.property && <span className="text-muted-foreground font-normal"> • {order.unit.property.title}</span>}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {order.vendor && (
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg border border-border">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                          {order.vendor.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{order.vendor.name}</span>
                      </div>
                    )}
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
