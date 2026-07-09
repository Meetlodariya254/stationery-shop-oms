import { useState } from 'react';
import { User, Lock, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMe, useChangePassword } from '../hooks/useApi';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { formatDate } from '../lib/utils';
import { queryClient } from '../main';

export function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const { logout } = useAuthStore();
  const clearCart = useCartStore((s) => s.clearCart);
  const { mutateAsync: changePassword, isPending: changingPassword } = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed. Please log in again.');
      queryClient.clear();
      clearCart();
      logout();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="skeleton h-10 w-32" />
        <div className="skeleton h-48 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const customer = me?.customer;
  const billingAddr = customer?.addresses?.find((a: { type: string }) => a.type === 'BILLING');
  const shippingAddr = customer?.addresses?.find((a: { type: string }) => a.type === 'SHIPPING');

  return (
    <div className="max-w-lg mx-auto space-y-5 sm:space-y-6 pb-16 sm:pb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Info */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-3.5 sm:gap-4 mb-5 sm:mb-6 border-b border-gray-100 pb-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-brand-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 text-base sm:text-lg truncate">{me?.name}</p>
            <p className="text-gray-500 text-xs sm:text-sm truncate">{me?.email}</p>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Member since {formatDate(me?.createdAt)}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900 truncate">{customer?.phone ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-gray-500">Company</p>
              <p className="font-medium text-gray-900 truncate">{customer?.companyName ?? '—'}</p>
            </div>
          </div>
          {customer?.gstNumber && (
            <div className="sm:col-span-2">
              <p className="text-[11px] sm:text-xs text-gray-500">GST Number</p>
              <p className="font-medium text-gray-900">{customer.gstNumber}</p>
            </div>
          )}
        </div>

        {/* Addresses */}
        {(billingAddr || shippingAddr) && (
          <div className="mt-4 border-t border-gray-100 pt-4 space-y-3 text-xs sm:text-sm">
            {billingAddr && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Billing Address</p>
                  <p className="text-gray-900 leading-snug">{billingAddr.street}, {billingAddr.city}, {billingAddr.state} — {billingAddr.pincode}</p>
                </div>
              </div>
            )}
            {shippingAddr && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Shipping Address</p>
                  <p className="text-gray-900 leading-snug">{shippingAddr.street}, {shippingAddr.city}, {shippingAddr.state} — {shippingAddr.pincode}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] sm:text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
          To update your contact details or address, please contact your account manager.
        </p>
      </div>

      {/* Change Password */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600" /> Change Password
        </h2>
        <form onSubmit={(e) => void handleChangePassword(e)} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input text-sm sm:text-base py-2.5 sm:py-2"
              required
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input text-sm sm:text-base py-2.5 sm:py-2"
              required
              placeholder="Min. 8 characters with uppercase and number"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input text-sm sm:text-base py-2.5 sm:py-2"
              required
              placeholder="Repeat new password"
            />
          </div>
          <button type="submit" disabled={changingPassword} className="btn-primary w-full py-3 text-sm sm:text-base active:scale-95 transition-transform shadow-sm">
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
