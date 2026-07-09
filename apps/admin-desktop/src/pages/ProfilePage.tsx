import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { 
  User, Mail, Shield, Key, Terminal, Lock, CheckCircle2, 
  AlertTriangle, Save, RefreshCw, Eye, EyeOff, Calendar, 
  Check, X, HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';

export function ProfilePage() {
  const { user, setAuth, accessToken, refreshToken, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');

  // Profile update state
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Password requirements calculation
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && newPassword === confirmPassword;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await api.put<{ success: boolean; data: typeof user }>('/auth/profile', { name, email });
      if (res.data.success && res.data.data && accessToken && refreshToken) {
        setAuth(res.data.data, accessToken, refreshToken);
        toast.success('Profile updated successfully!');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error('Please fulfill all password requirements');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully! Please log in again.');
      logout();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Banner & Header */}
      <div className="relative bg-gradient-to-r from-gray-900 via-indigo-950 to-brand-900 rounded-2xl p-8 shadow-xl overflow-hidden border border-gray-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-brand-500/20 border-2 border-brand-400/50 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm text-2xl font-black text-brand-300">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name ?? 'Administrator'}</h1>
                <span className="px-2.5 py-0.5 bg-brand-500/30 border border-brand-400/30 rounded-full text-xs font-semibold text-brand-300 flex items-center gap-1">
                  👑 System Admin
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  🟢 Verified
                </span>
              </div>
              <p className="text-gray-300 text-sm mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-md text-xs text-gray-300 space-y-1 w-full md:w-auto">
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-gray-400">Account ID:</span>
              <span className="font-mono text-gray-200">{user?.userId ?? user?.id ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-gray-400">Access Level:</span>
              <span className="font-semibold text-brand-300">Full Access (Root)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" /> Profile Details
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
            activeTab === 'password'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Key className="w-4 h-4" /> Change Password
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Shield className="w-4 h-4" /> Emergency Recovery Guide
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card p-6 space-y-6 shadow-sm border border-gray-200/80">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-500">Update your account identity and registered contact email.</p>
            </div>

            <form onSubmit={(e) => void handleProfileSubmit(e)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input pl-10 py-2.5"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input pl-10 py-2.5"
                    placeholder="admin@stationery.com"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 inline" />
                  This email is used for login verification codes and order confirmation notifications.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile || (name === user?.name && email === user?.email)}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-md disabled:opacity-50"
                >
                  {isUpdatingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="card p-6 space-y-6 bg-gray-50/80 border border-gray-200/80">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600" /> System Access & Privileges
            </h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                <div>
                  <strong className="text-gray-900 block">Full Inventory Management</strong>
                  Can add, edit, and adjust products, SKU stocks, and pricing categories.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                <div>
                  <strong className="text-gray-900 block">B2B Customer Tier & Pricing</strong>
                  Can configure custom negotiated prices and approve corporate customers.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                <div>
                  <strong className="text-gray-900 block">Order Processing & Fulfillment</strong>
                  Can confirm, pack, dispatch, and cancel any purchase orders.
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card p-6 space-y-6 shadow-sm border border-gray-200/80">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Change Admin Password</h2>
              <p className="text-sm text-gray-500">Ensure your account uses a long, secure password to protect sensitive B2B business data.</p>
            </div>

            <form onSubmit={(e) => void handlePasswordSubmit(e)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="input pl-10 pr-10 py-2.5"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input pl-10 pr-10 py-2.5"
                    placeholder="Enter your new password"
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
                    className="input pl-10 py-2.5"
                    placeholder="Re-type new password"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword || !isPasswordValid || !currentPassword}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-md disabled:opacity-50"
                >
                  {isUpdatingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>

          <div className="card p-6 space-y-4 bg-gray-50/80 border border-gray-200/80">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600" /> Password Requirements
            </h3>
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                {hasMinLen ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-gray-300" />}
                <span className={hasMinLen ? 'text-gray-900 font-medium' : ''}>At least 8 characters long</span>
              </div>
              <div className="flex items-center gap-2">
                {hasUpper ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-gray-300" />}
                <span className={hasUpper ? 'text-gray-900 font-medium' : ''}>One uppercase letter (A-Z)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasLower ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-gray-300" />}
                <span className={hasLower ? 'text-gray-900 font-medium' : ''}>One lowercase letter (a-z)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasNumber ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <X className="w-4 h-4 text-gray-300" />}
                <span className={hasNumber ? 'text-gray-900 font-medium' : ''}>One number (0-9)</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                {confirmPassword && newPassword === confirmPassword ? (
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                ) : (
                  <X className="w-4 h-4 text-gray-300" />
                )}
                <span className={confirmPassword && newPassword === confirmPassword ? 'text-gray-900 font-medium' : ''}>
                  Passwords match exactly
                </span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 mt-4">
              <strong>Note:</strong> Changing your password will automatically log out all active sessions across desktop applications and web browsers.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Forgot Password Recovery Guide */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">What happens if an Admin forgets their password?</h3>
                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  As the root administrator of the B2B Stationery Order Management System, being locked out can disrupt order fulfillment. We have built <strong>two fail-safe mechanisms</strong> right into your system so you can always regain access securely:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method 1: Email OTP */}
            <div className="card p-6 border border-gray-200 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  Method 1: Quick Recovery
                </span>
                <Mail className="w-5 h-5 text-brand-600" />
              </div>
              <h4 className="font-bold text-gray-900 text-base">Forgot Password via Email Verification Code</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                If you forget your password on the Login Page, simply click the <strong>"Forgot Password?"</strong> link below the sign-in form.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                <li>Enter your registered admin email (`{user?.email ?? 'admin@stationery.com'}`).</li>
                <li>The server immediately generates a high-entropy <strong>6-digit OTP</strong> and emails it to your inbox.</li>
                <li>In development or when offline, the verification code is also printed securely in the backend server terminal (`npm run dev`).</li>
                <li>Enter the 6-digit code along with your new password to instantly regain access.</li>
              </ul>
            </div>

            {/* Method 2: CLI Script */}
            <div className="card p-6 border border-gray-200 space-y-4 hover:shadow-md transition-shadow bg-gray-900 text-gray-100">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  Method 2: Server Console Failsafe
                </span>
                <Terminal className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="font-bold text-white text-base">Terminal CLI Emergency Reset Script</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                If your email server (`SMTP`) is offline or you do not have access to your email inbox, the server host can run our built-in recovery tool directly from the server command line:
              </p>
              <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 font-mono text-xs text-brand-300 overflow-x-auto shadow-inner">
                cd apps/server<br />
                npm run reset-admin-password -- {user?.email ?? 'admin@stationery.com'} NewSecret@123
              </div>
              <p className="text-xs text-gray-400">
                This command directly updates the root password via secure bcrypt hashing and clears all locked sessions in milliseconds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
