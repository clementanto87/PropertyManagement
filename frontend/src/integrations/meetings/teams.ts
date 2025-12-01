import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { microsoftConfig } from './config';

class TeamsService {
  private msalInstance: PublicClientApplication | null = null;
  private accessToken: string | null = null;

  constructor() {
    if (microsoftConfig.isConfigured) {
      this.initializeMsal();
    }
  }

  isConfigured(): boolean {
    return microsoftConfig.isConfigured;
  }

  private initializeMsal() {
    if (!microsoftConfig.isConfigured) {
      console.warn('Microsoft Teams not configured - set VITE_MICROSOFT_CLIENT_ID');
      return;
    }

    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: microsoftConfig.clientId,
        authority: microsoftConfig.authority,
        redirectUri: microsoftConfig.redirectUri,
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
      },
    });
  }

  async signIn() {
    if (!microsoftConfig.isConfigured) {
      throw new Error('Microsoft Teams not configured');
    }
    if (!this.msalInstance) throw new Error('MSAL not initialized');

    try {
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: microsoftConfig.scopes,
      });

      if (loginResponse.accessToken) {
        this.accessToken = loginResponse.accessToken;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during Microsoft sign in', error);
      throw error;
    }
  }

  async signOut() {
    if (!this.msalInstance) return;

    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await this.msalInstance.logoutPopup({
          account: accounts[0],
          mainWindowRedirectUri: window.location.origin,
        });
      }
      this.accessToken = null;
    } catch (error) {
      console.error('Error during Microsoft sign out', error);
      throw error;
    }
  }

  async getAccount() {
    if (!this.msalInstance) return [];
    return this.msalInstance.getAllAccounts();
  }

  private async getAccessToken(): Promise<string> {
    if (!this.msalInstance) throw new Error('MSAL not initialized');

    if (this.accessToken) return this.accessToken;

    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        await this.signIn();
        return this.accessToken!;
      }

      const silentResult = await this.msalInstance.acquireTokenSilent({
        scopes: microsoftConfig.scopes,
        account: accounts[0],
      });

      this.accessToken = silentResult.accessToken;
      return silentResult.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // If silent token acquisition fails, try with popup
        const popupResult = await this.msalInstance.acquireTokenPopup({
          scopes: microsoftConfig.scopes,
        });
        this.accessToken = popupResult.accessToken;
        return popupResult.accessToken;
      }
      console.error('Error acquiring access token', error);
      throw error;
    }
  }

  private async graphRequest(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();

    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`https://graph.microsoft.com/v1.0/${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Microsoft Graph API error');
    }

    return response.json();
  }

  async createMeeting(meetingDetails: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    attendees?: string[];
  }) {
    try {
      const event = {
        subject: meetingDetails.title,
        body: {
          contentType: 'HTML',
          content: meetingDetails.description || '',
        },
        start: {
          dateTime: meetingDetails.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: meetingDetails.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        isOnlineMeeting: true,
        attendees: meetingDetails.attendees?.map(email => ({
          emailAddress: { address: email },
          type: 'required',
        })),
      };

      const response = await this.graphRequest('me/events', {
        method: 'POST',
        body: JSON.stringify(event),
      });

      return {
        id: response.id,
        title: response.subject,
        startTime: response.start.dateTime,
        endTime: response.end.dateTime,
        joinUrl: response.onlineMeeting.joinUrl,
        organizer: response.organizer?.emailAddress?.address || '',
        type: 'teams' as const,
      };
    } catch (error) {
      console.error('Error creating Teams meeting', error);
      throw error;
    }
  }

  async listMeetings(timeMin: string, timeMax: string) {
    try {
      const response = await this.graphRequest(
        `me/events?$filter=start/dateTime ge '${timeMin}' and end/dateTime le '${timeMax}' and isOnlineMeeting eq true`
      );

      return response.value.map((event: any) => ({
        id: event.id,
        title: event.subject,
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
        joinUrl: event.onlineMeeting?.joinUrl || '',
        organizer: event.organizer?.emailAddress?.address || '',
        type: 'teams' as const,
      }));
    } catch (error) {
      console.error('Error listing Teams meetings', error);
      throw error;
    }
  }
}

export const teamsService = new TeamsService();
