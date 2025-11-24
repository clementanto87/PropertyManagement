import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, CreditCard, PenTool, FileText, User, Users, Calendar, LogOut, Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function TenantLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleLogout = () => {
    signOut(); // This now clears localStorage too
    toast.success(t('common.loggedOut'));
    navigate('/auth/login', { replace: true });
  };

  const navigation = [
    { name: t('nav.home'), href: '/app', icon: Home },
    { name: t('nav.payments'), href: '/app/payments', icon: CreditCard },
    { name: t('nav.maintenance'), href: '/app/maintenance', icon: PenTool },
    { name: t('nav.community'), href: '/app/community', icon: Users },
    { name: t('nav.amenities'), href: '/app/amenities', icon: Calendar },
    { name: t('nav.documents'), href: '/app/documents', icon: FileText },
    { name: t('nav.profile'), href: '/app/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex flex-col font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col z-50">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-soft">
          <div className="flex flex-shrink-0 items-center px-6 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                P
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300">PropertyPro</h1>
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
                      ? 'bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400',
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
          <div className="p-4 border-t border-gray-200/60 dark:border-gray-800 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-3 h-5 w-5" />
                  {t('theme.lightMode')}
                </>
              ) : (
                <>
                  <Moon className="mr-3 h-5 w-5" />
                  {t('theme.darkMode')}
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:pl-72 transition-all duration-300">
        <main className="flex-1 pb-20 md:pb-8">
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
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg pb-safe md:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)]">
        <div className="flex h-20 items-center justify-around px-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center w-full h-full space-y-0.5 px-1 py-2 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg transition-colors',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-[2px] w-10 h-1 rounded-b-full bg-blue-600 dark:bg-blue-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    'h-6 w-6 transition-all duration-200 flex-shrink-0',
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 scale-110' 
                      : 'text-gray-500 dark:text-gray-500'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  'text-[11px] font-semibold leading-tight text-center',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
