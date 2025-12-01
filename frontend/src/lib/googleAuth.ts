declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (momentNotification?: (notification: { getNotDisplayedReason: () => string; getSkippedReason: () => string; getDismissedReason: () => string }) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
    gapi: any;
  }
}

export function loadGoogleScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Wait a bit for Google to initialize
      setTimeout(() => resolve(), 100);
    };
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
    document.head.appendChild(script);
  });
}

export function initializeGoogleSignIn(
  clientId: string,
  onSuccess: (idToken: string) => void,
  onError?: (error: Error) => void
) {
  if (!window.google?.accounts?.id) {
    onError?.(new Error('Google Sign-In script not loaded'));
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          onSuccess(response.credential);
        } else {
          onError?.(new Error('No credential received'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Failed to initialize Google Sign-In'));
  }
}

export function renderGoogleButton(
  element: HTMLElement,
  clientId: string,
  onSuccess: (idToken: string) => void,
  onError?: (error: Error) => void
) {
  if (!window.google?.accounts?.id) {
    onError?.(new Error('Google Sign-In script not loaded'));
    return;
  }

  try {
    // Initialize first
    initializeGoogleSignIn(clientId, onSuccess, onError);

    // Render the button
    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: element.offsetWidth || 300
    });
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Failed to render Google button'));
  }
}

export function triggerGoogleSignIn() {
  if (!window.google?.accounts?.id) {
    throw new Error('Google Sign-In not initialized');
  }
  window.google.accounts.id.prompt();
}
