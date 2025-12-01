import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  User,
  Search,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  FileText,
  Clock,
  X,
  Send,
  ArrowLeft
} from 'lucide-react';

import { CommunicationList } from './CommunicationList';
import { MessagesView } from './MessagesView';
import { tenantService, type Tenant } from '@/api/tenantService';

type CommunicationType = 'all' | 'email' | 'call' | 'meeting' | 'note' | 'follow-up' | 'message';

export function CommunicationsPage() {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  // Default to 'message' since 'all' is removed/hidden
  const initialTab = searchParams.get('tab') as CommunicationType || 'message';
  const [activeTab, setActiveTab] = useState<CommunicationType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Tenant Filter State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenantId || '');

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (tenantId) {
      setSelectedTenantId(tenantId);
    }
  }, [tenantId]);

  const loadTenants = async () => {
    try {
      const response = await tenantService.getTenants({ limit: 100 });
      setTenants(response.items);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  // If not in dashboard context and no tenantId, show error (though routing should prevent this)
  if (!tenantId && !location.pathname.includes('/communications')) {
    return <div>{t('communications.errors.tenantNotFound')}</div>;
  }

  const tabs = [
    // 'All' tab removed as per user request
    { id: 'message', label: t('communications.tabs.messages'), icon: Send },
    { id: 'email', label: t('communications.tabs.emails'), icon: Mail },
    { id: 'call', label: t('communications.tabs.calls'), icon: Phone },
    { id: 'meeting', label: t('communications.tabs.meetings'), icon: Calendar },
    { id: 'note', label: t('communications.tabs.notes'), icon: FileText },
    { id: 'follow-up', label: t('communications.tabs.followUps'), icon: Clock },
  ];

  // Always show all tabs
  const visibleTabs = tabs;

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const hasActiveFilters = startDate || endDate || searchQuery;

  // Determine which tenant ID to use (URL param takes precedence if present, otherwise filter selection)
  const effectiveTenantId = tenantId || selectedTenantId;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Professional Sticky Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {tenantId && (
                <button
                  onClick={() => navigate(`/dashboard/tenants/${tenantId}`)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Back to Tenant Profile"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {tenantId ? t('communications.tenantTitle') : t('communications.title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {tenantId
                    ? t('communications.tenantSubtitle')
                    : t('communications.subtitle')}
                </p>
              </div>
            </div>

            {/* Tenant Selector (Only show if not on a specific tenant page) */}
            {!tenantId && (
              <div className="flex-1 max-w-xs mx-4">
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-foreground"
                >
                  <option value="">{t('communications.selectTenant')}</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Duplicate Bell Icon Removed Here */}

              {/* Global New Communication Button Removed */}
            </div>
          </div>

          {/* Tabs and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-xl overflow-x-auto max-w-full border border-border no-scrollbar">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CommunicationType)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('communications.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 bg-background focus:bg-card transition-colors text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 border rounded-lg text-muted-foreground bg-card transition-colors ${showFilters
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-border hover:bg-muted'
                  }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 border border-border rounded-lg text-muted-foreground bg-card hover:bg-muted transition-colors flex items-center gap-1"
                  title="Clear filters"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">{t('communications.clear')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 mt-8 max-w-5xl mx-auto">
        {activeTab === 'message' ? (
          effectiveTenantId ? (
            <MessagesView tenantId={effectiveTenantId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] bg-card rounded-xl border border-border shadow-sm">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">{t('communications.selectTenantTitle')}</h3>
              <p className="text-muted-foreground mt-1">{t('communications.selectTenantMessage')}</p>
            </div>
          )
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {activeTab === 'all' && t('communications.headers.allCommunications')}
                {activeTab === 'email' && t('communications.headers.emailHistory')}
                {activeTab === 'call' && t('communications.headers.callLogs')}
                {activeTab === 'meeting' && t('communications.headers.meetingNotes')}
                {activeTab === 'note' && t('communications.headers.internalNotes')}
                {activeTab === 'follow-up' && t('communications.headers.pendingFollowUps')}
              </h2>

              {effectiveTenantId && (
                <>
                  {activeTab === 'email' && (
                    <Link to={`/dashboard/tenants/${effectiveTenantId}/communications/new?type=email`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        <Mail className="w-4 h-4" />
                        {t('communications.actions.logEmail')}
                      </button>
                    </Link>
                  )}
                  {activeTab === 'call' && (
                    <Link to={`/dashboard/tenants/${effectiveTenantId}/communications/new?type=call`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                        <Phone className="w-4 h-4" />
                        {t('communications.actions.logCall')}
                      </button>
                    </Link>
                  )}
                  {activeTab === 'meeting' && (
                    <Link to={`/dashboard/tenants/${effectiveTenantId}/communications/new?type=meeting`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">
                        <Calendar className="w-4 h-4" />
                        {t('communications.actions.logMeeting')}
                      </button>
                    </Link>
                  )}
                  {activeTab === 'note' && (
                    <Link to={`/dashboard/tenants/${effectiveTenantId}/communications/new?type=note`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-sm">
                        <FileText className="w-4 h-4" />
                        {t('communications.actions.addNote')}
                      </button>
                    </Link>
                  )}
                </>
              )}
            </div>
            {showFilters && (
              <div className="px-6 py-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-sm font-medium text-foreground">{t('communications.filters.title')}</div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">{t('communications.filters.from')}</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-background text-foreground"
                    />
                    <span className="text-xs text-muted-foreground">{t('communications.filters.to')}</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="p-6">
              <CommunicationList
                tenantId={effectiveTenantId}
                filterType={activeTab === 'all' ? undefined : activeTab}
                showFollowUpOnly={activeTab === 'follow-up'}
                searchQuery={searchQuery}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
