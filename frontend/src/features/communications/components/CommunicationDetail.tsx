import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Mail, Phone, Calendar as CalendarIcon, MessageSquare, Clock, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  tenant: {
    id: string;
    name: string;
  };
};

export function CommunicationDetail() {
  const { communicationId, tenantId } = useParams<{ communicationId: string; tenantId: string }>();
  const [communication, setCommunication] = useState<Communication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunication = async () => {
      if (!communicationId) return;

      try {
        const data = await api.get<Communication>(`/communications/${communicationId}`);
        setCommunication(data);
      } catch (err) {
        setError('Failed to load communication');
        console.error('Error fetching communication:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunication();
  }, [communicationId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'call':
        return <Phone className="h-5 w-5 text-green-500" />;
      case 'meeting':
        return <CalendarIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full mt-6" />
      </div>
    );
  }

  if (error || !communication) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Communication not found'}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate(`/dashboard/tenants/${tenantId}/communications`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Communications
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              className="w-fit p-0 hover:bg-transparent"
              onClick={() => navigate(`/dashboard/tenants/${tenantId}/communications`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Communications
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon(communication.type)}
                <h1 className="text-2xl font-bold tracking-tight">{communication.summary}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/dashboard/tenants/${tenantId}/communications/${communication.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Created on {format(new Date(communication.createdAt), 'MMMM d, yyyy')} • {communication.user.name}
              </p>
              {communication.updatedAt !== communication.createdAt && (
                <p className="text-xs text-muted-foreground/80">
                  Last updated: {format(new Date(communication.updatedAt), 'MMMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="capitalize">{communication.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Channel</p>
                      <p>{communication.channel}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Summary</p>
                    <p>{communication.summary}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="whitespace-pre-line">{communication.content}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {communication.followUpRequired ? (
                      <>
                        <Clock className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium">Follow-up Required</p>
                          <p className="text-sm text-muted-foreground">
                            By {format(new Date(communication.followUpDate!), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Completed</p>
                          <p className="text-sm text-muted-foreground">No follow-up needed</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground">Tenant</p>
                    <p>{communication.tenant.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created By</p>
                    <p>{communication.user.name}</p>
                    <p className="text-sm text-muted-foreground">{communication.user.email}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
