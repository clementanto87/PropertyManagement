import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  Plus,
  User,
  Bell,
  Search,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  FileText,
  Clock,
  X
} from 'lucide-react';

import { CommunicationList } from './CommunicationList';

type CommunicationType = 'all' | 'email' | 'call' | 'meeting' | 'note' | 'follow-up';

export function CommunicationsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<CommunicationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // If not in dashboard context and no tenantId, show error (though routing should prevent this)
  if (!tenantId && !location.pathname.includes('/communications')) {
    return <div>Tenant not found</div>;
  }

  const tabs = [
    { id: 'all', label: 'All', icon: MessageSquare },
    { id: 'email', label: 'Emails', icon: Mail },
    { id: 'call', label: 'Calls', icon: Phone },
    { id: 'meeting', label: 'Meetings', icon: Calendar },
    { id: 'note', label: 'Notes', icon: FileText },
    { id: 'follow-up', label: 'Follow-ups', icon: Clock },
  ];

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const hasActiveFilters = startDate || endDate || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Professional Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
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
                    : 'View and manage all communications'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1"></div>
              {tenantId && (
                <Link
                  to={`/dashboard/tenants/${tenantId}/communications/new`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Communication
                </Link>
              )}
            </div>
          </div>

          {/* Tabs and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl overflow-x-auto max-w-full border border-gray-200 no-scrollbar">
              {tabs.map((tab) => (
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-gray-200 bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900">
              {activeTab === 'all' && 'All Communications'}
              {activeTab === 'email' && 'Email History'}
              {activeTab === 'call' && 'Call Logs'}
              {activeTab === 'meeting' && 'Meeting Notes'}
              {activeTab === 'note' && 'Internal Notes'}
              {activeTab === 'follow-up' && 'Pending Follow-ups'}
            </h2>
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
              tenantId={tenantId}
              filterType={activeTab === 'all' ? undefined : activeTab}
              showFollowUpOnly={activeTab === 'follow-up'}
              searchQuery={searchQuery}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
