import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PenTool, Clock, CheckCircle2, AlertCircle, Plus, Phone, Loader2, ChevronRight, X, ArrowRight } from 'lucide-react';
import { tenant } from '../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function MaintenancePage() {
  const { t } = useTranslation();
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
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await tenant.createMaintenance(formData);
      toast.success(t('maintenance.requestSubmitted'));
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'MEDIUM' });
      // Refresh the list
      fetchRequests();
    } catch (error) {
      console.error('Failed to create maintenance request', error);
      toast.error(t('common.error'));
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('maintenance.title')}</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">{t('maintenance.subtitle')}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('maintenance.newRequest')}
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
                  <h3 className="font-semibold text-red-900">{t('maintenance.emergencyMaintenance')}</h3>
                  <p className="text-sm text-red-700">{t('maintenance.callImmediately')}</p>
                </div>
              </div>
              <Button variant="destructive" size="sm">{t('maintenance.call247')}</Button>
            </CardContent>
          </Card>

          {/* Active Requests */}
          <Card>
            <CardHeader>
              <CardTitle>{t('maintenance.maintenanceRequests')}</CardTitle>
              <CardDescription>{t('maintenance.trackStatus')}</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                className="space-y-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {requests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{t('maintenance.noRequests')}</p>
                ) : (
                  requests.map((request) => (
                    <motion.div
                      key={request.id}
                      variants={item}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 last:border-0 last:pb-0 gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${request.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                          request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                          {request.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> :
                            request.status === 'IN_PROGRESS' ? <PenTool className="h-5 w-5" /> :
                              <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">{request.title}</h4>
                              <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2">{request.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground dark:text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="font-mono">ID: #{request.id.slice(-6)}</span>
                                {request.priority && (
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    request.priority === 'HIGH' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                    request.priority === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {request.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${request.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              request.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 animate-pulse' :
                                'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                              }`}>
                              {request.status.replace('_', ' ')}
                            </span>
                          </div>
                          {request.updates && request.updates.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                {t('maintenance.updatesAvailable', { count: request.updates.length })}
                              </p>
                            </div>
                          )}
                        </div>
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
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 hidden lg:block">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">{t('maintenance.emergency')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                {t('maintenance.emergencyDesc')}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                {t('maintenance.urgentIssues')}
              </p>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                (555) 123-4567
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="dark:text-gray-100">{t('maintenance.commonIssues')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-between font-normal dark:text-gray-300">
                {t('maintenance.troubleshootingHvac')} <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </Button>
              <Button variant="ghost" className="w-full justify-between font-normal dark:text-gray-300">
                {t('maintenance.resettingBreaker')} <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </Button>
              <Button variant="ghost" className="w-full justify-between font-normal dark:text-gray-300">
                {t('maintenance.garbageDisposal')} <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Request Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between p-6 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('maintenance.newRequestTitle')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('maintenance.requestDesc')}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={submitting}
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white dark:bg-gray-800">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('maintenance.titleLabel')}</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('maintenance.titlePlaceholder')}
                  maxLength={100}
                  className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all"
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('maintenance.characters', { count: formData.title.length, max: 100 })}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('maintenance.descriptionLabel')}</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('maintenance.descriptionPlaceholder')}
                  rows={5}
                  maxLength={500}
                  className="flex w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all resize-none"
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('maintenance.characters', { count: formData.description.length, max: 500 })}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('maintenance.priorityLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'LOW', label: t('maintenance.priorityLow'), desc: t('maintenance.priorityLowDesc'), color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600' },
                    { value: 'MEDIUM', label: t('maintenance.priorityMedium'), desc: t('maintenance.priorityMediumDesc'), color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800' },
                    { value: 'HIGH', label: t('maintenance.priorityHigh'), desc: t('maintenance.priorityHighDesc'), color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: option.value })}
                      disabled={submitting}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.priority === option.value
                          ? `${option.color} ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400`
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="font-semibold text-sm">{option.label}</div>
                      <div className="text-xs mt-1 opacity-75">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ title: '', description: '', priority: 'MEDIUM' });
                  }}
                  className="flex-1"
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                  disabled={submitting || !formData.title.trim() || !formData.description.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('maintenance.submitting')}
                    </>
                  ) : (
                    <>
                      {t('maintenance.submitRequest')} <ArrowRight className="ml-2 h-4 w-4" />
                    </>
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
