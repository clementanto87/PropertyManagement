import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Building2, Users, BarChart3, LogOut, Wallet, MessageSquare } from 'lucide-react';
import { clearAuth } from '@/lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/dashboard/properties', icon: Building2 },
  { name: 'Tenants', href: '/dashboard/tenants', icon: Users },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Financials', href: '/dashboard/financials', icon: Wallet },
  { name: 'Communications', href: '/dashboard/communications', icon: MessageSquare },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hide menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { state: { message: 'You have been successfully logged out.' } });
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-28"
      onMouseEnter={() => setIsMenuVisible(true)}
    >
      <main>
        <Outlet />
      </main>

      {/* Auto-hiding Bottom Navigation */}
      <div 
        ref={menuRef}
        className={`fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t-2 border-gray-200/50 z-50 shadow-2xl transition-all duration-300 ease-in-out transform ${
          isMenuVisible ? 'translate-y-0' : 'translate-y-24'
        }`}
        onMouseEnter={() => setIsMenuVisible(true)}
        onMouseLeave={() => setIsMenuVisible(false)}
      >
        <div className="flex justify-around items-center gap-1 max-w-2xl mx-auto px-2 py-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/dashboard' && location.pathname === '/dashboard');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-blue-600 bg-gradient-to-b from-blue-50 to-indigo-50 scale-105' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
                <Icon 
                  className={`w-6 h-6 mb-1.5 transition-all ${
                    isActive 
                      ? 'text-blue-600 scale-110' 
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={`text-xs font-bold transition-all ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 text-red-500 hover:bg-red-50/50"
          >
            <LogOut className="w-6 h-6 mb-1.5" strokeWidth={2} />
            <span className="text-xs font-bold">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
