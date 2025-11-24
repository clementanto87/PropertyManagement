import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Shield,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Database,
  Mail,
  User,
  Phone,
  FileText,
  MessageSquare,
  Calendar,
  Lock,
  ChevronRight,
  X
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'MANAGER' | 'TENANT';
  createdAt: string;
  tenant?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
}

interface UserDataLocation {
  model: string;
  field: string;
  recordId: string;
  value: string;
  relatedEntity?: string;
}

interface UserDataSummary {
  userId: string;
  userEmail: string;
  userName: string | null;
  dataLocations: UserDataLocation[];
  totalRecords: number;
}

type ListResponse<T> = { items: T[] };

const getModelIcon = (model: string) => {
  switch (model) {
    case 'User':
      return <User className="w-4 h-4" />;
    case 'Tenant':
      return <User className="w-4 h-4" />;
    case 'Communication':
      return <MessageSquare className="w-4 h-4" />;
    case 'Post':
      return <FileText className="w-4 h-4" />;
    case 'LeaseSignature':
      return <FileText className="w-4 h-4" />;
    case 'AmenityBooking':
      return <Calendar className="w-4 h-4" />;
    case 'AuditLog':
      return <Database className="w-4 h-4" />;
    default:
      return <Database className="w-4 h-4" />;
  }
};

const getFieldIcon = (field: string) => {
  if (field.includes('email')) return <Mail className="w-3 h-3" />;
  if (field.includes('phone')) return <Phone className="w-3 h-3" />;
  if (field.includes('name')) return <User className="w-3 h-3" />;
  return <FileText className="w-3 h-3" />;
};

export default function GDPRManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dataSummary, setDataSummary] = useState<UserDataSummary | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [anonymizing, setAnonymizing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.get<ListResponse<User>>('/gdpr/users');
      setUsers(data.items);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDataLocations = async (userId: string) => {
    setLoadingData(true);
    try {
      const summary = await api.get<UserDataSummary>(`/gdpr/users/${userId}/data-locations`);
      setDataSummary(summary);
    } catch (err) {
      console.error('Failed to load user data locations:', err);
      alert('Failed to load user data locations');
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewData = async (user: User) => {
    setSelectedUser(user);
    await loadUserDataLocations(user.id);
  };

  const handleAnonymize = async () => {
    if (!selectedUser) return;

    setAnonymizing(true);
    try {
      await api.post(`/gdpr/users/${selectedUser.id}/anonymize`, {});
      alert('User data has been anonymized successfully');
      setShowConfirmDialog(false);
      setSelectedUser(null);
      setDataSummary(null);
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to anonymize user data:', err);
      alert(err.message || 'Failed to anonymize user data');
    } finally {
      setAnonymizing(false);
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Loading Users</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border border-purple-200">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GDPR Data Management</h1>
                <p className="text-sm text-gray-500">View and manage user data locations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedUser?.id === user.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleViewData(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{user.name || 'No name'}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700'
                              : user.role === 'MANAGER'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.tenant && (
                        <p className="text-xs text-gray-500 mt-1">Tenant: {user.tenant.name}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">No users found</div>
              )}
            </div>
          </div>

          {/* Data Locations View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {selectedUser && dataSummary ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Data Locations</h2>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setDataSummary(null);
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">{dataSummary.userName || 'No name'}</p>
                        <p className="text-sm text-gray-600">{dataSummary.userEmail}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {dataSummary.totalRecords} data locations found
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto mb-4">
                  {dataSummary.dataLocations.map((location, index) => (
                    <div
                      key={`${location.model}-${location.recordId}-${index}`}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-gray-600">{getModelIcon(location.model)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">{location.model}</span>
                            {location.relatedEntity && (
                              <span className="text-xs text-gray-500">({location.relatedEntity})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            {getFieldIcon(location.field)}
                            <span className="font-mono">{location.field}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate" title={location.value}>
                            {location.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dataSummary.dataLocations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No data locations found for this user</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={anonymizing}
                  className="w-full mt-4 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {anonymizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Anonymizing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Anonymize User Data
                    </>
                  )}
                </button>
              </>
            ) : selectedUser && loadingData ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-100 border-t-purple-500 animate-spin"></div>
                  </div>
                  <p className="text-gray-600">Loading data locations...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a user</h3>
                <p className="text-sm text-gray-500">Choose a user from the list to view their data locations</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Anonymization</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to anonymize all data for{' '}
                <span className="font-semibold">{selectedUser?.name || selectedUser?.email}</span>? This will:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
                <li>Replace email, name, and phone with anonymized values</li>
                <li>Remove or anonymize content in communications and posts</li>
                <li>Anonymize lease signatures</li>
                <li>This action is permanent and cannot be reversed</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAnonymize}
                disabled={anonymizing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {anonymizing ? 'Anonymizing...' : 'Confirm Anonymization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

