import { useEffect, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { calendarService, CalendarEvent, EventType } from '@/api/calendarService';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const eventStyleGetter = (event: CalendarEvent) => {
    const colors = {
        LEASE_START: { backgroundColor: '#3b82f6', color: 'white' }, // Blue
        LEASE_END: { backgroundColor: '#8b5cf6', color: 'white' }, // Purple
        PAYMENT_DUE: { backgroundColor: '#10b981', color: 'white' }, // Green
        WORK_ORDER: { backgroundColor: '#f59e0b', color: 'white' }, // Orange
        FOLLOW_UP: { backgroundColor: '#ec4899', color: 'white' }, // Pink
    };

    return {
        style: colors[event.type] || { backgroundColor: '#6b7280', color: 'white' },
    };
};

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
        'LEASE_START',
        'LEASE_END',
        'PAYMENT_DUE',
        'FOLLOW_UP',
    ]);

    const loadEvents = useCallback(async () => {
        try {
            const start = startOfMonth(date);
            const end = endOfMonth(addMonths(date, 1));
            const data = await calendarService.getEvents(start, end, selectedTypes);
            setEvents(data);
        } catch (error) {
            console.error('Failed to load calendar events:', error);
            toast.error('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    }, [date, selectedTypes]);

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
        { type: 'LEASE_START' as EventType, label: 'Lease Start', color: 'bg-blue-500' },
        { type: 'LEASE_END' as EventType, label: 'Lease End', color: 'bg-purple-500' },
        { type: 'PAYMENT_DUE' as EventType, label: 'Payment Due', color: 'bg-green-500' },
        { type: 'FOLLOW_UP' as EventType, label: 'Follow-ups', color: 'bg-pink-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <CalendarIcon className="h-6 w-6" />
                                Calendar
                            </h1>
                            <p className="text-sm text-gray-500">View and manage property events</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-500" />
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
                <Card className="p-6">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 700 }}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={(event) => {
                            toast.info(`${event.title}`, {
                                description: format(event.start, 'PPP'),
                            });
                        }}
                    />
                </Card>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-6 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Lease Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500"></div>
                        <span className="text-sm text-gray-600">Lease End</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm text-gray-600">Payment Due</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-pink-500"></div>
                        <span className="text-sm text-gray-600">Follow-ups</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
