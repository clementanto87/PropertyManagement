import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, MessageSquare, Phone, Mail, Clock, CheckCircle, XCircle, User, ArrowRight, Check } from 'lucide-react';
import { api } from '@/lib/api';

type Communication = {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  channel: string;
  summary: string;
  content: string;
  followUpRequired: boolean;
  followUpDate: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  tenant?: {
    id: string;
    name: string;
    email: string;
  };
};

export function CommunicationList({
  tenantId,
  filterType,
  showFollowUpOnly,
  searchQuery,
  startDate,
  endDate
}: {
  tenantId?: string;
  filterType?: string;
  showFollowUpOnly?: boolean;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        setIsLoading(true);
        const endpoint = tenantId
          ? `/communications/tenants/${tenantId}`
          : '/communications';

        // Build query parameters
        const params = new URLSearchParams();
        if (filterType && filterType !== 'all') {
          params.append('type', filterType);
        }
        if (showFollowUpOnly) {
          params.append('followUpOnly', 'true');
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        if (startDate) {
          params.append('startDate', startDate);
        }
        if (endDate) {
          params.append('endDate', endDate);
        }

        const queryString = params.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        const response = await api.get<{ items: Communication[] } | Communication[]>(url);
        // Handle both response formats: { items: [...] } or [...]
        let data: Communication[] = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (response && typeof response === 'object' && 'items' in response) {
          data = response.items || [];
        }

        setCommunications(data);
      } catch (err) {
        setError('Failed to load communications');
        console.error('Error fetching communications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search query
    const timeoutId = setTimeout(() => {
      fetchCommunications();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [tenantId, filterType, showFollowUpOnly, searchQuery, startDate, endDate]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Mail className="h-4 w-4" /></div>;
      case 'call':
        return <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"><Phone className="h-4 w-4" /></div>;
      case 'meeting':
        return <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"><Calendar className="h-4 w-4" /></div>;
      default:
        return <div className="p-2 rounded-lg bg-muted text-muted-foreground"><MessageSquare className="h-4 w-4" /></div>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4 p-4 border border-border rounded-xl">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-300 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (communications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No communications found</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          {tenantId ? 'Get started by creating a new communication record for this tenant.' : 'There are no communication logs matching your criteria.'}
        </p>
        {tenantId && (
          <div className="mt-6">
            <Link
              to={`/dashboard/tenants/${tenantId}/communications/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <MessageSquare className="-ml-1 mr-2 h-4 w-4" />
              New Communication
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => (
        <div
          key={comm.id}
          className="group bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getTypeIcon(comm.type)}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{comm.summary}</h3>
                  {!tenantId && comm.tenant && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {comm.tenant.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <User className="w-3 h-3 mr-1" />
                  {comm.user?.name || 'System'}
                  <span className="mx-1.5">•</span>
                  <Clock className="w-3 h-3 mr-1" />
                  <span title={format(new Date(comm.createdAt), 'MMM d, yyyy h:mm a')}>
                    {formatDistanceToNow(new Date(comm.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {comm.followUpRequired ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                  <Clock className="w-3 h-3 mr-1" />
                  Follow-up
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pl-14">
            <p className="text-sm text-muted-foreground leading-relaxed">{comm.content}</p>

            {comm.followUpDate && (
              <div className="mt-3 flex items-center p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20 w-fit">
                <Clock className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Follow up required by {format(new Date(comm.followUpDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              {comm.followUpRequired && (
                <button
                  onClick={async () => {
                    try {
                      await api.patch(`/communications/${comm.id}/complete-followup`, {});
                      // Refresh the list
                      const endpoint = tenantId
                        ? `/tenants/${tenantId}/communications`
                        : '/communications';
                      const response = await api.get<{ items: Communication[] } | Communication[]>(endpoint);
                      let data: Communication[] = [];
                      if (Array.isArray(response)) {
                        data = response;
                      } else if (response && typeof response === 'object' && 'items' in response) {
                        data = response.items || [];
                      }
                      setCommunications(data);
                    } catch (err) {
                      console.error('Error completing follow-up:', err);
                    }
                  }}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Mark Complete
                </button>
              )}
              <Link
                to={tenantId
                  ? `/dashboard/tenants/${tenantId}/communications/${comm.id}`
                  : `/dashboard/communications/${comm.id}`
                }
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                View Details
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
