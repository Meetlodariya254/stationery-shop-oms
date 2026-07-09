import { useState } from 'react';
import { X, UserPlus, Building, Mail, Lock, Phone, MapPin, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateCustomer } from '../hooks/useApi';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCustomerModal({ isOpen, onClose }: CreateCustomerModalProps) {
  const { mutateAsync: createCustomer, isPending } = useCreateCustomer();

  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Billing Address
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingPincode, setBillingPincode] = useState('');

  // Shipping Address
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const billingAddress = {
      street: billingStreet,
      city: billingCity,
      state: billingState,
      pincode: billingPincode,
    };

    const shippingAddress = sameAsBilling
      ? { ...billingAddress }
      : {
          street: shippingStreet,
          city: shippingCity,
          state: shippingState,
          pincode: shippingPincode,
        };

    try {
      const payload: Record<string, unknown> = {
        companyName,
        name,
        email,
        password,
        phone,
        billingAddress,
        shippingAddress,
      };
      if (gstNumber) payload.gstNumber = gstNumber;
      await createCustomer(payload);

      toast.success('B2B Customer created successfully!');
      onClose();
      // Reset form
      setCompanyName('');
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setGstNumber('');
      setBillingStreet('');
      setBillingCity('');
      setBillingState('');
      setBillingPincode('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create customer';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create B2B Customer</h2>
              <p className="text-xs text-gray-500">Assign company profile and initial login credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Company & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <Building className="w-4 h-4 text-brand-600" /> Company & Contact Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="input text-sm py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="input text-sm py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="input text-sm pl-9 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="input text-sm py-2 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Login Credentials */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <Lock className="w-4 h-4 text-brand-600" /> Customer Login Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-50/50 p-4 rounded-xl border border-brand-100">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address (Username) *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="input text-sm pl-9 py-2 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Initial Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    min={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="input text-sm pl-9 py-2 bg-white font-mono"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Share these exact credentials with your customer.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Addresses */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-brand-600" /> Billing Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={billingStreet}
                  onChange={(e) => setBillingStreet(e.target.value)}
                  placeholder="Street Address / Building / Area"
                  className="input text-sm py-2"
                />
              </div>
              <input
                type="text"
                required
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
                placeholder="City"
                className="input text-sm py-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                  placeholder="State"
                  className="input text-sm py-2"
                />
                <input
                  type="text"
                  required
                  value={billingPincode}
                  onChange={(e) => setBillingPincode(e.target.value)}
                  placeholder="Pincode"
                  className="input text-sm py-2"
                />
              </div>
            </div>

            {/* Shipping Toggle */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">Shipping Address</span>
              <button
                type="button"
                onClick={() => setSameAsBilling(!sameAsBilling)}
                className="flex items-center gap-2 text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                {sameAsBilling ? (
                  <CheckSquare className="w-4 h-4 text-brand-600" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
                Same as Billing Address
              </button>
            </div>

            {!sameAsBilling && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-in fade-in duration-150">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    placeholder="Shipping Street Address"
                    className="input text-sm py-2"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="City"
                  className="input text-sm py-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    placeholder="State"
                    className="input text-sm py-2"
                  />
                  <input
                    type="text"
                    required
                    value={shippingPincode}
                    onChange={(e) => setShippingPincode(e.target.value)}
                    placeholder="Pincode"
                    className="input text-sm py-2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn-secondary py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary py-2 text-sm shadow-md shadow-brand-500/20"
            >
              {isPending ? 'Creating Customer...' : 'Create B2B Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
