import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  LogOut,
  Wallet,
  MessageSquare,
  FileText,
  Wrench,
  Briefcase,
  Receipt,
  Calendar as CalendarIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Shield,
  Mail,
} from 'lucide-react';
import { clearAuth } from '@/lib/auth';

import { useAuth, Role } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TENANT'] },
  { name: 'Properties', href: '/dashboard/properties', icon: Building2, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Tenants', href: '/dashboard/tenants', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Leases', href: '/dashboard/leases', icon: FileText, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Work Orders', href: '/dashboard/work-orders', icon: Wrench, roles: ['ADMIN', 'MANAGER', 'TENANT'] },
  { name: 'Vendors', href: '/dashboard/vendors', icon: Briefcase, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Payments', href: '/dashboard/payments', icon: Wallet, roles: ['ADMIN', 'MANAGER', 'TENANT'] },
  { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarIcon, roles: ['ADMIN', 'MANAGER', 'TENANT'] },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Communications', href: '/dashboard/communications', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'TENANT'] },
  { name: 'Email Templates', href: '/dashboard/email-templates', icon: Mail, roles: ['ADMIN', 'MANAGER'] },
  { name: 'GDPR Management', href: '/dashboard/gdpr', icon: Shield, roles: ['ADMIN', 'MANAGER'] },
];

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-[110] p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[100] h-screen transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-xl ${sidebarCollapsed ? 'w-20' : 'w-64'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">PropManager</h1>
                <p className="text-xs text-gray-500">Property Management</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          )}

          {/* Collapse Toggle Button (Desktop only) - In Header */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors group"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigation
              .filter(item => !item.roles || (user && item.roles.includes(user.role as Role)))
              .map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                    />
                    {!sidebarCollapsed && (
                      <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                        {item.name}
                      </span>
                    )}
                    {isActive && !sidebarCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </Link>
                );
              })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-red-600 hover:bg-red-50 ${sidebarCollapsed ? 'justify-center' : ''
              }`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[90]"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
