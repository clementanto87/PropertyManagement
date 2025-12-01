import { api } from '@/lib/api';

export type EventType = 'LEASE_START' | 'LEASE_END' | 'PAYMENT_DUE' | 'WORK_ORDER' | 'FOLLOW_UP' | 'MEETING';

export type CalendarEvent = {
    id: string;
    type: EventType;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    metadata?: {
        meetingUrl?: string;
        provider?: 'google' | 'teams';
        description?: string;
        attendees?: string[];
        [key: string]: any;
    };
};

export const calendarService = {
    getEvents: async (
        startDate: Date,
        endDate: Date,
        types?: EventType[]
    ): Promise<CalendarEvent[]> => {
        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });

        if (types && types.length > 0) {
            types.forEach(type => params.append('types', type));
        }

        const response = await api.get<{ items: CalendarEvent[] }>(`/calendar/events?${params}`);

        // Convert date strings to Date objects
        return response.items.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
        }));
    },
};
