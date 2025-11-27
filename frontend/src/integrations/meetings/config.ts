// Google OAuth2 Configuration
export const googleConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  scope: 'https://www.googleapis.com/auth/calendar',
};

// Microsoft Graph Configuration
export const microsoftConfig = {
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  authority: 'https://login.microsoftonline.com/common',
  redirectUri: window.location.origin,
  scopes: ['https://graph.microsoft.com/Calendars.ReadWrite', 'https://graph.microsoft.com/OnlineMeetings.ReadWrite']
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
