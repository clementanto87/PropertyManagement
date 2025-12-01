// src/pages/FinancialsPage.tsx
import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Download,
  Filter,
  Search,
  Plus,
  BarChart2,
  User,
  Bell,
  ArrowRight
} from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
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
import { Bar, Doughnut } from 'react-chartjs-2';
import { expenseService, Expense } from '@/api/expenseService';
import { leaseService, Lease } from '@/api/leaseService';
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

const FinancialsPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rent' | 'expenses'>('overview');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, leasesData] = await Promise.all([
        expenseService.getExpenses(),
        leaseService.getLeases()
      ]);
      setExpenses(expensesData.items || []);
      setLeases(leasesData.items || []);
    } catch (error) {
      console.error('Failed to load financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Metrics
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Calculate Projected Monthly Income from Active Leases
  const monthlyIncome = leases
    .filter(l => l.status === 'ACTIVE')
    .reduce((sum, item) => sum + item.rentAmount, 0);

  const netOperatingIncome = monthlyIncome - totalExpenses; // Simplified for demo

  // Prepare Chart Data
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const OverviewTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Monthly Income', value: `$${monthlyIncome.toLocaleString()}`, change: 'Projected', icon: TrendingUp, trend: 'up', color: 'emerald' },
          { title: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, change: 'All Time', icon: DollarSign, trend: 'down', color: 'red' },
          { title: 'Net Operating Income', value: `$${netOperatingIncome.toLocaleString()}`, change: 'Estimate', icon: BarChart2, trend: netOperatingIncome >= 0 ? 'up' : 'down', color: netOperatingIncome >= 0 ? 'blue' : 'amber' },
          { title: 'Active Leases', value: leases.filter(l => l.status === 'ACTIVE').length, change: 'Current', icon: User, trend: 'neutral', color: 'purple' },
        ].map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <p className="text-2xl font-bold mt-2 text-gray-900">{item.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${item.color}-50 text-${item.color}-700`}>
                    {item.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                <item.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Expenses by Category</h3>
          <div className="h-64 flex justify-center">
            {Object.keys(expensesByCategory).length > 0 ? (
              <Doughnut data={expenseChartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No expense data available</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[...expenses].sort((a, b) => new Date(b.incurredAt).getTime() - new Date(a.incurredAt).getTime()).slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 text-red-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.category}</p>
                    <p className="text-xs text-gray-500">{item.property?.title || 'Unknown Property'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">-${item.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{new Date(item.incurredAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center text-gray-400 py-4">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Loading Financials</h2>
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
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Financials</h1>
                <p className="text-sm text-gray-500">Track income, expenses, and payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200">
            {['overview'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 mt-8 max-w-7xl mx-auto">
        {activeTab === 'overview' && <OverviewTab />}
      </div>
    </div>
  );
};

export default FinancialsPage;