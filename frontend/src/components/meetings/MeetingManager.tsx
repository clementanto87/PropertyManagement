import React, { useState } from 'react';
import { useMeetings } from '../../hooks/useMeetings';
import { Button } from '../ui/button';
import { Calendar, Video, LogOut, LogIn, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';

type MeetingProvider = 'google' | 'teams';

interface MeetingFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string;
  provider: MeetingProvider;
}

export function MeetingManager() {
  const { toast } = useToast();
  const {
    isGoogleSignedIn,
    isTeamsSignedIn,
    signIn,
    signOut,
    createMeeting,
    listMeetings,
    loading,
    error,
  } = useMeetings();

  const [meetings, setMeetings] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:00"),
    endTime: format(
      new Date(new Date().getTime() + 60 * 60 * 1000),
      "yyyy-MM-dd'T'HH:00"
    ),
    attendees: '',
    provider: 'google',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProviderChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      provider: value as MeetingProvider,
    }));
  };

  const handleSignIn = async (provider: MeetingProvider) => {
    try {
      await signIn(provider);
      toast({
        title: 'Success',
        description: `Successfully signed in to ${provider === 'google' ? 'Google' : 'Microsoft Teams'}`,
      });
      await fetchMeetings(provider);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to sign in to ${provider === 'google' ? 'Google' : 'Microsoft Teams'}`,
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async (provider: MeetingProvider) => {
    try {
      await signOut(provider);
      toast({
        title: 'Success',
        description: `Successfully signed out from ${provider === 'google' ? 'Google' : 'Microsoft Teams'}`,
      });
      setMeetings(prev => prev.filter(m => m.type !== provider));
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to sign out from ${provider === 'google' ? 'Google' : 'Microsoft Teams'}`,
        variant: 'destructive',
      });
    }
  };

  const fetchMeetings = async (provider: MeetingProvider) => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Next 30 days

      const meetings = await listMeetings(provider, startDate, endDate);
      setMeetings(prev => [
        ...prev.filter(m => m.type !== provider),
        ...meetings,
      ]);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch ${provider === 'google' ? 'Google Meet' : 'Teams'} meetings`,
        variant: 'destructive',
      });
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { title, description, startTime, endTime, attendees, provider } = formData;
      
      const meeting = await createMeeting(provider, {
        title,
        description,
        startTime,
        endTime,
        attendees: attendees.split(',').map(email => email.trim()).filter(Boolean),
      });

      setMeetings(prev => [...prev, meeting]);
      setIsDialogOpen(false);
      
      toast({
        title: 'Meeting Created',
        description: `${provider === 'google' ? 'Google Meet' : 'Teams'} meeting has been created successfully!`,
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: `Failed to create ${formData.provider === 'google' ? 'Google Meet' : 'Teams'} meeting`,
        variant: 'destructive',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form when dialog is closed
      setFormData({
        title: '',
        description: '',
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:00"),
        endTime: format(
          new Date(new Date().getTime() + 60 * 60 * 1000),
          "yyyy-MM-dd'T'HH:00"
        ),
        attendees: '',
        provider: 'google',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meeting Manager</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateMeeting}>
              <DialogHeader>
                <DialogTitle>Schedule a New Meeting</DialogTitle>
                <DialogDescription>
                  Create a new video meeting with Google Meet or Microsoft Teams.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="provider" className="text-right">
                    Provider
                  </Label>
                  <Select
                    value={formData.provider}
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Meet</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="col-span-3"
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="col-span-3"
                    min={formData.startTime}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="attendees" className="text-right">
                    Attendees
                  </Label>
                  <Input
                    id="attendees"
                    name="attendees"
                    value={formData.attendees}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Meeting'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Google Meet</h3>
            </div>
            {isGoogleSignedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSignOut('google')}
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleSignIn('google')}
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with Google
              </Button>
            )}
          </div>
          {isGoogleSignedIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMeetings('google')}
              disabled={loading}
              className="w-full mb-4"
            >
              Refresh Google Meets
            </Button>
          )}
        </div>

        <div className="flex-1 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium">Microsoft Teams</h3>
            </div>
            {isTeamsSignedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSignOut('teams')}
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleSignIn('teams')}
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with Microsoft
              </Button>
            )}
          </div>
          {isTeamsSignedIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMeetings('teams')}
              disabled={loading}
              className="w-full mb-4"
            >
              Refresh Teams Meetings
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upcoming Meetings</h3>
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming meetings. Create one to get started!
          </div>
        ) : (
          <div className="space-y-2">
            {meetings
              .sort(
                (a, b) =>
                  new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              )
              .map((meeting) => (
                <div
                  key={`${meeting.id}-${meeting.type}`}
                  className={cn(
                    'p-4 border rounded-lg hover:shadow-md transition-shadow',
                    meeting.type === 'google' ? 'border-blue-200' : 'border-purple-200'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{meeting.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(meeting.startTime), 'PPPpp')} -{' '}
                        {format(new Date(meeting.endTime), 'p')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Organized by: {meeting.organizer}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(meeting.joinUrl, '_blank')}
                      >
                        Join Meeting
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(meeting.joinUrl);
                          toast({
                            title: 'Link copied to clipboard',
                          });
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
