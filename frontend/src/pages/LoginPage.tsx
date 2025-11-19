import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2,
  Check,
  Chrome,
  Square,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { setAuth, type AuthResponse } from '@/lib/auth';
import { loadGoogleScript, renderGoogleButton, initializeGoogleSignIn } from '@/lib/googleAuth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const MICROSOFT_TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Sign-In
    if (GOOGLE_CLIENT_ID) {
      loadGoogleScript(GOOGLE_CLIENT_ID)
        .then(() => {
          if (googleButtonRef.current) {
            renderGoogleButton(
              googleButtonRef.current,
              GOOGLE_CLIENT_ID,
              handleGoogleSignIn,
              (err) => {
                console.error('Google Sign-In error:', err);
              }
            );
          }
        })
        .catch((err) => {
          console.error('Failed to load Google script:', err);
        });
    }
  }, []);

  const handleGoogleSignIn = async (idToken: string) => {
    setGoogleLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/auth/google', {
        idToken
      });

      // Store auth token and user
      setAuth(response.token, response.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setError(message);
      setGoogleLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    if (!MICROSOFT_CLIENT_ID) {
      setError('Microsoft Sign-In is not configured. Please contact support.');
      return;
    }

    setMicrosoftLoading(true);
    setError(null);

    try {
      // Use Microsoft Identity Platform (MSAL) for authentication
      // For simplicity, we'll use the authorization code flow
      const redirectUri = window.location.origin + '/auth/microsoft/callback';
      const scopes = 'openid profile email User.Read';
      const authUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?` +
        `client_id=${MICROSOFT_CLIENT_ID}&` +
        `response_type=token&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_mode=fragment&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `state=12345`;

      // Open popup for Microsoft login
      const popup = window.open(
        authUrl,
        'microsoft-login',
        'width=500,height=600,left=' + (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 300)
      );

      // Listen for message from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'MICROSOFT_AUTH_SUCCESS') {
          const accessToken = event.data.accessToken;
          handleMicrosoftCallback(accessToken);
          window.removeEventListener('message', messageListener);
          popup?.close();
        } else if (event.data.type === 'MICROSOFT_AUTH_ERROR') {
          setError(event.data.error || 'Microsoft sign-in failed');
          setMicrosoftLoading(false);
          window.removeEventListener('message', messageListener);
          popup?.close();
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          if (microsoftLoading) {
            setMicrosoftLoading(false);
          }
        }
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate Microsoft Sign-In';
      setError(message);
      setMicrosoftLoading(false);
    }
  };

  const handleMicrosoftCallback = async (accessToken: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/microsoft', {
        accessToken
      });

      // Store auth token and user
      setAuth(response.token, response.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microsoft sign-in failed. Please try again.';
      setError(message);
      setMicrosoftLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password
      });

      // Store auth token and user
      setAuth(response.token, response.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Premium Login Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 p-8 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Property Management</h1>
              <p className="text-gray-500 font-medium">Sign in to your account</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-slide-up">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-900 bg-white"
                  required
                  disabled={loading || googleLoading || microsoftLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-900 bg-white"
                  required
                  disabled={loading || googleLoading || microsoftLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading || googleLoading || microsoftLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                disabled={loading || googleLoading || microsoftLoading}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                  rememberMe
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600'
                    : 'border-gray-300 hover:border-blue-400'
                } ${loading || googleLoading || microsoftLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {rememberMe && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>
              <label
                htmlFor="remember"
                onClick={() => !loading && !googleLoading && !microsoftLoading && setRememberMe(!rememberMe)}
                className={`ml-3 text-sm font-semibold text-gray-700 ${loading || googleLoading || microsoftLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || googleLoading || microsoftLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/40 hover:shadow-3xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-bold">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-1 gap-3">
            {/* Google Button */}
            <div className="relative">
              {GOOGLE_CLIENT_ID ? (
                <div 
                  ref={googleButtonRef} 
                  className="w-full"
                  style={{ minHeight: '48px' }}
                >
                  {googleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl border-2 border-gray-200">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setError('Google Sign-In is not configured')}
                  disabled={loading || googleLoading || microsoftLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Chrome className="w-5 h-5 text-blue-600" />
                  <span>Google</span>
                </button>
              )}
            </div>

            {/* Microsoft Button */}
            
          </div>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Secure login powered by industry-leading encryption
          </p>
        </div>
      </div>
    </div>
  );
}
