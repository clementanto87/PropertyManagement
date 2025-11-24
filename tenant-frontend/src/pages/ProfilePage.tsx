import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, Phone, Shield, LogOut, AlertCircle, Loader2, CheckCircle2, Bell, BellOff, Save, Globe, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { tenant } from '../services/api';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function ProfilePage() {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    marketing: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(profile);
  const [originalNotifications, setOriginalNotifications] = useState(notifications);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await tenant.getProfile();
        const profileData = {
          name: data.name || data.fullName || user?.fullName || '',
          email: data.userEmail || data.email || user?.email || '',
          phone: data.phone || '',
          emergencyContact: data.emergencyContact || ''
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
        
        // Load saved notification preferences from localStorage
        const savedNotifications = localStorage.getItem('tenant_notifications');
        if (savedNotifications) {
          try {
            const parsed = JSON.parse(savedNotifications);
            setNotifications(parsed);
            setOriginalNotifications(parsed);
          } catch (e) {
            // Use defaults if parsing fails
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch profile', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const profileChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    const notificationsChanged = JSON.stringify(notifications) !== JSON.stringify(originalNotifications);
    setHasChanges(profileChanged || notificationsChanged);
  }, [profile, notifications, originalProfile, originalNotifications]);

  const handleLogout = () => {
    signOut();
    toast.success('Logged out successfully');
    navigate('/auth/login', { replace: true });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await tenant.updateProfile({
        name: profile.name,
        phone: profile.phone,
        emergencyContact: profile.emergencyContact
      });
      
      // Save notification preferences
      localStorage.setItem('tenant_notifications', JSON.stringify(notifications));
      
      setOriginalProfile({ ...profile });
      setOriginalNotifications({ ...notifications });
      setHasChanges(false);
      toast.success(t('profile.profileUpdated'), {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });
    } catch (error: any) {
      console.error('Failed to update profile', error);
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('tenant_language', lang);
    toast.success(t('profile.profileUpdated'));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return !phone || phoneRegex.test(phone);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8 animate-in fade-in duration-500"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('profile.title')}</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">{t('profile.subtitle')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Info */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.personalInfo')}</CardTitle>
              <CardDescription>{t('profile.updateDetails')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('profile.fullName')}</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder={t('profile.fullNamePlaceholder')}
                    className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('profile.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-300 pl-9 pr-3 py-2 text-sm ring-offset-background cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.emailCannotChange')}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('profile.phone')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (validatePhone(value)) {
                          setProfile({ ...profile, phone: value });
                        }
                      }}
                      placeholder={t('profile.phonePlaceholder')}
                      className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('profile.emergencyContact')}</label>
                  <input
                    type="text"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                    placeholder={t('profile.emergencyContactPlaceholder')}
                    className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.emergencyContactDesc')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {hasChanges && <span className="text-orange-600 font-medium">{t('profile.unsavedChanges')}</span>}
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving || !hasChanges || !profile.name.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('profile.saving')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('profile.saveChanges')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Account Actions */}
          <motion.div variants={item}>
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <CardTitle className="text-red-900 dark:text-red-100">{t('profile.accountActions')}</CardTitle>
              </div>
                <CardDescription className="dark:text-red-200">{t('profile.manageSession')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t('profile.loggedIn')}
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                  {t('profile.signOut')}
              </Button>
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>

        {/* Sidebar Settings */}
        <motion.div variants={item} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                {t('profile.notifications')}
              </CardTitle>
              <CardDescription>{t('profile.chooseNotifications')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">{t('profile.emailNotifications')}</label>
                    {notifications.email ? (
                      <Bell className="h-4 w-4 text-green-500" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.emailDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-900 cursor-pointer">{t('profile.smsNotifications')}</label>
                    {notifications.sms ? (
                      <Bell className="h-4 w-4 text-green-500" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{t('profile.smsDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('sms')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.sms ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-900 cursor-pointer">{t('profile.marketing')}</label>
                    {notifications.marketing ? (
                      <Bell className="h-4 w-4 text-green-500" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{t('profile.marketingDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('marketing')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.marketing ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                {t('profile.language')}
              </CardTitle>
              <CardDescription>{t('profile.selectLanguage')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  i18n.language === 'en'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t('profile.english')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">English</div>
                  </div>
                  {i18n.language === 'en' && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('de')}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  i18n.language === 'de'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t('profile.german')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Deutsch</div>
                  </div>
                  {i18n.language === 'de' && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Theme Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-blue-600" />
                ) : (
                  <Sun className="h-5 w-5 text-blue-600" />
                )}
                {t('theme.title')}
              </CardTitle>
              <CardDescription>{t('theme.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                onClick={() => toggleTheme()}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t('theme.lightMode')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('theme.lightModeDesc')}</div>
                  </div>
                  {theme === 'light' && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => toggleTheme()}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t('theme.darkMode')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('theme.darkModeDesc')}</div>
                  </div>
                  {theme === 'dark' && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-blue-900 dark:text-blue-100">{t('profile.privacyPolicy')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                {t('profile.privacyDesc')}
              </p>
              <Button variant="link" className="p-0 h-auto text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                {t('profile.readPolicy')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
