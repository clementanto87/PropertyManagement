import { googleConfig } from './config';

declare global {
  interface Window {
    gapi: any;
  }
}

/**
 * Google Meet Service
 * 
 * NOTE: Google's gapi.auth2 library is deprecated.
 * For production, migrate to Google Identity Services (GIS).
 * See: https://developers.google.com/identity/gsi/web/guides/migration
 * 
 * This service is disabled by default until properly configured with valid credentials.
 */
class GoogleMeetService {
  private isInitialized = false;
  private initializationError: string | null = null;
  private initializationAttempted = false;

  isConfigured(): boolean {
    // Only consider configured if we have real-looking credentials (not empty or placeholder)
    const hasValidClientId = googleConfig.clientId && 
      googleConfig.clientId.length > 20 && 
      !googleConfig.clientId.includes('your-');
    const hasValidApiKey = googleConfig.apiKey && 
      googleConfig.apiKey.length > 20 && 
      !googleConfig.apiKey.includes('your-');
    
    return Boolean(hasValidClientId && hasValidApiKey);
  }

  getInitializationError(): string | null {
    return this.initializationError;
  }

  async initialize(handleAuthChange: (isSignedIn: boolean) => void) {
    // Only attempt initialization once
    if (this.initializationAttempted) return;
    this.initializationAttempted = true;

    if (this.isInitialized) return;

    // Check if Google API credentials are configured
    if (!this.isConfigured()) {
      this.initializationError = 'Google Meet integration not configured.';
      // Silent - don't log warnings for unconfigured integration
      return;
    }

    // Note: The gapi.auth2 library is deprecated. 
    // For production use, migrate to Google Identity Services.
    // Skipping initialization to avoid deprecation errors.
    this.initializationError = 'Google Meet integration requires migration to new Google Identity Services. Contact your administrator.';
    console.info('Google Meet: Skipping deprecated gapi.auth2 initialization. Migration to GIS required.');
    return;
  }

  async signIn() {
    if (!this.isConfigured()) {
      throw new Error('Google Meet integration not configured');
    }
    if (!this.isInitialized) {
      throw new Error('Google API not initialized. Migration to Google Identity Services required.');
    }
    return window.gapi.auth2.getAuthInstance().signIn();
  }

  async signOut() {
    if (!this.isInitialized) return;
    return window.gapi.auth2.getAuthInstance().signOut();
  }

  async createMeeting(meetingDetails: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    attendees?: string[];
  }) {
    if (!this.isInitialized) {
      throw new Error('Google API not initialized');
    }

    const event = {
      summary: meetingDetails.title,
      description: meetingDetails.description || '',
      start: {
        dateTime: meetingDetails.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meetingDetails.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2, 11),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      attendees: meetingDetails.attendees?.map(email => ({ email })),
    };

    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      return {
        id: response.result.id,
        title: response.result.summary,
        startTime: response.result.start.dateTime,
        endTime: response.result.end.dateTime,
        joinUrl: response.result.hangoutLink,
        organizer: response.result.organizer?.email || '',
        type: 'google' as const,
      };
    } catch (error) {
      console.error('Error creating Google Meet', error);
      throw error;
    }
  }

  async listMeetings(timeMin: string, timeMax: string) {
    if (!this.isInitialized) {
      throw new Error('Google API not initialized');
    }

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.result.items
        .filter((event: any) => event.hangoutLink)
        .map((event: any) => ({
          id: event.id,
          title: event.summary,
          startTime: event.start.dateTime,
          endTime: event.end.dateTime,
          joinUrl: event.hangoutLink,
          organizer: event.organizer?.email || '',
          type: 'google' as const,
        }));
    } catch (error) {
      console.error('Error listing Google Meets', error);
      throw error;
    }
  }
}

export const googleMeetService = new GoogleMeetService();

  async signIn() {
    if (!googleConfig.isConfigured) {
      throw new Error('Google API credentials not configured');
    }
    if (!this.isInitialized) {
      throw new Error('Google API not initialized');
    }
    return window.gapi.auth2.getAuthInstance().signIn();
  }

  async signOut() {
    if (!this.isInitialized) return;
    return window.gapi.auth2.getAuthInstance().signOut();
  }

  async createMeeting(meetingDetails: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    attendees?: string[];
  }) {
    if (!this.isInitialized) {
      throw new Error('Google API not initialized');
    }

    const event = {
      summary: meetingDetails.title,
      description: meetingDetails.description || '',
      start: {
        dateTime: meetingDetails.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meetingDetails.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2, 11),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      attendees: meetingDetails.attendees?.map(email => ({ email })),
    };

    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      return {
        id: response.result.id,
        title: response.result.summary,
        startTime: response.result.start.dateTime,
        endTime: response.result.end.dateTime,
        joinUrl: response.result.hangoutLink,
        organizer: response.result.organizer?.email || '',
        type: 'google' as const,
      };
    } catch (error) {
      console.error('Error creating Google Meet', error);
      throw error;
    }
  }

  async listMeetings(timeMin: string, timeMax: string) {
    if (!this.isInitialized) {
      throw new Error('Google API not initialized');
    }

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.result.items
        .filter((event: any) => event.hangoutLink)
        .map((event: any) => ({
          id: event.id,
          title: event.summary,
          startTime: event.start.dateTime,
          endTime: event.end.dateTime,
          joinUrl: event.hangoutLink,
          organizer: event.organizer?.email || '',
          type: 'google' as const,
        }));
    } catch (error) {
      console.error('Error listing Google Meets', error);
      throw error;
    }
  }
}

export const googleMeetService = new GoogleMeetService();
