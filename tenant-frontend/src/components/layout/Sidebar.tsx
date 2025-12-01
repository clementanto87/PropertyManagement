import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    CreditCard,
    PenTool,
    FileText,
    User,
    Users,
    Calendar,
    LogOut,
    Moon,
    Sun,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
    const location = useLocation();
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    const handleLogout = () => {
        signOut();
        toast.success(t('common.loggedOut'));
    };

    const navigation = [
        { name: t('nav.home'), href: '/app', icon: Home },
        { name: t('nav.payments'), href: '/app/payments', icon: CreditCard },
        { name: t('nav.maintenance'), href: '/app/maintenance', icon: PenTool },
        { name: t('nav.community'), href: '/app/community', icon: Users },
        { name: t('nav.amenities'), href: '/app/amenities', icon: Calendar },
        { name: t('nav.documents'), href: '/app/documents', icon: FileText },
        { name: 'Messages', href: '/app/messages', icon: MessageSquare },
        { name: t('nav.profile'), href: '/app/profile', icon: User },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
            {/* Logo Section */}
            <div className={cn(
                "flex items-center h-20 px-6",
                isCollapsed ? "justify-center px-2" : "justify-between"
            )}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
                        P
                    </div>
                    {!isCollapsed && (
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xl font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap"
                        >
                            PropertyPro
                        </motion.h1>
                    )}
                </div>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 mt-4 overflow-y-auto no-scrollbar">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => onClose()} // Close on mobile when clicked
                            className={cn(
                                "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative",
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon
                                className={cn(
                                    "flex-shrink-0 h-5 w-5 transition-colors duration-200",
                                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300",
                                    !isCollapsed && "mr-3"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {!isCollapsed && (
                                <span className="truncate">{item.name}</span>
                            )}
                            {isActive && !isCollapsed && (
                                <motion.div
                                    layoutId="sidebar-active-dot"
                                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 mt-auto space-y-2 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={toggleTheme}
                    className={cn(
                        "flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group",
                        isCollapsed && "justify-center"
                    )}
                    title={theme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}
                >
                    {theme === 'dark' ? (
                        <Sun className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    ) : (
                        <Moon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    )}
                    {!isCollapsed && (
                        <span>{theme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}</span>
                    )}
                </button>

                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center w-full px-3 py-3 text-sm font-medium text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group",
                        isCollapsed && "justify-center"
                    )}
                    title={t('nav.signOut')}
                >
                    <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span>{t('nav.signOut')}</span>}
                </button>

                {/* Collapse Toggle (Desktop Only) */}
                <button
                    onClick={toggleCollapse}
                    className="hidden md:flex items-center justify-center w-full p-2 mt-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    "hidden md:fixed md:inset-y-0 md:flex md:flex-col z-50 transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                <SidebarContent />
            </div>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] z-50 md:hidden"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
