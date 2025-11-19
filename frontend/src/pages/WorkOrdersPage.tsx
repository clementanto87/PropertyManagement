import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
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
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type WorkOrderStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'URGENT';

type WorkOrder = {
  id: string;
  title: string;
  unitNumber: string;
  address: string;
  submittedBy: string;
  submittedDate: string;
  assignedTo?: string;
  status: WorkOrderStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: React.ReactNode;
};

type ListResponse<T> = { items: T[] };

// Premium placeholder data
const PLACEHOLDER_WORK_ORDERS: WorkOrder[] = [
  {
    id: '1',
    title: 'Leaky Faucet in Kitchen',
    unitNumber: 'Unit 4B',
    address: '123 Main St',
    submittedBy: 'Jane Doe',
    submittedDate: 'Oct 26',
    status: 'NEW',
    priority: 'MEDIUM',
    icon: <Droplet className="w-5 h-5" />
  },
  {
    id: '2',
    title: 'Heating Not Working',
    unitNumber: 'Unit 12A',
    address: '456 Oak Ave',
    submittedBy: 'John Smith',
    submittedDate: 'Oct 25',
    status: 'URGENT',
    priority: 'HIGH',
    icon: <Thermometer className="w-5 h-5" />
  },
  {
    id: '3',
    title: 'Broken Window Pane',
    unitNumber: 'Unit 7C',
    address: '789 Pine Ln',
    submittedBy: 'Emily White',
    submittedDate: 'Oct 24',
    assignedTo: 'ProGlass Repair',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    icon: <Square className="w-5 h-5" />
  },
  {
    id: '4',
    title: 'AC Unit Leaking',
    unitNumber: 'Unit 2B',
    address: '321 Maple Rd',
    submittedBy: 'Mike Brown',
    submittedDate: 'Oct 22',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    icon: <Snowflake className="w-5 h-5" />
  },
  {
    id: '5',
    title: 'Electrical Outlet Not Working',
    unitNumber: 'Unit 9D',
    address: '654 Elm St',
    submittedBy: 'Sarah Johnson',
    submittedDate: 'Oct 23',
    status: 'NEW',
    priority: 'HIGH',
    icon: <AlertCircle className="w-5 h-5" />
  },
  {
    id: '6',
    title: 'Broken Door Lock',
    unitNumber: 'Unit 15A',
    address: '987 Cedar Blvd',
    submittedBy: 'David Wilson',
    submittedDate: 'Oct 21',
    assignedTo: 'LockMaster Services',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    icon: <Wrench className="w-5 h-5" />
  }
];

const getStatusBadge = (status: WorkOrderStatus) => {
  switch (status) {
    case 'NEW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          <Clock className="w-3 h-3 mr-1" />
          New
        </span>
      );
    case 'URGENT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
          <AlertCircle className="w-3 h-3 mr-1" />
          Urgent
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
          <Wrench className="w-3 h-3 mr-1" />
          In Progress
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    default:
      return null;
  }
};

const getIconBackground = (status: WorkOrderStatus) => {
  switch (status) {
    case 'URGENT': return 'bg-red-50 text-red-600';
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600';
    case 'COMPLETED': return 'bg-emerald-50 text-emerald-600';
    default: return 'bg-blue-50 text-blue-600';
  }
};

export default function WorkOrdersPage() {
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
      const data = await api.get<ListResponse<any>>('/work-orders');
      if (data.items && data.items.length > 0) {
        const workOrders = data.items.map((wo: any) => ({
          id: wo.id,
          title: wo.title,
          unitNumber: wo.unitId ? `Unit ${wo.unitId.slice(-2)}` : 'Unit N/A',
          address: 'Property Address',
          submittedBy: 'Tenant',
          submittedDate: new Date(wo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          assignedTo: wo.vendorId ? 'Assigned Vendor' : undefined,
          status: (wo.status || 'NEW') as WorkOrderStatus,
          priority: 'MEDIUM' as const,
          icon: getWorkOrderIcon(wo.title)
        }));
        setItems(workOrders);
      } else {
        setItems(PLACEHOLDER_WORK_ORDERS);
      }
    } catch (err) {
      console.error('Failed to load work orders:', err);
      setItems(PLACEHOLDER_WORK_ORDERS);
    } finally {
      setLoading(false);
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

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'ALL' || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Loading Work Orders</h2>
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
                  <Wrench className="w-6 h-6 text-gray-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Work Orders</h1>
                <p className="text-sm text-gray-500">Manage maintenance requests and repairs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <Button
                onClick={() => navigate('/dashboard/work-orders/new')}
                className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                New Work Order
              </Button>
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
                placeholder="Search by tenant, unit, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200">
              {(['NEW', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === status
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                  {status === 'NEW' ? 'New' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="px-6 mt-8 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredItems.length}</span> requests
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No work orders found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery ? 'Try a different search term.' : 'No work orders match your current filter.'}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Button
                  onClick={() => navigate('/dashboard/work-orders/new')}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Create First Work Order
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
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-blue-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getIconBackground(order.status)} flex items-center justify-center flex-shrink-0`}>
                      {order.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {order.title}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium text-gray-700">{order.unitNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{order.submittedBy}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{order.submittedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {order.assignedTo && (
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {order.assignedTo.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{order.assignedTo}</span>
                      </div>
                    )}
                    <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
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
