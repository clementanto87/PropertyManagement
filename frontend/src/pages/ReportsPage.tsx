import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, PieChart, LineChart, Download, Filter, Building2, DollarSign, Users, Home, User, Bell, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-component';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { propertyService } from '@/features/properties/propertyService';
import { Property } from '@/types/property';
import { workOrderService, WorkOrder } from '@/api/workOrderService';
import { expenseService, Expense } from '@/api/expenseService';
import { leaseService, Lease } from '@/api/leaseService';
import { api } from '@/lib/api';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Unit = {
  id: string;
  status: 'OCCUPIED' | 'VACANT' | 'MAINTENANCE';
  propertyId: string;
};

const ReportsPage = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [reportType, setReportType] = useState('financial');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [propsData, woData, expData, leaseData, unitsData] = await Promise.all([
        propertyService.getProperties(),
        workOrderService.getWorkOrders(),
        expenseService.getExpenses(),
        leaseService.getLeases(),
        api.get<{ items: Unit[] }>('/units')
      ]);
      setProperties(propsData || []);
      setWorkOrders(woData.items || []);
      setExpenses(expData.items || []);
      setLeases(leaseData.items || []);
      setUnits(unitsData.items || []);
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast.error(t('reports.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // --- Financial Metrics ---
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const monthlyIncome = leases
    .filter(l => l.status === 'ACTIVE')
    .reduce((sum, item) => sum + item.rentAmount, 0);
  const netProfit = monthlyIncome - totalExpenses;

  // --- Occupancy Metrics ---
  // Calculate based on fetched units
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // --- Maintenance Metrics ---
  // Map 'NEW' and 'ASSIGNED' to Pending concept
  const pendingRequests = workOrders.filter(wo => wo.status === 'NEW' || wo.status === 'ASSIGNED').length;
  // Map 'IN_PROGRESS' and 'ON_HOLD' to In Progress concept
  const inProgressRequests = workOrders.filter(wo => wo.status === 'IN_PROGRESS' || wo.status === 'ON_HOLD').length;
  const completedRequests = workOrders.filter(wo => wo.status === 'COMPLETED').length;

  // --- Charts Data ---
  const occupancyChartData = {
    labels: [t('reports.occupancy.occupied'), t('reports.occupancy.vacant')],
    datasets: [
      {
        data: [occupiedUnits, vacantUnits],
        backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(245, 158, 11, 0.6)'],
        borderColor: ['rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const maintenanceChartData = {
    labels: [t('reports.maintenance.pending'), t('reports.maintenance.inProgress'), t('reports.maintenance.completed')],
    datasets: [
      {
        label: t('reports.maintenance.workOrders'),
        data: [pendingRequests, inProgressRequests, completedRequests],
        backgroundColor: [
          'rgba(245, 158, 11, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'financial':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('reports.financial.projectedIncome')}</h3>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">${monthlyIncome.toLocaleString()}</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-muted-foreground">{t('reports.financial.monthlyProjection')}</span>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('reports.financial.totalExpenses')}</h3>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-muted-foreground">{t('reports.financial.allTime')}</span>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('reports.financial.netProfit')}</h3>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">${netProfit.toLocaleString()}</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-muted-foreground">{t('reports.financial.estimate')}</span>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">{t('reports.financial.incomeVsExpenses')}</h3>
              </div>
              <div className="h-80 flex justify-center items-center text-muted-foreground bg-muted/50 rounded-xl border border-border">
                <p>{t('reports.financial.chartComingSoon')}</p>
              </div>
            </div>
          </div>
        );

      case 'occupancy':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Occupied Units</h3>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Home className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{occupiedUnits}</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{occupancyRate}%</span>
                  <span className="text-xs text-gray-400 ml-2">occupancy rate</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Vacant Units</h3>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Home className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{vacantUnits}</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{100 - occupancyRate}%</span>
                  <span className="text-xs text-gray-400 ml-2">vacancy rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Occupancy Status</h3>
              </div>
              <div className="h-80 flex justify-center">
                <Pie data={occupancyChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{pendingRequests}</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{inProgressRequests}</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{completedRequests}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Maintenance Requests</h3>
                </div>
                <div className="space-y-4">
                  {workOrders.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600">
                          <Home className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.unit?.property?.title || 'Unknown Property'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${item.status === 'IN_PROGRESS' || item.status === 'ON_HOLD'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : item.status === 'NEW' || item.status === 'ASSIGNED'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {workOrders.length === 0 && <p className="text-center text-gray-400">No work orders found.</p>}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Status Distribution</h3>
                <div className="h-64 flex justify-center">
                  <Pie data={maintenanceChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('reports.loading')}</h2>
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
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('reports.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('reports.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-border mx-1"></div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {t('reports.exportReport')}
              </Button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-xl border border-border">
              <button
                onClick={() => setReportType('financial')}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  reportType === 'financial'
                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                {t('reports.tabs.financial')}
              </button>
              <button
                onClick={() => setReportType('occupancy')}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  reportType === 'occupancy'
                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Home className="mr-2 h-4 w-4" />
                {t('reports.tabs.occupancy')}
              </button>
              <button
                onClick={() => setReportType('maintenance')}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  reportType === 'maintenance'
                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Users className="mr-2 h-4 w-4" />
                {t('reports.tabs.maintenance')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select value={propertyFilter} onValueChange={(value) => setPropertyFilter(value)}>
                <SelectTrigger className="w-full sm:w-[200px] bg-background">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allProperties')}</SelectItem>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      'w-full sm:w-[240px] justify-start text-left font-normal bg-background',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, 'LLL dd, y')} -{' '}
                          {format(date.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(date.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>{t('reports.pickDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 mt-8 max-w-7xl mx-auto">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportsPage;
