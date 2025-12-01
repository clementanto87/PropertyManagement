import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { de } from 'date-fns/locale/de';
import { Calendar as CalendarIcon, Filter, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { calendarService, CalendarEvent, EventType } from '@/api/calendarService';
import { toast } from 'sonner';
import { CreateMeetingDialog, CreatedMeeting } from '@/components/calendar/CreateMeetingDialog';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en': enUS,
    'de': de,
};


const eventStyleGetter = (event: CalendarEvent) => {
    const colors: Record<EventType, { backgroundColor: string; color: string }> = {
        LEASE_START: { backgroundColor: '#3b82f6', color: 'white' }, // Blue
        LEASE_END: { backgroundColor: '#8b5cf6', color: 'white' }, // Purple
        PAYMENT_DUE: { backgroundColor: '#10b981', color: 'white' }, // Green
        WORK_ORDER: { backgroundColor: '#f59e0b', color: 'white' }, // Orange
        FOLLOW_UP: { backgroundColor: '#ec4899', color: 'white' }, // Pink
        MEETING: { backgroundColor: '#ef4444', color: 'white' }, // Red
    };

    return {
        style: colors[event.type] || { backgroundColor: '#6b7280', color: 'white' },
    };
};

export default function CalendarPage() {
    const { t, i18n } = useTranslation();

    // Create localizer based on current language
    const localizer = useMemo(() => {
        const currentLocale = i18n.language === 'de' ? de : enUS;
        return dateFnsLocalizer({
            format: (date: Date, formatStr: string) => format(date, formatStr, { locale: currentLocale }),
            parse,
            startOfWeek: (date: Date) => startOfWeek(date, { locale: currentLocale }),
            getDay,
            locales,
        });
    }, [i18n.language]);

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
        'LEASE_START',
        'LEASE_END',
        'PAYMENT_DUE',
        'FOLLOW_UP',
        'MEETING',
    ]);
    const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
    const [localMeetings, setLocalMeetings] = useState<CalendarEvent[]>([]);

    const loadEvents = useCallback(async () => {
        try {
            const start = startOfMonth(date);
            const end = endOfMonth(addMonths(date, 1));
            const data = await calendarService.getEvents(start, end, selectedTypes);
            setEvents(data);
        } catch (error) {
            console.error('Failed to load calendar events:', error);
            toast.error(t('calendar.errors.loadFailed'));
        } finally {
            setLoading(false);
        }
    }, [date, selectedTypes, t]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const toggleEventType = (type: EventType) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const eventTypeButtons = [
        { type: 'LEASE_START' as EventType, label: t('calendar.eventTypes.leaseStart'), color: 'bg-blue-500' },
        { type: 'LEASE_END' as EventType, label: t('calendar.eventTypes.leaseEnd'), color: 'bg-purple-500' },
        { type: 'PAYMENT_DUE' as EventType, label: t('calendar.eventTypes.paymentDue'), color: 'bg-green-500' },
        { type: 'FOLLOW_UP' as EventType, label: t('calendar.eventTypes.followUps'), color: 'bg-pink-500' },
        { type: 'MEETING' as EventType, label: t('calendar.eventTypes.meetings'), color: 'bg-red-500' },
    ];

    // Combine server events with local meetings
    const allEvents = [
        ...events,
        ...localMeetings.filter(m => selectedTypes.includes('MEETING')),
    ];

    // Handler for when a meeting is created
    const handleMeetingCreated = useCallback((meeting: CreatedMeeting) => {
        const newEvent: CalendarEvent = {
            id: meeting.id,
            type: 'MEETING',
            title: `📹 ${meeting.title}`,
            start: new Date(meeting.startTime),
            end: new Date(meeting.endTime),
            allDay: false,
            metadata: {
                meetingUrl: meeting.joinUrl,
                provider: meeting.type,
                description: meeting.description,
                attendees: meeting.attendees,
                organizer: meeting.organizer,
            },
        };
        setLocalMeetings(prev => [...prev, newEvent]);

        // Navigate to the meeting date
        setDate(new Date(meeting.startTime));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">{t('calendar.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <CalendarIcon className="h-6 w-6" />
                                {t('calendar.title')}
                            </h1>
                            <p className="text-sm text-muted-foreground">{t('calendar.subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => setCreateMeetingOpen(true)}>
                                <Video className="mr-2 h-4 w-4" />
                                {t('calendar.scheduleMeeting')}
                            </Button>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                {eventTypeButtons.map(({ type, label, color }) => (
                                    <Button
                                        key={type}
                                        size="sm"
                                        variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                                        onClick={() => toggleEventType(type)}
                                        className={selectedTypes.includes(type) ? `${color} hover:opacity-90` : ''}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="px-6 py-6 max-w-7xl mx-auto">
                <Card className="p-6 bg-card border-border">
                    <Calendar
                        localizer={localizer}
                        events={allEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 700 }}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        eventPropGetter={eventStyleGetter}
                        messages={{
                            today: t('calendar.navigation.today'),
                            previous: t('calendar.navigation.previous'),
                            next: t('calendar.navigation.next'),
                            month: t('calendar.navigation.month'),
                            week: t('calendar.navigation.week'),
                            day: t('calendar.navigation.day'),
                            agenda: t('calendar.navigation.agenda'),
                        }}
                        onSelectEvent={(event) => {
                            if (event.type === 'MEETING' && event.metadata?.meetingUrl) {
                                toast.info(`${event.title}`, {
                                    description: `${format(event.start, 'PPP p')} - ${format(event.end, 'p')}`,
                                    action: {
                                        label: t('calendar.joinMeeting'),
                                        onClick: () => window.open(event.metadata?.meetingUrl, '_blank'),
                                    },
                                    duration: 10000,
                                });
                            } else {
                                toast.info(`${event.title}`, {
                                    description: format(event.start, 'PPP'),
                                });
                            }
                        }}
                    />
                </Card>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-6 justify-center flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm text-muted-foreground">{t('calendar.eventTypes.leaseStart')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500"></div>
                        <span className="text-sm text-muted-foreground">{t('calendar.eventTypes.leaseEnd')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">{t('calendar.eventTypes.paymentDue')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-pink-500"></div>
                        <span className="text-sm text-muted-foreground">{t('calendar.eventTypes.followUps')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm text-muted-foreground">{t('calendar.eventTypes.meetings')}</span>
                    </div>
                </div>
            </div>

            <CreateMeetingDialog
                open={createMeetingOpen}
                onOpenChange={setCreateMeetingOpen}
                onMeetingCreated={handleMeetingCreated}
            />
        </div>
    );
}
