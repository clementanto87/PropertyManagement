import { useEffect } from 'react';

export default function MicrosoftCallbackPage() {
  useEffect(() => {
    // Extract access token from URL fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (accessToken) {
      // Send token to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'MICROSOFT_AUTH_SUCCESS',
          accessToken
        }, window.location.origin);
        window.close();
      }
    } else if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'MICROSOFT_AUTH_ERROR',
          error: errorDescription || error
        }, window.location.origin);
        window.close();
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
