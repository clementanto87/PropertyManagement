import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMeetings } from '@/hooks/useMeetings';
import { MeetingDetails } from '@/integrations/meetings/config';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Video, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface CreatedMeeting extends MeetingDetails {
    description?: string;
    attendees?: string[];
}

interface CreateMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMeetingCreated?: (meeting: CreatedMeeting) => void;
}

export function CreateMeetingDialog({ open, onOpenChange, onMeetingCreated }: CreateMeetingDialogProps) {
    const { t } = useTranslation();
    const {
        isGoogleSignedIn,
        isTeamsSignedIn,
        isGoogleConfigured,
        isTeamsConfigured,
        isGoogleInitialized,
        signIn,
        createMeeting,
        loading,
    } = useMeetings();

    const [provider, setProvider] = useState<'google' | 'teams'>('google');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('30');
    const [description, setDescription] = useState('');
    const [attendees, setAttendees] = useState('');
    const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSignIn = async () => {
        try {
            await signIn(provider);
        } catch (error) {
            const providerName = provider === 'google' ? 'Google' : 'Microsoft Teams';
            toast.error(t('calendar.meetingDialog.validation.signInFailed', { provider: providerName }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !date || !time) {
            toast.error(t('calendar.meetingDialog.validation.requiredFields'));
            return;
        }

        const startDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);
        const attendeesList = attendees.split(',').map(a => a.trim()).filter(Boolean);

        try {
            const meeting = await createMeeting(provider, {
                title,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                description,
                attendees: attendeesList,
            });

            setCreatedMeetingUrl(meeting.joinUrl);

            // Notify parent component about the created meeting
            if (onMeetingCreated) {
                onMeetingCreated({
                    ...meeting,
                    description,
                    attendees: attendeesList,
                });
            }

            toast.success(t('calendar.meetingDialog.messages.created'));
        } catch (error) {
            toast.error(t('calendar.meetingDialog.validation.createFailed'));
        }
    };

    const copyToClipboard = () => {
        if (createdMeetingUrl) {
            navigator.clipboard.writeText(createdMeetingUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success(t('calendar.meetingDialog.messages.linkCopied'));
        }
    };

    const resetForm = () => {
        setTitle('');
        setDate('');
        setTime('');
        setDescription('');
        setAttendees('');
        setCreatedMeetingUrl(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetForm();
        }
        onOpenChange(newOpen);
    };

    const isSignedIn = provider === 'google' ? isGoogleSignedIn : isTeamsSignedIn;
    const isConfigured = provider === 'google' ? isGoogleConfigured : isTeamsConfigured;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('calendar.meetingDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('calendar.meetingDialog.description')}
                    </DialogDescription>
                </DialogHeader>

                {!createdMeetingUrl ? (
                    <div className="space-y-6">
                        <Tabs value={provider} onValueChange={(v) => setProvider(v as 'google' | 'teams')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="google">{t('calendar.meetingDialog.googleMeet')}</TabsTrigger>
                                <TabsTrigger value="teams">{t('calendar.meetingDialog.microsoftTeams')}</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {!isConfigured ? (
                            <div className="py-8 text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium text-foreground">{t('calendar.meetingDialog.notConfigured')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {provider === 'google'
                                            ? t('calendar.meetingDialog.googleNotConfigured')
                                            : t('calendar.meetingDialog.teamsNotConfigured')}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {t('calendar.meetingDialog.envHint')} <code className="bg-muted px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> {t('calendar.meetingDialog.envVariable')}
                                    </p>
                                </div>
                            </div>
                        ) : !isSignedIn ? (
                            <div className="py-8 text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                    <Video className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium text-foreground">{t('calendar.meetingDialog.connectAccount')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('calendar.meetingDialog.signInPrompt', { provider: provider === 'google' ? 'Google' : 'Microsoft' })}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleSignIn}
                                    disabled={loading || (provider === 'google' && !isGoogleInitialized)}
                                >
                                    {loading ? t('calendar.meetingDialog.connecting') : t('calendar.meetingDialog.signInButton', { provider: provider === 'google' ? 'Google' : 'Microsoft' })}
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">{t('calendar.meetingDialog.meetingTitle')}</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={t('calendar.meetingDialog.titlePlaceholder')}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">{t('calendar.meetingDialog.date')}</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time">{t('calendar.meetingDialog.time')}</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration">{t('calendar.meetingDialog.duration')}</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="15"
                                        step="15"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="attendees">{t('calendar.meetingDialog.attendees')}</Label>
                                    <Input
                                        id="attendees"
                                        value={attendees}
                                        onChange={(e) => setAttendees(e.target.value)}
                                        placeholder={t('calendar.meetingDialog.attendeesPlaceholder')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">{t('calendar.meetingDialog.description')}</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={t('calendar.meetingDialog.descriptionPlaceholder')}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                        {t('calendar.meetingDialog.cancel')}
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? t('calendar.meetingDialog.creating') : t('calendar.meetingDialog.createMeeting')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="py-6 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-medium text-lg text-foreground">{t('calendar.meetingDialog.meetingCreated')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('calendar.meetingDialog.meetingScheduled')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('calendar.meetingDialog.meetingLink')}</Label>
                            <div className="flex gap-2">
                                <Input value={createdMeetingUrl} readOnly />
                                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={() => handleOpenChange(false)}>
                                {t('calendar.meetingDialog.close')}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
