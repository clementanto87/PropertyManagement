import { googleConfig } from './config';



interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: any) => void;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

/**
 * Google Meet Service using Google Identity Services (GIS)
 * 
 * This uses the new OAuth 2.0 authorization flow.
 * See: https://developers.google.com/identity/oauth2/web/guides/overview
 */
class GoogleMeetService {
  private tokenClient: TokenClient | null = null;
  private accessToken: string | null = null;
  private isGapiLoaded = false;
  private isGisLoaded = false;
  private authChangeCallback: ((isSignedIn: boolean) => void) | null = null;

  isConfigured(): boolean {
    const hasValidClientId = googleConfig.clientId &&
      googleConfig.clientId.length > 20 &&
      googleConfig.clientId.includes('.apps.googleusercontent.com');

    return Boolean(hasValidClientId);
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async initialize(handleAuthChange: (isSignedIn: boolean) => void): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    this.authChangeCallback = handleAuthChange;

    try {
      // Load Google Identity Services
      await this.loadScript('https://accounts.google.com/gsi/client');
      this.isGisLoaded = true;

      // Load GAPI for Calendar API
      await this.loadScript('https://apis.google.com/js/api.js');

      // Load the GAPI client
      await new Promise<void>((resolve) => {
        window.gapi.load('client', resolve);
      });

      // Initialize GAPI client with Calendar API
      await window.gapi.client.init({
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      });

      this.isGapiLoaded = true;

      // Initialize the token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleConfig.clientId,
        scope: 'https://www.googleapis.com/auth/calendar',
        callback: (response: TokenResponse) => {
          if (response.error) {
            console.error('Token error:', response.error);
            this.accessToken = null;
            handleAuthChange(false);
            return;
          }
          this.accessToken = response.access_token;
          handleAuthChange(true);
        },
        error_callback: (error: any) => {
          console.error('OAuth error:', error);
          this.accessToken = null;
          handleAuthChange(false);
        },
      });

      // Check if we have a cached token (session)
      const cachedToken = sessionStorage.getItem('google_access_token');
      if (cachedToken) {
        this.accessToken = cachedToken;
        window.gapi.client.setToken({ access_token: cachedToken });
        handleAuthChange(true);
      }

    } catch (error) {
      console.error('Failed to initialize Google Meet service:', error);
      throw error;
    }
  }

  isSignedIn(): boolean {
    return !!this.accessToken;
  }

  async signIn(): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Google Meet integration not configured');
    }

    if (!this.tokenClient) {
      throw new Error('Google API not initialized');
    }

    // Request access token - this opens the Google sign-in popup
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  async signOut(): Promise<void> {
    if (this.accessToken) {
      // Revoke the token
      await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
        method: 'POST',
      });
    }

    this.accessToken = null;
    sessionStorage.removeItem('google_access_token');
    window.gapi.client.setToken(null);

    if (this.authChangeCallback) {
      this.authChangeCallback(false);
    }
  }

  async createMeeting(meetingDetails: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    attendees?: string[];
  }) {
    if (!this.accessToken) {
      throw new Error('Not signed in to Google');
    }

    // Set the access token for the API call
    window.gapi.client.setToken({ access_token: this.accessToken });

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
        sendUpdates: 'all',
      });

      // Cache the token for future requests
      sessionStorage.setItem('google_access_token', this.accessToken);

      return {
        id: response.result.id,
        title: response.result.summary,
        startTime: response.result.start.dateTime,
        endTime: response.result.end.dateTime,
        joinUrl: response.result.hangoutLink,
        organizer: response.result.organizer?.email || '',
        type: 'google' as const,
      };
    } catch (error: any) {
      // Token might be expired, clear it
      if (error?.status === 401) {
        this.accessToken = null;
        sessionStorage.removeItem('google_access_token');
        if (this.authChangeCallback) {
          this.authChangeCallback(false);
        }
      }
      console.error('Error creating Google Meet:', error);
      throw error;
    }
  }

  async listMeetings(timeMin: string, timeMax: string) {
    if (!this.accessToken) {
      throw new Error('Not signed in to Google');
    }

    window.gapi.client.setToken({ access_token: this.accessToken });

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return (response.result.items || [])
        .filter((event: any) => event.hangoutLink)
        .map((event: any) => ({
          id: event.id,
          title: event.summary,
          startTime: event.start.dateTime || event.start.date,
          endTime: event.end.dateTime || event.end.date,
          joinUrl: event.hangoutLink,
          organizer: event.organizer?.email || '',
          type: 'google' as const,
        }));
    } catch (error: any) {
      if (error?.status === 401) {
        this.accessToken = null;
        sessionStorage.removeItem('google_access_token');
        if (this.authChangeCallback) {
          this.authChangeCallback(false);
        }
      }
      console.error('Error listing Google Meets:', error);
      throw error;
    }
  }
}

export const googleMeetService = new GoogleMeetService();
