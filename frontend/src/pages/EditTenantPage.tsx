import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Camera,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  UserPlus,
  X,
  Bell,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tenantService, type Tenant } from '@/api/tenantService';
import { toast } from 'sonner';

type TabType = 'PRIMARY' | 'OCCUPANTS';

export default function EditTenantPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('PRIMARY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    emergencyContacts: false
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  const [occupants, setOccupants] = useState<string[]>([]);
  const [newOccupant, setNewOccupant] = useState('');

  useEffect(() => {
    if (id) {
      loadTenantData(id);
    }
  }, [id]);

  const loadTenantData = async (tenantId: string) => {
    try {
      const tenant = await tenantService.getTenant(tenantId);

      // Parse emergency contact if it exists
      let emergencyContactName = '';
      let emergencyContactPhone = '';
      let emergencyContactRelation = '';

      if (tenant.emergencyContact) {
        // Expected format: "Name (Relation) - Phone"
        const match = tenant.emergencyContact.match(/^(.+?)\s*\(([^)]+)\)\s*-\s*(.+)$/);
        if (match) {
          emergencyContactName = match[1].trim();
          emergencyContactRelation = match[2].trim();
          emergencyContactPhone = match[3].trim();
        } else {
          // Fallback parsing
          const parts = tenant.emergencyContact.split(' - ');
          if (parts.length >= 2) {
            emergencyContactPhone = parts[parts.length - 1].trim();
            const namePart = parts[0].trim();
            const relationMatch = namePart.match(/^(.+?)\s*\(([^)]+)\)$/);
            if (relationMatch) {
              emergencyContactName = relationMatch[1].trim();
              emergencyContactRelation = relationMatch[2].trim();
            } else {
              emergencyContactName = namePart;
            }
          }
        }
      }

      setFormData({
        fullName: tenant.name || '',
        email: tenant.email || '',
        phoneNumber: tenant.phone || '',
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation
      });
    } catch (error: any) {
      console.error('Failed to load tenant:', error);
      toast.error('Failed to load tenant data');
      navigate('/dashboard/tenants');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addOccupant = () => {
    if (newOccupant.trim()) {
      setOccupants([...occupants, newOccupant.trim()]);
      setNewOccupant('');
    }
  };

  const removeOccupant = (index: number) => {
    setOccupants(occupants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error(t('newTenant.validation.nameRequired'));
      return;
    }

    if (!id) {
      toast.error(t('editTenant.validation.idMissing'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare emergency contact string
      const emergencyContact = formData.emergencyContactName
        ? `${formData.emergencyContactName} (${formData.emergencyContactRelation || 'Contact'}) - ${formData.emergencyContactPhone}`
        : undefined;

      // Update tenant
      await tenantService.updateTenant(id, {
        name: formData.fullName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phoneNumber.trim() || undefined,
        emergencyContact
      });

      toast.success(t('editTenant.validation.success'));
      navigate(`/dashboard/tenants/${id}`);
    } catch (error: any) {
      console.error('Failed to update tenant:', error);
      toast.error(error?.message || t('editTenant.validation.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('editTenant.loading')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Professional Sticky Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-full hover:bg-accent text-muted-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('editTenant.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('editTenant.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
              </button>
              <div className="h-8 w-px bg-border mx-1"></div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center border border-border">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 max-w-4xl mx-auto space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center border-2 border-dashed border-border group-hover:border-blue-500 transition-colors">
              <User className="w-10 h-10 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 border-2 border-card flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t('newTenant.uploadPhoto')}</p>
        </div>

        {/* Tabs */}
        <div className="bg-accent/50 p-1 rounded-xl inline-flex border border-border">
          <button
            onClick={() => setActiveTab('PRIMARY')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'PRIMARY'
              ? 'bg-card text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
          >
            {t('newTenant.tabs.primary')}
          </button>
          <button
            onClick={() => setActiveTab('OCCUPANTS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'OCCUPANTS'
              ? 'bg-card text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
          >
            {t('newTenant.tabs.occupants')}
          </button>
        </div>

        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('personalInfo')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors border-b border-border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-foreground">{t('newTenant.personalInfo.title')}</h2>
              </div>
              {expandedSections.personalInfo ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {expandedSections.personalInfo && (
              <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('newTenant.personalInfo.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder={t('newTenant.personalInfo.fullNamePlaceholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('newTenant.personalInfo.email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder={t('newTenant.personalInfo.emailPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('newTenant.personalInfo.phone')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder={t('newTenant.personalInfo.phonePlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Contacts Section */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('emergencyContacts')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors border-b border-border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-foreground">{t('newTenant.emergencyContacts.title')}</h2>
              </div>
              {expandedSections.emergencyContacts ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {expandedSections.emergencyContacts && (
              <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('newTenant.emergencyContacts.name')}</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder={t('newTenant.emergencyContacts.namePlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('newTenant.emergencyContacts.phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder={t('newTenant.emergencyContacts.phonePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('newTenant.emergencyContacts.relation')}</label>
                    <select
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    >
                      <option value="">{t('newTenant.emergencyContacts.relationPlaceholder')}</option>
                      <option value="spouse">{t('newTenant.emergencyContacts.relations.spouse')}</option>
                      <option value="parent">{t('newTenant.emergencyContacts.relations.parent')}</option>
                      <option value="sibling">{t('newTenant.emergencyContacts.relations.sibling')}</option>
                      <option value="friend">{t('newTenant.emergencyContacts.relations.friend')}</option>
                      <option value="other">{t('newTenant.emergencyContacts.relations.other')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Occupants Section (when tab is active) */}
          {activeTab === 'OCCUPANTS' && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-foreground">{t('newTenant.occupants.title')}</h2>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOccupant}
                  onChange={(e) => setNewOccupant(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOccupant())}
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder={t('newTenant.occupants.placeholder')}
                />
                <Button
                  type="button"
                  onClick={addOccupant}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>

              {occupants.length > 0 && (
                <div className="space-y-2 mt-4">
                  {occupants.map((occupant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 bg-accent/50 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-foreground">{occupant}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOccupant(index)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors group"
                      >
                        <X className="w-4 h-4 text-muted-foreground group-hover:text-red-600 dark:group-hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-6"
              disabled={isSubmitting}
            >
              {t('newTenant.actions.cancel')}
            </Button>
            <Button
              type="submit"
              className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('editTenant.actions.updating')}
                </>
              ) : (
                t('editTenant.actions.update')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
