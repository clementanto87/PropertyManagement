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
  Calendar,
  User,
  Wrench,
  Home,
  Zap,
  Bell,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Clock,
  BarChart2,
  PieChart,
  CalendarDays,
  Building2,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  Printer,
  Share2,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Star,
  Heart,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronsUpDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  BarChart3,
  LineChart,
  PieChart as PieChartIcon,
  DollarSign as DollarSignIcon,
  CreditCard,
  Wallet,
  Home as HomeIcon,
  Building as BuildingIcon,
  Layers,
  LayoutGrid,
  List,
  Map,
  Menu,
  MessageCircle,
  Moon,
  Sun,
  SunMoon,
  Tag,
  Tags,
  Target,
  ThumbsUp,
  ThumbsDown,
  Timer,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  User as UserIcon,
  UserPlus,
  Users as UsersIcon,
  Video,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Wind,
  X,
  XOctagon,
  Youtube,
  ZoomIn,
  ZoomOut,
  type LucideIcon
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
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
  maintenanceCost: number;
  maintenanceCostChange: number;
  avgTimeToResolve: string;
  tenantSatisfaction: number;
  leaseRenewalRate: number;
};

type MaintenanceRequest = {
  id: string;
  title: string;
  unitNumber: string;
  reportedDaysAgo: number;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'SCHEDULED' | 'IN_REVIEW';
  icon: React.ReactNode;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  assignedTo?: string;
  images?: string[];
  description?: string;
};

type ExpiringLease = {
  id: string;
  tenantName: string;
  unitNumber: string;
  daysUntilExpiry: number;
  tenantInitials: string;
  rentAmount: number;
  leaseStart: string;
  leaseEnd: string;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'RENEWED' | 'TERMINATED';
  paymentStatus: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';
  propertyName: string;
  tenantEmail: string;
  tenantPhone: string;
};

// Premium placeholder data
const PLACEHOLDER_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: '1',
    title: 'Leaky Faucet in Kitchen',
    unitNumber: 'Unit 4B',
    reportedDaysAgo: 2,
    status: 'NEW',
    priority: 'MEDIUM',
    icon: <Droplet className="w-5 h-5 text-blue-500" />,
    category: 'Plumbing',
    assignedTo: 'John D.',
    description: 'Kitchen sink faucet leaking from the base',
    images: ['/placeholder-maintenance-1.jpg']
  },
  {
    id: '2',
    title: 'Broken Bedroom Window',
    unitNumber: 'Unit 12A',
    reportedDaysAgo: 5,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    icon: <Square className="w-5 h-5 text-amber-500" />,
    category: 'Windows/Doors',
    assignedTo: 'Mike T.',
    description: 'Cracked window in the master bedroom',
    images: ['/placeholder-window-1.jpg']
  },
  {
    id: '3',
    title: 'AC Unit Not Cooling',
    unitNumber: 'Unit 8C',
    reportedDaysAgo: 1,
    status: 'SCHEDULED',
    priority: 'HIGH',
    icon: <Snowflake className="w-5 h-5 text-cyan-500" />,
    category: 'HVAC',
    assignedTo: 'Sarah K.',
    description: 'AC not cooling below 78°F',
    images: ['/placeholder-ac-1.jpg']
  },
  {
    id: '4',
    title: 'Front Door Lock Broken',
    unitNumber: 'Unit 15D',
    reportedDaysAgo: 3,
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    icon: <Home className="w-5 h-5 text-rose-500" />,
    category: 'Locks',
    assignedTo: 'Alex R.',
    description: 'Key won\'t turn in the front door lock',
    images: ['/placeholder-lock-1.jpg']
  },
  {
    id: '5',
    title: 'Electrical Outlet Not Working',
    unitNumber: 'Unit 3A',
    reportedDaysAgo: 4,
    status: 'IN_REVIEW',
    priority: 'HIGH',
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    category: 'Electrical',
    assignedTo: 'James W.',
    description: 'Outlets in the living room not working',
    images: ['/placeholder-outlet-1.jpg']
  }
];

const PLACEHOLDER_LEASES: ExpiringLease[] = [
  {
    id: '1',
    tenantName: 'John Doe',
    unitNumber: 'Unit 7C',
    daysUntilExpiry: 25,
    tenantInitials: 'JD',
    rentAmount: 2500,
    leaseStart: '2023-01-15',
    leaseEnd: '2024-01-14',
    status: 'EXPIRING',
    paymentStatus: 'PAID',
    propertyName: 'Oakwood Apartments',
    tenantEmail: 'john.doe@example.com',
    tenantPhone: '(555) 123-4567'
  },
  {
    id: '2',
    tenantName: 'Jane Smith',
    unitNumber: 'Unit 14D',
    daysUntilExpiry: 45,
    tenantInitials: 'JS',
    rentAmount: 3200,
    leaseStart: '2022-11-01',
    leaseEnd: '2023-12-31',
    status: 'ACTIVE',
    paymentStatus: 'PAID',
    propertyName: 'Westside Complex',
    tenantEmail: 'jane.smith@example.com',
    tenantPhone: '(555) 234-5678'
  },
  {
    id: '3',
    tenantName: 'Michael Johnson',
    unitNumber: 'Unit 9B',
    daysUntilExpiry: 12,
    tenantInitials: 'MJ',
    rentAmount: 2800,
    leaseStart: '2023-02-10',
    leaseEnd: '2023-11-30',
    status: 'EXPIRING',
    paymentStatus: 'PARTIAL',
    propertyName: 'Oakwood Apartments',
    tenantEmail: 'michael.j@example.com',
    tenantPhone: '(555) 345-6789'
  },
  {
    id: '4',
    tenantName: 'Emily Williams',
    unitNumber: 'Unit 22A',
    daysUntilExpiry: 30,
    tenantInitials: 'EW',
    rentAmount: 3500,
    leaseStart: '2023-03-01',
    leaseEnd: '2024-02-29',
    status: 'ACTIVE',
    paymentStatus: 'OVERDUE',
    propertyName: 'Westside Complex',
    tenantEmail: 'emily.w@example.com',
    tenantPhone: '(555) 456-7890'
  }
];

// Chart data for occupancy trends
const occupancyData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Occupancy Rate %',
      data: [85, 87, 88, 89, 90, 92, 93, 94, 93, 94, 95, 95],
      borderColor: 'rgba(79, 70, 229, 0.8)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

// Chart data types
interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor: string | string[];
    tension?: number;
    fill?: boolean;
    borderWidth?: number;
    borderRadius?: number | { topLeft?: number; topRight?: number; bottomLeft?: number; bottomRight?: number };
    borderSkipped?: boolean | string;
    barPercentage?: number;
    categoryPercentage?: number;
  }>;
}

// Revenue chart data
const revenueData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Rent Collected',
      data: [45000, 48000, 50000, 52000, 54000, 56000],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderRadius: 4,
    },
    {
      label: 'Rent Overdue',
      data: [5000, 4500, 4000, 3500, 3000, 2500],
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderRadius: 4,
    },
  ],
};

// Maintenance priority distribution
const maintenanceData = {
  labels: ['Urgent', 'High', 'Medium', 'Low'],
  datasets: [
    {
      data: [2, 5, 8, 3],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderWidth: 0,
    },
  ],
};

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        drawBorder: false,
      },
      ticks: {
        callback: (value: any) => `${value}%`,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [expiringLeases, setExpiringLeases] = useState<ExpiringLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Check for dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch dashboard stats from the new endpoint
      try {
        const statsRes = await api.get<any>('/dashboard/stats');
        setMetrics({
          occupancyRate: statsRes.occupancyRate || 0,
          occupancyChange: statsRes.occupancyChange || 0,
          rentCollected: statsRes.rentCollected || 0,
          rentCollectedChange: statsRes.rentCollectedChange || 0,
          rentOverdue: statsRes.rentOverdue || 0,
          rentOverdueChange: statsRes.rentOverdueChange || 0,
          openRequests: statsRes.openRequests || 0,
          openRequestsChange: statsRes.openRequestsChange || 0,
          totalProperties: statsRes.totalProperties || 0,
          totalTenants: statsRes.totalTenants || 0,
          maintenanceCost: 12500,
          maintenanceCostChange: -5,
          avgTimeToResolve: '2.5 days',
          tenantSatisfaction: 92,
          leaseRenewalRate: 78
        });

        // Use recent work orders from stats if available
        if (statsRes.recentWorkOrders && statsRes.recentWorkOrders.length > 0) {
          const workOrders = statsRes.recentWorkOrders.map((wo: any, idx: number) => ({
            id: wo.id,
            title: wo.title,
            unitNumber: wo.unit?.unitNumber ? `Unit ${wo.unit.unitNumber}` : `Unit ${idx + 1}A`,
            reportedDaysAgo: Math.floor((Date.now() - new Date(wo.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
            status: (wo.status || 'NEW') as 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'SCHEDULED' | 'IN_REVIEW',
            priority: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 4)] as 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW',
            icon: getMaintenanceIcon(wo.title),
            category: wo.category || 'General',
            assignedTo: wo.assignedTo || 'Unassigned',
            description: wo.description || '',
            images: wo.images || []
          }));
          setMaintenance(workOrders);
        } else {
          setMaintenance(PLACEHOLDER_MAINTENANCE);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        // Fallback to placeholder metrics
        setMetrics({
          occupancyRate: 95,
          occupancyChange: 2,
          rentCollected: 125000,
          rentCollectedChange: 8,
          rentOverdue: 5500,
          rentOverdueChange: -1200,
          openRequests: 8,
          openRequestsChange: -1,
          totalProperties: 4,
          totalTenants: 187,
          maintenanceCost: 12500,
          maintenanceCostChange: -5,
          avgTimeToResolve: '2.5 days',
          tenantSatisfaction: 92,
          leaseRenewalRate: 78
        });
        setMaintenance(PLACEHOLDER_MAINTENANCE);
      }

      // Fetch leases separately
      try {
        const leasesRes = await api.get<{ items: any[] }>('/leases?limit=4');
        if (leasesRes.items && leasesRes.items.length > 0) {
          const leases = leasesRes.items.map((lease, idx) => {
            const startDate = new Date(lease.startDate || new Date().toISOString());
            const endDate = new Date(lease.endDate || new Date().setFullYear(new Date().getFullYear() + 1).toString());
            const today = new Date();
            const daysUntil = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'RENEWED' | 'TERMINATED' = daysUntil <= 30 ? 'EXPIRING' : 'ACTIVE';
            const paymentStatus = ['PAID', 'PARTIAL', 'OVERDUE', 'PENDING'][Math.floor(Math.random() * 4)] as 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';

            return {
              id: lease.id,
              tenantName: lease.tenantName || (lease.tenantId ? `Tenant ${lease.tenantId.slice(-4)}` : `Tenant ${idx + 1}`),
              unitNumber: lease.unitNumber || (lease.unitId ? `Unit ${lease.unitId.slice(-2)}` : `Unit ${idx + 7}C`),
              daysUntilExpiry: daysUntil > 0 ? daysUntil : Math.floor(Math.random() * 60) + 10,
              tenantInitials: lease.tenantName ? lease.tenantName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'TN',
              rentAmount: lease.rentAmount || 2500,
              leaseStart: lease.startDate || startDate.toISOString().split('T')[0],
              leaseEnd: lease.endDate || endDate.toISOString().split('T')[0],
              status,
              paymentStatus,
              propertyName: lease.propertyName || ['Oakwood Apartments', 'Westside Complex', 'Pineview Residences', 'Cedar Grove'][idx % 4],
              tenantEmail: lease.tenantEmail || `tenant${idx + 1}@example.com`,
              tenantPhone: lease.tenantPhone || `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
            };
          });
          setExpiringLeases(leases);
        } else {
          setExpiringLeases(PLACEHOLDER_LEASES);
        }
      } catch {
        setExpiringLeases(PLACEHOLDER_LEASES);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setMaintenance(PLACEHOLDER_MAINTENANCE);
      setExpiringLeases(PLACEHOLDER_LEASES);
      setMetrics({
        occupancyRate: 95,
        occupancyChange: 2,
        rentCollected: 125000,
        rentCollectedChange: 8,
        rentOverdue: 5500,
        rentOverdueChange: 1200,
        openRequests: 8,
        openRequestsChange: -1,
        totalProperties: 4,
        totalTenants: 187,
        maintenanceCost: 12500,
        maintenanceCostChange: -5,
        avgTimeToResolve: '2.5 days',
        tenantSatisfaction: 92,
        leaseRenewalRate: 78
      });
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('faucet') || lowerTitle.includes('leak') || lowerTitle.includes('water')) {
      return <Droplet className="w-5 h-5" />;
    }
    if (lowerTitle.includes('window')) {
      return <Square className="w-5 h-5" />;
    }
    if (lowerTitle.includes('ac') || lowerTitle.includes('cooling') || lowerTitle.includes('heating')) {
      return <Snowflake className="w-5 h-5" />;
    }
    if (lowerTitle.includes('door') || lowerTitle.includes('lock')) {
      return <Home className="w-5 h-5" />;
    }
    if (lowerTitle.includes('electrical') || lowerTitle.includes('outlet') || lowerTitle.includes('wiring')) {
      return <Zap className="w-5 h-5" />;
    }
    return <Wrench className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    const isNew = status === 'NEW';
    const isInProgress = status === 'IN_PROGRESS';

    if (isNew) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm">
          New
        </span>
      );
    }
    if (isInProgress) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm">
          In Progress
        </span>
      );
    }
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-sm">
        Completed
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'HIGH') {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
          High
        </span>
      );
    }
    if (priority === 'MEDIUM') {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
          Medium
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">
        Low
      </span>
    );
  };

  const getDaysColor = (days: number) => {
    if (days <= 15) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-400 dark:border-t-blue-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-blue-300 dark:border-t-blue-500 animate-spin" style={{ animationDuration: '2s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Preparing your property insights...</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      {/* Professional Header */}
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
                <h1 className="text-xl font-bold text-gray-900">Good Morning, Sarah</h1>
                <p className="text-sm text-gray-500">Here's what's happening with your properties today.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Refined Property Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-gray-800 transition-colors">
              All Properties
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all">
              Oakwood Apartments
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all">
              Westside Complex
            </button>
            <button className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 mt-8">
        {/* Professional Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <span className="text-emerald-600 flex items-center font-medium bg-emerald-50 px-2 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{metrics?.occupancyChange}%
              </span>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>

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
              <span className="text-emerald-600 flex items-center font-medium bg-emerald-50 px-2 py-0.5 rounded">
                <TrendingDown className="w-3 h-3 mr-1" />
                ${(Math.abs(metrics?.rentOverdueChange || 0)).toLocaleString()}
              </span>
              <span className="text-gray-400 ml-2">recovered</span>
            </div>
          </div>

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

        {/* Professional Occupancy Detail */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Occupancy Overview</h3>
              <p className="text-sm text-gray-500">Current tenant status across all properties</p>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline">
              View Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              {/* Simple CSS-based donut chart representation */}
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeDasharray="95, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-gray-900">95%</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  <span className="text-sm font-medium text-gray-500">Occupied Units</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">190</div>
                <div className="text-sm text-gray-400">Target: 195</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                  <span className="text-sm font-medium text-gray-500">Vacant Units</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">10</div>
                <div className="text-sm text-gray-400">Last month: 12</div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Pending Maintenance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pending Maintenance</h3>
              <p className="text-sm text-gray-500">Recent work orders requiring attention</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/work-orders')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All Requests
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {maintenance.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.priority === 'HIGH' || item.priority === 'URGENT' ? 'bg-red-50 text-red-600' :
                  item.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h4>
                    <span className="text-xs text-gray-500">{item.reportedDaysAgo}d ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{item.unitNumber}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.assignedTo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getPriorityBadge(item.priority)}
                  {getStatusBadge(item.status)}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Leases Expiring Soon */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Leases Expiring Soon</h3>
              <p className="text-sm text-gray-500">Upcoming lease renewals and expiries</p>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              View All Leases
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {expiringLeases.slice(0, 4).map((lease) => (
              <div
                key={lease.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-sm">
                  {lease.tenantInitials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">{lease.tenantName}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getDaysColor(lease.daysUntilExpiry)}`}>
                      Expires in {lease.daysUntilExpiry} days
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{lease.unitNumber}</span>
                    <span>•</span>
                    <span>${lease.rentAmount.toLocaleString()}/mo</span>
                    <span>•</span>
                    <span>{lease.propertyName}</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
