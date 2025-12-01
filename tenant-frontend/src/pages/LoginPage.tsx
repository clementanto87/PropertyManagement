import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { auth } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('login.emailPlaceholder'));
      return;
    }

    setIsLoading(true);
    try {
      await auth.login(email);
      setStep('otp');
      setOtpSent(true);
      setCountdown(60); // 60 second countdown
      toast.success(t('login.otpSent'));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('common.error');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      await auth.login(email);
      setCountdown(60);
      toast.success(t('login.otpSent'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error(t('login.otpPlaceholder'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await auth.verify(email, otp);
      const { token, user } = response.data.data; // Extract from { success: true, data: { token, user } }

      // Store token and user in localStorage
      localStorage.setItem('tenant_token', token);
      localStorage.setItem('tenant_user', JSON.stringify(user));

      // Update AuthContext state - THIS IS THE KEY FIX!
      setUser(user);

      toast.success(t('login.loginSuccessful'), {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });

      // Small delay to show success message, then navigate
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('common.error');
      toast.error(errorMessage);
      setOtp(''); // Clear OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-2xl font-bold">P</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {t('login.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 font-medium">{t('login.subtitle')}</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center dark:text-gray-100">
              {step === 'email' ? t('login.welcomeBack') : t('login.verifyLogin')}
            </CardTitle>
            <CardDescription className="text-center dark:text-gray-400">
              {step === 'email'
                ? t('login.enterEmail')
                : t('login.enterCode', { email })
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('login.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                      className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  type="submit"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('login.sending')}
                    </>
                  ) : (
                    <>
                      {t('login.sendCode')} <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {otpSent && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t('login.otpSent')}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('login.otp')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t('login.otpPlaceholder')}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 tracking-[0.5em] text-center text-lg font-semibold transition-all"
                      required
                      disabled={isLoading}
                      autoFocus
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('login.enterCode', { email })}
                  </p>
                </div>
                <Button
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('login.verifying')}
                    </>
                  ) : (
                    <>
                      {t('login.verifyLogin')} <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setOtpSent(false);
                      setCountdown(0);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                    disabled={isLoading}
                  >
                    ← {t('login.changeEmail')}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || countdown > 0}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? t('login.resendIn', { seconds: countdown }) : t('login.resendOtp')}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
