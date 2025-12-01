// Google OAuth2 Configuration (using Google Identity Services)
// Only requires Client ID - API Key is not needed with GIS
export const googleConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  scope: 'https://www.googleapis.com/auth/calendar',
  get isConfigured() {
    // Check for valid client ID format
    return Boolean(this.clientId && this.clientId.includes('.apps.googleusercontent.com'));
  }
};

// Microsoft Graph Configuration
export const microsoftConfig = {
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  authority: 'https://login.microsoftonline.com/common',
  redirectUri: window.location.origin,
  scopes: ['https://graph.microsoft.com/Calendars.ReadWrite', 'https://graph.microsoft.com/OnlineMeetings.ReadWrite'],
  get isConfigured() {
    return Boolean(this.clientId);
  }
};

// Common meeting interface
export interface MeetingDetails {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  joinUrl: string;
  organizer: string;
  type: 'google' | 'teams';
}
