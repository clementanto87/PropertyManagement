import { googleConfig } from './config';

declare global {
  interface Window {
    gapi: any;
  }
}

class GoogleMeetService {
  private isInitialized = false;

  async initialize(handleAuthChange: (isSignedIn: boolean) => void) {
    if (this.isInitialized) return;

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = async () => {
        try {
          await new Promise((resolve) => window.gapi.load('client:auth2', resolve));
          await window.gapi.client.init({
            apiKey: googleConfig.apiKey,
            clientId: googleConfig.clientId,
            discoveryDocs: googleConfig.discoveryDocs,
            scope: googleConfig.scope,
          });
          
          // Listen for sign-in state changes
          window.gapi.auth2.getAuthInstance().isSignedIn.listen(handleAuthChange);
          
          this.isInitialized = true;
          resolve();
        } catch (error) {
          console.error('Error initializing Google API', error);
          reject(error);
        }
      };
      script.onerror = (error) => {
        console.error('Error loading Google API script', error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  }

  async signIn() {
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
