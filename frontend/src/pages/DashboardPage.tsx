import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import {
  Droplet,
  Square,
  Snowflake,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  User,
  Wrench,
  Home,
  Zap,
  Bell,
  CheckCircle2,
  Settings,
  CreditCard,
  Users,
  Building2,
  Briefcase
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import PropertyMap from '../components/dashboard/PropertyMap';
import { NotificationBell } from '../components/layout/NotificationBell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-component";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

type Metrics = {
  occupancyRate: number;
  occupancyChange: number;
  rentCollected: number;
  rentCollectedChange: number;
  rentOverdue: number;
  rentOverdueChange: number;
  openRequests: number;
  openRequestsChange: number;
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  recentWorkOrders: MaintenanceRequest[];
  expiringLeases: ExpiringLease[];
  properties: Property[];
};

type Property = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'OCCUPIED' | 'VACANT' | 'PARTIAL';
  occupancyRate: number;
  image?: string | null;
  totalUnits?: number;
  vacantUnits?: number;
  occupiedUnits?: number;
  maintenanceCount?: number;
};

type PropertySummary = {
  id: string;
  name: string;
};

type MaintenanceRequest = {
  id: string;
  title: string;
  unitNumber: string;
  reportedDaysAgo: number;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'SCHEDULED' | 'IN_REVIEW';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  assignedTo?: string;
  images?: string[];
  description?: string;
  unit?: { unitNumber: string };
};

type ExpiringLease = {
  id: string;
  tenantName: string;
  unitNumber: string;
  daysUntilExpiry: number;
  rentAmount: number;
  leaseEnd: string;
  propertyName: string;
  tenantEmail: string;
  tenantPhone: string;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [properties, setProperties] = useState<PropertySummary[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPropertyId]);

  const fetchProperties = async () => {
    try {
      const data = await api.get<{ items: PropertySummary[] }>('/properties');
      setProperties(data.items);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const query = selectedPropertyId !== 'all' ? `?propertyId=${selectedPropertyId}` : '';
      const statsRes = await api.get<Metrics>(`/dashboard/stats${query}`);
      setMetrics(statsRes);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('faucet') || lowerTitle.includes('leak') || lowerTitle.includes('water')) return <Droplet className="w-5 h-5 text-blue-500" />;
    if (lowerTitle.includes('window')) return <Square className="w-5 h-5 text-amber-500" />;
    if (lowerTitle.includes('ac') || lowerTitle.includes('cooling') || lowerTitle.includes('heating')) return <Snowflake className="w-5 h-5 text-cyan-500" />;
    if (lowerTitle.includes('door') || lowerTitle.includes('lock')) return <Home className="w-5 h-5 text-rose-500" />;
    if (lowerTitle.includes('electrical') || lowerTitle.includes('outlet') || lowerTitle.includes('wiring')) return <Zap className="w-5 h-5 text-yellow-500" />;
    return <Wrench className="w-5 h-5 text-gray-500" />;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      URGENT: 'bg-red-100 text-red-700 border-red-200',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      LOW: 'bg-green-100 text-green-700 border-green-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[priority as keyof typeof colors] || colors.LOW}`}>
        {priority}
      </span>
    );
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const urgentCount = (metrics?.recentWorkOrders.filter(w => w.priority === 'URGENT' || w.priority === 'HIGH').length || 0);
  const expiringCount = metrics?.expiringLeases.length || 0;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                  <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('dashboard.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('dashboard.welcome')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <NotificationBell />
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent text-sm font-medium text-foreground transition-colors">
                <Settings className="w-4 h-4" />
                {t('common.settings')}
              </button>
            </div>
          </div>

          {/* Morning Briefing */}
          {(urgentCount > 0 || expiringCount > 0) && (
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">{t('dashboard.morningBriefing')}</h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                  {t('dashboard.youHave')} <span className="font-bold">{expiringCount} {t('dashboard.leasesExpiringSoon')}</span>
                  {urgentCount > 0 && <span> {t('dashboard.and')} <span className="font-bold">{urgentCount} {t('dashboard.urgentMaintenance')}</span></span>} {t('dashboard.needAttention')}.
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button onClick={() => navigate('/dashboard/work-orders/new')} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all shadow-sm">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              {t('dashboard.newRequest')}
            </button>
            <button onClick={() => navigate('/dashboard/payments')} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all shadow-sm">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              {t('dashboard.logPayment')}
            </button>
            <button onClick={() => navigate('/dashboard/tenants/new')} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all shadow-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              {t('dashboard.addTenant')}
            </button>
            <button onClick={() => navigate('/dashboard/properties/add')} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all shadow-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              {t('dashboard.addProperty')}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 mt-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portfolio Card */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.portfolio')}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{metrics?.totalProperties || 0}</h3>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">
                {metrics?.totalUnits || 0} {t('dashboard.units')} • {metrics?.totalTenants || 0} {t('dashboard.tenants')}
              </span>
            </div>
          </div>

          {/* Occupancy Card */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.occupancy')}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{metrics?.occupancyRate}%</h3>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className={`flex items-center font-medium px-2 py-0.5 rounded ${metrics?.occupancyChange! >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                {metrics?.occupancyChange! >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(metrics?.occupancyChange || 0)}%
              </span>
              <span className="text-muted-foreground ml-2">{t('dashboard.vsLastMonth')}</span>
            </div>
          </div>

          {/* Rent Overdue Card */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.revenue')}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">${(metrics?.rentOverdue || 0).toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className={`flex items-center font-medium px-2 py-0.5 rounded ${metrics?.rentOverdueChange! <= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                {metrics?.rentOverdueChange! <= 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                {Math.abs(metrics?.rentOverdueChange || 0)}%
              </span>
              <span className="text-muted-foreground ml-2">{t('dashboard.vsLastMonth')}</span>
            </div>
          </div>

          {/* Open Requests Card */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.maintenance')}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{metrics?.openRequests}</h3>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {metrics?.openRequestsChange}
              </span>
              <span className="text-muted-foreground ml-2">{t('dashboard.resolvedThisWeek')}</span>
            </div>
          </div>
        </div>

        {/* Property Portfolio Map */}
        {metrics?.properties && metrics.properties.length > 0 && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground">{t('dashboard.portfolioMap')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.portfolioMapDesc')}</p>
            </div>
            <div className="p-0">
              <PropertyMap properties={metrics.properties} />
            </div>
          </div>
        )}

        {/* Recent Activity & Expiring Leases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Maintenance */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-foreground">{t('dashboard.recentMaintenance')}</h3>
              <button onClick={() => navigate('/dashboard/work-orders')} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">{t('dashboard.viewAll')}</button>
            </div>
            <div className="divide-y divide-border">
              {metrics?.recentWorkOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">{t('dashboard.noActiveRequests')}</div>
              ) : (
                metrics?.recentWorkOrders.map((wo) => (
                  <div key={wo.id} className="p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/work-orders/${wo.id}`)}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent rounded-lg">
                        {getMaintenanceIcon(wo.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-foreground truncate">{wo.title}</h4>
                          {getPriorityBadge(wo.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{wo.unitNumber ? `${t('dashboard.unit')} ${wo.unitNumber}` : t('dashboard.generalProperty')} • {wo.reportedDaysAgo} {t('dashboard.daysAgo')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expiring Leases */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-foreground">{t('dashboard.expiringLeases')}</h3>
              <button onClick={() => navigate('/dashboard/leases')} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">{t('dashboard.viewAll')}</button>
            </div>
            <div className="divide-y divide-border">
              {metrics?.expiringLeases.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">{t('dashboard.noExpiringLeases')}</div>
              ) : (
                metrics?.expiringLeases.map((lease) => (
                  <div key={lease.id} className="p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/leases`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">
                          {lease.tenantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{lease.tenantName}</h4>
                          <p className="text-sm text-muted-foreground">{lease.unitNumber} • {t('dashboard.ends')} {new Date(lease.leaseEnd).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">${lease.rentAmount.toLocaleString()}</div>
                        <div className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full inline-block mt-1">
                          {lease.daysUntilExpiry} {t('dashboard.daysLeft')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
