import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { workOrderService, WorkOrder, WorkOrderStatus } from '@/api/workOrderService';
import { toast } from 'sonner';

const getStatusBadge = (status: WorkOrderStatus) => {
  switch (status) {
    case 'NEW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          <Clock className="w-3 h-3 mr-1" />
          New
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
          <UserPlus className="w-3 h-3 mr-1" />
          Assigned
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
          <Wrench className="w-3 h-3 mr-1" />
          In Progress
        </span>
      );
    case 'ON_HOLD':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
          <PauseCircle className="w-3 h-3 mr-1" />
          On Hold
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
    case 'ON_HOLD': return 'bg-orange-50 text-orange-600';
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600';
    case 'COMPLETED': return 'bg-emerald-50 text-emerald-600';
    case 'ASSIGNED': return 'bg-purple-50 text-purple-600';
    default: return 'bg-blue-50 text-blue-600';
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
      toast.error('Failed to load work orders');
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
                placeholder="Search by title, unit, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200 overflow-x-auto">
              {(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeFilter === status
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                  {status === 'NEW' ? 'New' : status === 'ASSIGNED' ? 'Assigned' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
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
                      {getWorkOrderIcon(order.title)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {order.title}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
                        {order.unit && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium text-gray-700">
                              Unit {order.unit.unitNumber}
                              {order.unit.property && <span className="text-gray-500 font-normal"> • {order.unit.property.title}</span>}
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
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {order.vendor.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{order.vendor.name}</span>
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
