import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Lock, Mail, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLogin } from '../hooks/useApi';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '@stationery-oms/types';
import { api } from '../lib/api';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  // Forgot / Reset Password State
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isForgotPending, setIsForgotPending] = useState(false);
  const [isResetPending, setIsResetPending] = useState(false);

  // Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login({ email, password });
      if (data.user.role !== UserRole.ADMIN) {
        toast.error('This app is for shop admins only.');
        return;
      }
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Admin login successful');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      toast.error(msg);
    }
  };

  // Forgot Password Handler (Send OTP)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your registered admin email');
      return;
    }
    setIsForgotPending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Verification code sent to your email (and logged in server console)');
      setMode('reset');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send verification code';
      toast.error(msg);
    } finally {
      setIsForgotPending(false);
    }
  };

  // Reset Password Handler (Verify OTP & Set New Password)
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    setIsResetPending(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully! Please sign in with your new password.');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to reset password';
      toast.error(msg);
    } finally {
      setIsResetPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-800">
            <Package className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mt-2">
            {mode === 'login' && 'Sign in to manage your stationery business'}
            {mode === 'forgot' && 'Account Password Recovery'}
            {mode === 'reset' && 'Verify Code & Set New Password'}
          </p>
        </div>

        <div className="card p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={(e) => void handleLoginSubmit(e)} autoComplete="off" className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10 py-2.5"
                    placeholder="admin@stationery.com"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-10 py-2.5"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5 text-base shadow-md shadow-brand-500/20">
                {isPending ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* MODE 2: FORGOT PASSWORD (REQUEST OTP) */}
          {mode === 'forgot' && (
            <form onSubmit={(e) => void handleForgotSubmit(e)} className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-900 flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <p>
                  Enter your registered admin email address. We will send a 6-digit verification code to reset your account credentials.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10 py-2.5"
                    placeholder="admin@stationery.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button type="submit" disabled={isForgotPending} className="btn-primary w-full py-2.5 text-base shadow-md">
                  {isForgotPending ? 'Sending Code...' : 'Send Verification Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: RESET PASSWORD (ENTER OTP & NEW PASSWORD) */}
          {mode === 'reset' && (
            <form onSubmit={(e) => void handleResetSubmit(e)} className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verification code sent to <strong>{email}</strong>.</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">6-Digit Verification Code (OTP)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input py-2.5 text-center text-lg font-bold tracking-widest uppercase font-mono bg-gray-50 border-2 focus:bg-white"
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input pl-10 pr-10 py-2.5 text-sm"
                    placeholder="At least 8 chars, uppercase, number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input pl-10 py-2.5 text-sm"
                    placeholder="Re-type new password"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button type="submit" disabled={isResetPending} className="btn-primary w-full py-2.5 text-base shadow-md">
                  {isResetPending ? 'Resetting Password...' : 'Reset & Save Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors text-center block"
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">OMS Admin Desktop v1.0.0</p>
      </div>
    </div>
  );
}
