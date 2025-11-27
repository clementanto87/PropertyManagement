import { useState } from 'react';
import { useMeetings } from '@/hooks/useMeetings';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Video, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CreateMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateMeetingDialog({ open, onOpenChange }: CreateMeetingDialogProps) {
    const {
        isGoogleSignedIn,
        isTeamsSignedIn,
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
            toast.error(`Failed to sign in to ${provider === 'google' ? 'Google' : 'Microsoft Teams'}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !date || !time) {
            toast.error('Please fill in all required fields');
            return;
        }

        const startDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);

        try {
            const meeting = await createMeeting(provider, {
                title,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                description,
                attendees: attendees.split(',').map(a => a.trim()).filter(Boolean),
            });

            setCreatedMeetingUrl(meeting.joinUrl);
            toast.success('Meeting created successfully!');
        } catch (error) {
            toast.error('Failed to create meeting');
        }
    };

    const copyToClipboard = () => {
        if (createdMeetingUrl) {
            navigator.clipboard.writeText(createdMeetingUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Meeting link copied!');
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

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Schedule Meeting</DialogTitle>
                    <DialogDescription>
                        Create a video meeting using your preferred provider.
                    </DialogDescription>
                </DialogHeader>

                {!createdMeetingUrl ? (
                    <div className="space-y-6">
                        <Tabs value={provider} onValueChange={(v) => setProvider(v as 'google' | 'teams')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="google">Google Meet</TabsTrigger>
                                <TabsTrigger value="teams">Microsoft Teams</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {!isSignedIn ? (
                            <div className="py-8 text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Video className="h-6 w-6 text-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium">Connect your account</h3>
                                    <p className="text-sm text-gray-500">
                                        Sign in to {provider === 'google' ? 'Google' : 'Microsoft'} to schedule meetings.
                                    </p>
                                </div>
                                <Button onClick={handleSignIn} disabled={loading}>
                                    {loading ? 'Connecting...' : `Sign in with ${provider === 'google' ? 'Google' : 'Microsoft'}`}
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Meeting Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Lease Review"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time">Time</Label>
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
                                    <Label htmlFor="duration">Duration (minutes)</Label>
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
                                    <Label htmlFor="attendees">Attendees (comma separated emails)</Label>
                                    <Input
                                        id="attendees"
                                        value={attendees}
                                        onChange={(e) => setAttendees(e.target.value)}
                                        placeholder="tenant@example.com, owner@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Meeting agenda..."
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create Meeting'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="py-6 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-medium text-lg">Meeting Created!</h3>
                            <p className="text-sm text-gray-500">
                                Your meeting has been scheduled successfully.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Meeting Link</Label>
                            <div className="flex gap-2">
                                <Input value={createdMeetingUrl} readOnly />
                                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={() => handleOpenChange(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
