import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MessageSquare, Phone, Mail, Clock, CheckCircle, XCircle, User, ArrowRight } from 'lucide-react';
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
  showFollowUpOnly
}: {
  tenantId?: string;
  filterType?: string;
  showFollowUpOnly?: boolean;
}) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        setIsLoading(true);
        const endpoint = tenantId
          ? `/communications/tenants/${tenantId}/communications`
          : '/communications';
        const response = await api.get(endpoint) as any;
        let data = response.data;

        if (filterType) {
          data = data.filter((c: Communication) => c.type === filterType);
        }

        if (showFollowUpOnly) {
          data = data.filter((c: Communication) => c.followUpRequired);
        }

        setCommunications(data);
      } catch (err) {
        setError('Failed to load communications');
        console.error('Error fetching communications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunications();
  }, [tenantId, filterType, showFollowUpOnly]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Mail className="h-4 w-4" /></div>;
      case 'call':
        return <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><Phone className="h-4 w-4" /></div>;
      case 'meeting':
        return <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><Calendar className="h-4 w-4" /></div>;
      default:
        return <div className="p-2 rounded-lg bg-gray-100 text-gray-600"><MessageSquare className="h-4 w-4" /></div>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4 p-4 border border-gray-100 rounded-xl">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (communications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No communications found</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
          {tenantId ? 'Get started by creating a new communication record for this tenant.' : 'There are no communication logs matching your criteria.'}
        </p>
        {tenantId && (
          <div className="mt-6">
            <Link
              to={`/tenants/${tenantId}/communications/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
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
          className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-blue-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getTypeIcon(comm.type)}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">{comm.summary}</h3>
                  {!tenantId && comm.tenant && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {comm.tenant.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <User className="w-3 h-3 mr-1" />
                  {comm.user.name}
                  <span className="mx-1.5">•</span>
                  <Clock className="w-3 h-3 mr-1" />
                  {format(new Date(comm.createdAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {comm.followUpRequired ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  <Clock className="w-3 h-3 mr-1" />
                  Follow-up
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pl-14">
            <p className="text-sm text-gray-600 leading-relaxed">{comm.content}</p>

            {comm.followUpDate && (
              <div className="mt-3 flex items-center p-2 bg-amber-50 rounded-lg border border-amber-100 w-fit">
                <Clock className="mr-2 h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-800">
                  Follow up required by {format(new Date(comm.followUpDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                to={tenantId
                  ? `/tenants/${tenantId}/communications/${comm.id}`
                  : `/dashboard/communications/${comm.id}`
                }
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
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
