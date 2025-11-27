import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadDashboardData();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      const statsRes = await api.get<Metrics>('/dashboard/stats');
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

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const urgentCount = (metrics?.recentWorkOrders.filter(w => w.priority === 'URGENT' || w.priority === 'HIGH').length || 0);
  const expiringCount = metrics?.expiringLeases.length || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Overview of your property portfolio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Morning Briefing */}
          {(urgentCount > 0 || expiringCount > 0) && (
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">Morning Briefing</h3>
                <p className="text-sm text-indigo-700 mt-1">
                  You have <span className="font-bold">{expiringCount} leases expiring</span> soon
                  {urgentCount > 0 && <span> and <span className="font-bold">{urgentCount} urgent maintenance requests</span></span>} that need attention.
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button onClick={() => navigate('/dashboard/work-orders/new')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <Wrench className="w-4 h-4 text-gray-500" />
              New Request
            </button>
            <button onClick={() => navigate('/dashboard/payments')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <CreditCard className="w-4 h-4 text-gray-500" />
              Log Payment
            </button>
            <button onClick={() => navigate('/dashboard/tenants/new')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <User className="w-4 h-4 text-gray-500" />
              Add Tenant
            </button>
            <button onClick={() => navigate('/dashboard/properties/add')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <Building2 className="w-4 h-4 text-gray-500" />
              Add Property
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 mt-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Occupancy Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{metrics?.occupancyRate}%</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className={`flex items-center font-medium px-2 py-0.5 rounded ${metrics?.occupancyChange! >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {metrics?.occupancyChange! >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(metrics?.occupancyChange || 0)}%
              </span>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>

          {/* Rent Overdue Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Rent Overdue</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">${(metrics?.rentOverdue || 0).toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className={`flex items-center font-medium px-2 py-0.5 rounded ${metrics?.rentOverdueChange! <= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {metrics?.rentOverdueChange! <= 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                {Math.abs(metrics?.rentOverdueChange || 0)}%
              </span>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>

          {/* Open Requests Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Open Requests</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{metrics?.openRequests}</h3>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-emerald-600 flex items-center font-medium bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {metrics?.openRequestsChange}
              </span>
              <span className="text-gray-400 ml-2">resolved this week</span>
            </div>
          </div>
        </div>

        {/* Property Portfolio Map */}
        {metrics?.properties && metrics.properties.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Portfolio Map</h3>
              <p className="text-sm text-gray-500">Geographic distribution of your properties</p>
            </div>
            <div className="p-0">
              <PropertyMap properties={metrics.properties} />
            </div>
          </div>
        )}

        {/* Recent Activity & Expiring Leases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Maintenance */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Recent Maintenance</h3>
              <button onClick={() => navigate('/dashboard/work-orders')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="divide-y divide-gray-100">
              {metrics?.recentWorkOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No active maintenance requests</div>
              ) : (
                metrics?.recentWorkOrders.map((wo) => (
                  <div key={wo.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/work-orders/${wo.id}`)}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getMaintenanceIcon(wo.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900 truncate">{wo.title}</h4>
                          {getPriorityBadge(wo.priority)}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{wo.unitNumber ? `Unit ${wo.unitNumber}` : 'General Property'} • {wo.reportedDaysAgo} days ago</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expiring Leases */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Expiring Leases</h3>
              <button onClick={() => navigate('/dashboard/leases')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="divide-y divide-gray-100">
              {metrics?.expiringLeases.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No leases expiring in the next 30 days</div>
              ) : (
                metrics?.expiringLeases.map((lease) => (
                  <div key={lease.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/leases`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                          {lease.tenantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{lease.tenantName}</h4>
                          <p className="text-sm text-gray-500">{lease.unitNumber} • Ends {new Date(lease.leaseEnd).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">${lease.rentAmount.toLocaleString()}</div>
                        <div className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-1">
                          {lease.daysUntilExpiry} days left
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
