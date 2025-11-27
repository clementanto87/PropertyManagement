import { useState, useEffect, useCallback } from 'react';
import { googleMeetService } from '../integrations/meetings/googleMeet';
import { teamsService } from '../integrations/meetings/teams';
import { MeetingDetails } from '../integrations/meetings/config';

type Provider = 'google' | 'teams';

interface UseMeetingsReturn {
  isGoogleSignedIn: boolean;
  isTeamsSignedIn: boolean;
  isGoogleConfigured: boolean;
  isTeamsConfigured: boolean;
  signIn: (provider: Provider) => Promise<void>;
  signOut: (provider: Provider) => Promise<void>;
  createMeeting: (
    provider: Provider,
    details: {
      title: string;
      startTime: string;
      endTime: string;
      description?: string;
      attendees?: string[];
    }
  ) => Promise<MeetingDetails>;
  listMeetings: (
    provider: Provider,
    startDate: Date,
    endDate: Date
  ) => Promise<MeetingDetails[]>;
  loading: boolean;
  error: string | null;
}

export function useMeetings(): UseMeetingsReturn {
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [isTeamsSignedIn, setIsTeamsSignedIn] = useState(false);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const [isTeamsConfigured, setIsTeamsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Meet service
  useEffect(() => {
    const initializeGoogle = async () => {
      // Check if Google is configured
      if (!googleMeetService.isConfigured()) {
        setIsGoogleConfigured(false);
        console.info('Google Meet not configured - skipping initialization');
        return;
      }

      setIsGoogleConfigured(true);
      try {
        await googleMeetService.initialize((isSignedIn: boolean) => {
          setIsGoogleSignedIn(isSignedIn);
        });
      } catch (err) {
        console.error('Failed to initialize Google Meet', err);
        // Don't set error for missing config - it's expected in dev
      }
    };

    initializeGoogle();
  }, []);

  // Check Teams sign-in status
  useEffect(() => {
    const checkTeamsSignIn = async () => {
      try {
        // Check if Teams is configured
        if (!teamsService.isConfigured()) {
          setIsTeamsConfigured(false);
          console.info('Microsoft Teams not configured - skipping initialization');
          return;
        }

        setIsTeamsConfigured(true);
        const accounts = await teamsService.getAccount();
        setIsTeamsSignedIn(!!accounts?.length);
      } catch (err) {
        console.error('Error checking Teams sign-in status', err);
      }
    };

    checkTeamsSignIn();
  }, []);

  const signIn = useCallback(async (provider: Provider) => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'google') {
        await googleMeetService.signIn();
        setIsGoogleSignedIn(true);
      } else {
        await teamsService.signIn();
        setIsTeamsSignedIn(true);
      }
    } catch (err) {
      console.error(`Error signing in to ${provider}`, err);
      setError(`Failed to sign in to ${provider === 'google' ? 'Google' : 'Microsoft Teams'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (provider: Provider) => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'google') {
        await googleMeetService.signOut();
        setIsGoogleSignedIn(false);
      } else {
        await teamsService.signOut();
        setIsTeamsSignedIn(false);
      }
    } catch (err) {
      console.error(`Error signing out from ${provider}`, err);
      setError(`Failed to sign out from ${provider === 'google' ? 'Google' : 'Microsoft Teams'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeeting = useCallback(
    async (
      provider: Provider,
      details: {
        title: string;
        startTime: string;
        endTime: string;
        description?: string;
        attendees?: string[];
      }
    ) => {
      setLoading(true);
      setError(null);
      try {
        if (provider === 'google') {
          if (!isGoogleSignedIn) {
            await signIn('google');
          }
          return await googleMeetService.createMeeting(details);
        } else {
          if (!isTeamsSignedIn) {
            await signIn('teams');
          }
          return await teamsService.createMeeting(details);
        }
      } catch (err) {
        console.error(`Error creating ${provider} meeting`, err);
        setError(
          `Failed to create ${provider === 'google' ? 'Google Meet' : 'Teams'} meeting`
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isGoogleSignedIn, isTeamsSignedIn, signIn]
  );

  const listMeetings = useCallback(
    async (provider: Provider, startDate: Date, endDate: Date) => {
      setLoading(true);
      setError(null);
      try {
        const timeMin = startDate.toISOString();
        const timeMax = endDate.toISOString();

        if (provider === 'google') {
          if (!isGoogleSignedIn) {
            await signIn('google');
          }
          return await googleMeetService.listMeetings(timeMin, timeMax);
        } else {
          if (!isTeamsSignedIn) {
            await signIn('teams');
          }
          return await teamsService.listMeetings(timeMin, timeMax);
        }
      } catch (err) {
        console.error(`Error listing ${provider} meetings`, err);
        setError(
          `Failed to list ${provider === 'google' ? 'Google Meet' : 'Teams'} meetings`
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isGoogleSignedIn, isTeamsSignedIn, signIn]
  );

  return {
    isGoogleSignedIn,
    isTeamsSignedIn,
    isGoogleConfigured,
    isTeamsConfigured,
    signIn,
    signOut,
    createMeeting,
    listMeetings,
    loading,
    error,
  };
}
