import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  role: 'ADMIN' | 'MANAGER' | 'TENANT' | 'CARE_TAKER' | 'HOUSE_OWNER';
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
  const { t } = useTranslation();
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
      alert(t('gdpr.anonymize.loadError'));
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
      alert(t('gdpr.anonymize.success'));
      setShowConfirmDialog(false);
      setSelectedUser(null);
      setDataSummary(null);
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to anonymize user data:', err);
      alert(err.message || t('gdpr.anonymize.error'));
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('gdpr.loading')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('gdpr.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('gdpr.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t('gdpr.allUsers')}</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('gdpr.searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedUser?.id === user.id
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  onClick={() => handleViewData(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{user.name || t('gdpr.noName')}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : user.role === 'MANAGER'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                              : user.role === 'CARE_TAKER'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                : user.role === 'HOUSE_OWNER'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            }`}
                        >
                          {t(`gdpr.roles.${user.role}`)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.tenant && (
                        <p className="text-xs text-muted-foreground mt-1">{t('gdpr.tenant', { name: user.tenant.name })}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">{t('gdpr.noUsers')}</div>
              )}
            </div>
          </div>

          {/* Data Locations View */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            {selectedUser && dataSummary ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">{t('gdpr.dataLocations.title')}</h2>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setDataSummary(null);
                      }}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-medium text-foreground">{dataSummary.userName || t('gdpr.noName')}</p>
                        <p className="text-sm text-muted-foreground">{dataSummary.userEmail}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-foreground">
                          {t('gdpr.dataLocations.found', { count: dataSummary.totalRecords })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto mb-4">
                  {dataSummary.dataLocations.map((location, index) => (
                    <div
                      key={`${location.model}-${location.recordId}-${index}`}
                      className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-muted-foreground">{getModelIcon(location.model)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground">{t(`gdpr.models.${location.model}`, { defaultValue: location.model })}</span>
                            {location.relatedEntity && (
                              <span className="text-xs text-muted-foreground">({location.relatedEntity})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            {getFieldIcon(location.field)}
                            <span className="font-mono">{t(`gdpr.fields.${location.field}`, { defaultValue: location.field })}</span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate" title={location.value}>
                            {location.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dataSummary.dataLocations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>{t('gdpr.dataLocations.noData')}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={anonymizing}
                  className="w-full mt-4 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {anonymizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      {t('gdpr.anonymize.processing')}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {t('gdpr.anonymize.button')}
                    </>
                  )}
                </button>
              </>
            ) : selectedUser && loadingData ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  </div>
                  <p className="text-muted-foreground">{t('gdpr.dataLocations.loading')}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{t('gdpr.dataLocations.selectUser')}</h3>
                <p className="text-sm text-muted-foreground">{t('gdpr.dataLocations.selectUserDesc')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('gdpr.anonymize.confirmTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('gdpr.anonymize.confirmSubtitle')}</p>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground">
                {t('gdpr.anonymize.confirmText')}{' '}
                <span className="font-semibold">{selectedUser?.name || selectedUser?.email}</span>? This will:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                <li>{t('gdpr.anonymize.consequences.personalInfo')}</li>
                <li>{t('gdpr.anonymize.consequences.content')}</li>
                <li>{t('gdpr.anonymize.consequences.signatures')}</li>
                <li>{t('gdpr.anonymize.consequences.irreversible')}</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-input bg-background rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
              >
                {t('gdpr.anonymize.cancel')}
              </button>
              <button
                onClick={handleAnonymize}
                disabled={anonymizing}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {anonymizing ? t('gdpr.anonymize.processing') : t('gdpr.anonymize.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

