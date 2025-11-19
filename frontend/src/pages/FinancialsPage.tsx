// src/pages/FinancialsPage.tsx
import { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  AlertCircle,
  Download,
  Filter,
  Search,
  Plus,
  Calendar,
  BarChart2,
  PieChart as PieChartIcon,
  ArrowRight,
  User,
  Bell,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
type ExpenseCategory = 'MAINTENANCE' | 'UTILITIES' | 'TAXES' | 'INSURANCE' | 'OTHER';

interface Payment {
  id: string;
  tenantName: string;
  property: string;
  unit: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  type: 'RENT' | 'FEE' | 'DEPOSIT';
  category?: string;
}

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  property: string;
  description: string;
  receipt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const FinancialsPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rent' | 'expenses'>('overview');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  // Mock data - replace with actual API calls
  const payments: Payment[] = [
    {
      id: '1',
      tenantName: 'John Doe',
      property: 'Sunset Villas',
      unit: 'A101',
      amount: 1500,
      dueDate: '2023-06-01',
      status: 'PAID',
      type: 'RENT'
    },
    {
      id: '2',
      tenantName: 'Jane Smith',
      property: 'Mountain View Apartments',
      unit: 'B205',
      amount: 1200,
      dueDate: '2023-06-05',
      status: 'PENDING',
      type: 'RENT'
    },
    {
      id: '3',
      tenantName: 'Michael Brown',
      property: 'Downtown Lofts',
      unit: '304',
      amount: 1800,
      dueDate: '2023-05-28',
      status: 'OVERDUE',
      type: 'RENT'
    }
  ];

  const expenses: Expense[] = [
    {
      id: '1',
      date: '2023-05-15',
      amount: 350,
      category: 'MAINTENANCE',
      property: 'Sunset Villas',
      description: 'Plumbing repair in unit A101',
      status: 'APPROVED'
    },
    {
      id: '2',
      date: '2023-05-20',
      amount: 150,
      category: 'UTILITIES',
      property: 'Mountain View Apartments',
      description: 'Water bill - May 2023',
      status: 'APPROVED'
    },
    {
      id: '3',
      date: '2023-06-02',
      amount: 1200,
      category: 'TAXES',
      property: 'Downtown Lofts',
      description: 'Property Tax Q2',
      status: 'PENDING'
    }
  ];

  const financialMetrics = {
    totalCollected: 12500,
    totalOutstanding: 3500,
    expenses: 4200,
    netIncome: 8300,
  };

  const OverviewTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Collected', value: `$${financialMetrics.totalCollected.toLocaleString()}`, change: '+12%', icon: TrendingUp, trend: 'up', color: 'emerald' },
          { title: 'Outstanding', value: `$${financialMetrics.totalOutstanding.toLocaleString()}`, change: '+5%', icon: AlertCircle, trend: 'down', color: 'amber' },
          { title: 'Expenses', value: `$${financialMetrics.expenses.toLocaleString()}`, change: '-2%', icon: DollarSign, trend: 'down', color: 'red' },
          { title: 'Net Income', value: `$${financialMetrics.netIncome.toLocaleString()}`, change: '+8%', icon: BarChart2, trend: 'up', color: 'blue' },
        ].map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <p className="text-2xl font-bold mt-2 text-gray-900">{item.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {item.change}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">vs last month</span>
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
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[...payments, ...expenses].sort((a, b) => new Date(b.date || b.dueDate).getTime() - new Date(a.date || a.dueDate).getTime()).slice(0, 5).map((item: any, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${item.type ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {item.type ? <ArrowRight className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.tenantName || item.description}</p>
                    <p className="text-xs text-gray-500">{item.property}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.type ? 'text-emerald-600' : 'text-red-600'}`}>
                    {item.type ? '+' : '-'}${item.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(item.date || item.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <p className="font-medium text-gray-900">Record Payment</p>
              <p className="text-xs text-gray-500 mt-1">Log a new rent payment</p>
            </button>
            <button className="p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all group text-left">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <p className="font-medium text-gray-900">Add Expense</p>
              <p className="text-xs text-gray-500 mt-1">Track property expenses</p>
            </button>
            <button className="p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <p className="font-medium text-gray-900">Export Report</p>
              <p className="text-xs text-gray-500 mt-1">Download financial summary</p>
            </button>
            <button className="p-4 rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all group text-left">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <p className="font-medium text-gray-900">Send Reminders</p>
              <p className="text-xs text-gray-500 mt-1">Notify overdue tenants</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const RentTab = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-gray-900">Rent Payments</h3>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenant..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full"
            />
          </div>
          <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs mr-3">
                      {payment.tenantName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{payment.tenantName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.property} <span className="text-gray-300 mx-1">•</span> {payment.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${payment.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payment.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${payment.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : payment.status === 'OVERDUE'
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                    {payment.status === 'PAID' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {payment.status === 'OVERDUE' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {payment.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                    {payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ExpensesTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Expense</h3>
          <button className="w-full py-8 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center group">
            <div className="p-3 bg-gray-100 rounded-full text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-900">Click to add expense</span>
            <span className="text-xs text-gray-500 mt-1">Upload receipt or enter manually</span>
          </button>
        </div>
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Recent Expenses</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <span>{expense.property}</span>
                      <span className="mx-1.5">•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">-${expense.amount.toLocaleString()}</p>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${expense.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : expense.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                    {expense.status.charAt(0) + expense.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 text-center">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Expenses</button>
          </div>
        </div>
      </div>
    </div>
  );

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
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Record Payment
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200">
            {['overview', 'rent', 'expenses'].map((tab) => (
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
        {activeTab === 'rent' && <RentTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </div>
    </div>
  );
};

export default FinancialsPage;