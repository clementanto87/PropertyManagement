import { useState, useEffect } from 'react';
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
    return <div>Tenant not found</div>;
  }

  const tabs = [
    // 'All' tab removed as per user request
    { id: 'message', label: 'Messages', icon: Send },
    { id: 'email', label: 'Emails', icon: Mail },
    { id: 'call', label: 'Calls', icon: Phone },
    { id: 'meeting', label: 'Meetings', icon: Calendar },
    { id: 'note', label: 'Notes', icon: FileText },
    { id: 'follow-up', label: 'Follow-ups', icon: Clock },
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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Professional Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {tenantId && (
                <button
                  onClick={() => navigate(`/dashboard/tenants/${tenantId}`)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                  title="Back to Tenant Profile"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {tenantId ? 'Tenant Communications' : 'Communications'}
                </h1>
                <p className="text-sm text-gray-500">
                  {tenantId
                    ? 'Manage communications with this tenant'
                    : 'View and manage communications'}
                </p>
              </div>
            </div>

            {/* Tenant Selector (Only show if not on a specific tenant page) */}
            {!tenantId && (
              <div className="flex-1 max-w-xs mx-4">
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select a Tenant...</option>
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
            <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl overflow-x-auto max-w-full border border-gray-200 no-scrollbar">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CommunicationType)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search communications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 border rounded-lg text-gray-600 bg-white transition-colors ${showFilters
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1"
                  title="Clear filters"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Clear</span>
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
            <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Select a Tenant</h3>
              <p className="text-gray-500 mt-1">Please select a tenant to view their messages.</p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-gray-200 bg-gray-50/30 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {activeTab === 'all' && 'All Communications'}
                {activeTab === 'email' && 'Email History'}
                {activeTab === 'call' && 'Call Logs'}
                {activeTab === 'meeting' && 'Meeting Notes'}
                {activeTab === 'note' && 'Internal Notes'}
                {activeTab === 'follow-up' && 'Pending Follow-ups'}
              </h2>

              {effectiveTenantId && (
                <>
                  {activeTab === 'email' && (
                    <Link to={`/dashboard/tenants/${effectiveTenantId}/communications/new?type=email`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        <Mail className="w-4 h-4" />
                        Log Email
                      </button>
                    </Link>
                  )}
                  {activeTab === 'call' && (
                    <Link to={`/dashboard/tenants/${effectiveTenantId}/communications/new?type=call`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                        <Phone className="w-4 h-4" />
                        Log Call
                      </button>
                    </Link>
                  )}
                  {activeTab === 'meeting' && (
                    <Link to={`/dashboard/tenants/${effectiveTenantId}/communications/new?type=meeting`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">
                        <Calendar className="w-4 h-4" />
                        Log Meeting
                      </button>
                    </Link>
                  )}
                  {activeTab === 'note' && (
                    <Link to={`/dashboard/tenants/${effectiveTenantId}/communications/new?type=note`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                        <FileText className="w-4 h-4" />
                        Add Note
                      </button>
                    </Link>
                  )}
                </>
              )}
            </div>
            {showFilters && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-sm font-medium text-gray-700">Filters:</div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">From:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
