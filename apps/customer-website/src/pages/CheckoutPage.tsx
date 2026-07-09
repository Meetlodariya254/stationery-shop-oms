import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Package, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMe, useCreateOrder } from '../hooks/useApi';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../lib/utils';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: me, isLoading } = useMe();
  const { items, total, clearCart } = useCartStore();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState('');

  const customer = me?.customer;

  if (items.length === 0) {
    return (
      <div className="card p-16 text-center max-w-md mx-auto mt-8">
        <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Your cart is empty</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ...(specialInstructions ? { specialInstructions } : {}),
        ...(preferredDeliveryDate ? { preferredDeliveryDate } : {}),
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-success/${order.orderNumber}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to place order';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-40 w-full rounded-2xl" />
        <div className="skeleton h-60 w-full rounded-2xl" />
      </div>
    );
  }

  const billingAddr = customer?.addresses?.find((a: { type: string }) => a.type === 'BILLING');
  const shippingAddr = customer?.addresses?.find((a: { type: string }) => a.type === 'SHIPPING');

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 pb-16 sm:pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Review your order details and confirm</p>
      </div>

      {/* Customer Details (pre-filled, read-only) */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-600" /> Delivery Details
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-gray-500 text-[11px] sm:text-xs mb-0.5">Name</p>
            <p className="font-medium text-gray-900 truncate">{me?.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[11px] sm:text-xs mb-0.5">Company</p>
            <p className="font-medium text-gray-900 truncate">{customer?.companyName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[11px] sm:text-xs mb-0.5">Email</p>
            <p className="font-medium text-gray-900 truncate">{me?.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[11px] sm:text-xs mb-0.5">Phone</p>
            <p className="font-medium text-gray-900">{customer?.phone}</p>
          </div>
          {customer?.gstNumber && (
            <div>
              <p className="text-gray-500 text-[11px] sm:text-xs mb-0.5">GST Number</p>
              <p className="font-medium text-gray-900">{customer.gstNumber}</p>
            </div>
          )}
          {shippingAddr && (
            <div className="sm:col-span-2 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
              <p className="text-gray-500 text-[11px] sm:text-xs mb-0.5 font-medium">Shipping Address</p>
              <p className="font-medium text-gray-900 leading-snug">
                {shippingAddr.street}, {shippingAddr.city}, {shippingAddr.state} — {shippingAddr.pincode}
              </p>
            </div>
          )}
          {billingAddr && (
            <div className="sm:col-span-2 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
              <p className="text-gray-500 text-[11px] sm:text-xs mb-0.5 font-medium">Billing Address</p>
              <p className="font-medium text-gray-900 leading-snug">
                {billingAddr.street}, {billingAddr.city}, {billingAddr.state} — {billingAddr.pincode}
              </p>
            </div>
          )}
        </div>

        <p className="text-[11px] sm:text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
          Need to update your address? <Link to="/profile" className="text-brand-600 font-medium hover:underline">Go to Profile</Link>
        </p>
      </div>

      {/* Optional fields */}
      <div className="card p-4 sm:p-6 space-y-4 sm:space-y-5">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900">Additional Details</h2>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" /> Preferred Delivery Date (Optional)
          </label>
          <input
            type="date"
            value={preferredDeliveryDate}
            onChange={(e) => setPreferredDeliveryDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input text-sm sm:text-base py-2.5 sm:py-2"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-400" /> Special Instructions (Optional)
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            className="input resize-none text-sm sm:text-base py-2.5 sm:py-2"
            placeholder="Any special delivery instructions or notes for the shop owner..."
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
        <div className="space-y-2 text-xs sm:text-sm max-h-52 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-600 truncate mr-3">{item.name} × {item.quantity} {item.unit}</span>
              <span className="font-semibold text-gray-900 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-base sm:text-lg">
          <span>Grand Total</span>
          <span className="text-brand-700">{formatCurrency(total())}</span>
        </div>
        <p className="text-[11px] sm:text-xs text-gray-400 mt-2">
          Payment: Cash / UPI / Bank Transfer directly to the shop owner.
        </p>
      </div>

      <button
        onClick={() => void handlePlaceOrder()}
        disabled={isPending}
        className="btn-primary btn-lg w-full py-3.5 text-base shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold"
      >
        {isPending ? (
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : <ShoppingCart className="w-5 h-5" />}
        {isPending ? 'Placing Order...' : `✓ Place Order (${formatCurrency(total())})`}
      </button>
    </div>
  );
}
