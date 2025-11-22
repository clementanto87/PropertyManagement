import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PenTool, Clock, CheckCircle2, AlertCircle, Plus, Phone, Loader2, ChevronRight, X } from 'lucide-react';
import { tenant } from '../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function MaintenancePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await tenant.getMaintenance();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch maintenance requests', error);
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await tenant.createMaintenance(formData);
      toast.success('Maintenance request submitted successfully');
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'MEDIUM' });
      // Refresh the list
      fetchRequests();
    } catch (error) {
      console.error('Failed to create maintenance request', error);
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Report issues and track repair status.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Emergency Contact - Mobile/Tablet only */}
          <Card className="bg-red-50 border-red-100 lg:hidden">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Emergency Maintenance</h3>
                  <p className="text-sm text-red-700">Call immediately for urgent issues.</p>
                </div>
              </div>
              <Button variant="destructive" size="sm">Call 24/7</Button>
            </CardContent>
          </Card>

          {/* Active Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>Track the status of your submitted requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                className="space-y-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {requests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No maintenance requests found.</p>
                ) : (
                  requests.map((request) => (
                    <motion.div
                      key={request.id}
                      variants={item}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 last:border-0 last:pb-0 gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p - 2 rounded - full mt - 1 ${request.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                          request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                            'bg-orange-100 text-orange-600'
                          } `}>
                          {request.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> :
                            request.status === 'IN_PROGRESS' ? <PenTool className="h-5 w-5" /> :
                              <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-base">{request.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span>ID: #{request.id.slice(-6)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <span className={`inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium ${request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            'bg-orange-100 text-orange-800'
                          } `}>
                          {request.status.replace('_', ' ')}
                        </span>
                        {request.updates && request.updates.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {request.updates.length} updates
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-100 hidden lg:block">
            <CardHeader>
              <CardTitle className="text-blue-900">Emergency?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 mb-4">
                For immediate emergencies (fire, flood, gas leak), please call 911 first.
              </p>
              <p className="text-sm text-blue-800 mb-4">
                For urgent property issues, call our 24/7 line:
              </p>
              <div className="text-xl font-bold text-blue-900">
                (555) 123-4567
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-between font-normal">
                Troubleshooting HVAC <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
              <Button variant="ghost" className="w-full justify-between font-normal">
                Resetting Circuit Breaker <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
              <Button variant="ghost" className="w-full justify-between font-normal">
                Garbage Disposal Fix <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">New Maintenance Request</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Leaking faucet in bathroom"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please describe the issue in detail..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="LOW">Low - Can wait a few days</option>
                  <option value="MEDIUM">Medium - Should be fixed soon</option>
                  <option value="HIGH">High - Needs immediate attention</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
