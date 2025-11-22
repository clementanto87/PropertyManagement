import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, CreditCard, PenTool, FileText, User, Users, Calendar, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function TenantLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  const navigation = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Payments', href: '/app/payments', icon: CreditCard },
    { name: 'Maintenance', href: '/app/maintenance', icon: PenTool },
    { name: 'Community', href: '/app/community', icon: Users },
    { name: 'Amenities', href: '/app/amenities', icon: Calendar },
    { name: 'Documents', href: '/app/documents', icon: FileText },
    { name: 'Profile', href: '/app/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col z-50">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-soft">
          <div className="flex flex-shrink-0 items-center px-6 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                P
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">PropertyPro</h1>
            </div>
          </div>
          <nav className="mt-6 flex-1 space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive
                      ? 'bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200/60">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:pl-72 transition-all duration-300">
        <main className="flex-1 pb-24 md:pb-8">
          <div className="py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-lg pb-safe md:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex h-16 items-center justify-around px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center w-full h-full space-y-1',
                  isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-[1px] w-8 h-1 rounded-b-full bg-blue-600"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn('h-6 w-6 transition-transform duration-200', isActive ? 'text-blue-600 -translate-y-0.5' : 'text-gray-400')}
                />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
