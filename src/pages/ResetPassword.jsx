import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import localApi from '@/api/localClient';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { theme } = useTheme() || { theme: 'light' };
  
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError(language === 'ro' ? 'Token invalid sau lipsă' : 'Invalid or missing token');
    }
  }, [token, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError(language === 'ro' ? 'Completează toate câmpurile' : 'Fill all fields');
      return;
    }

    if (password.length < 6) {
      setError(language === 'ro' ? 'Parola trebuie să aibă minim 6 caractere' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'ro' ? 'Parolele nu coincid' : 'Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await localApi.auth.resetPassword(token, password);
      setSuccess(true);
      
      toast({
        title: language === 'ro' ? '✅ Parolă resetată!' : '✅ Password reset!',
        description: language === 'ro' 
          ? 'Parola ta a fost resetată cu succes. Te poți autentifica acum.' 
          : 'Your password has been reset successfully. You can now sign in.',
        duration: 5000,
      });

      // Redirect la login după 3 secunde
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || (language === 'ro' ? 'Eroare la resetarea parolei' : 'Error resetting password'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
        <div className="bg-white dark:bg-gray-800 rounded-[28px] shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ro' ? 'Token Invalid' : 'Invalid Token'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {language === 'ro' 
                ? 'Link-ul de resetare este invalid sau a expirat. Te rugăm să soliciți un link nou.' 
                : 'The reset link is invalid or expired. Please request a new link.'}
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {language === 'ro' ? 'Înapoi la Login' : 'Back to Login'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
        <div className="bg-white dark:bg-gray-800 rounded-[28px] shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ro' ? '✅ Parolă Resetată!' : '✅ Password Reset!'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {language === 'ro' 
                ? 'Parola ta a fost resetată cu succes. Vei fi redirecționat la pagina de login...' 
                : 'Your password has been reset successfully. You will be redirected to the login page...'}
            </p>
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20 py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-[28px] shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <img 
            src={theme === 'dark' ? '/logodark.png' : '/logolight.png'}
            alt="EatnFit Logo" 
            className="w-32 h-32 object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ro' ? '🔑 Resetează Parola' : '🔑 Reset Password'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ro' 
              ? 'Introdu parola nouă pentru contul tău' 
              : 'Enter your new password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[rgb(var(--ios-text-primary))] font-semibold">
              {language === 'ro' ? 'Parolă Nouă' : 'New Password'}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-[12px] text-base"
              required
              minLength={6}
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ro' ? 'Minim 6 caractere' : 'Minimum 6 characters'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[rgb(var(--ios-text-primary))] font-semibold">
              {language === 'ro' ? 'Confirmă Parola' : 'Confirm Password'}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 rounded-[12px] text-base"
              required
              minLength={6}
              disabled={submitting}
            />
          </div>

          <Button 
            type="submit"
            disabled={submitting || !password || !confirmPassword}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white h-14 text-lg font-bold rounded-[14px] shadow-xl"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {language === 'ro' ? 'Se resetează...' : 'Resetting...'}
              </>
            ) : (
              language === 'ro' ? 'Resetează Parola' : 'Reset Password'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {language === 'ro' ? 'Înapoi la Login' : 'Back to Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

