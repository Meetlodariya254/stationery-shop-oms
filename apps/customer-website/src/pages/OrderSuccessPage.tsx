import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Home } from 'lucide-react';

export function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h1>
      <p className="text-gray-500 mb-1">Your order has been received successfully.</p>
      <p className="text-sm font-semibold text-brand-700 bg-brand-50 px-4 py-2 rounded-full mb-6">
        Order #{orderNumber}
      </p>

      <p className="text-sm text-gray-400 mb-8 max-w-sm">
        The shop owner has been notified via email and will confirm your order shortly. Payment is to be made directly via cash, UPI, or bank transfer.
      </p>

      <p className="text-xs text-gray-400 mb-6 animate-pulse">Redirecting to home in 5 seconds...</p>

      <div className="flex gap-3">
        <Link to="/" className="btn-primary">
          <Home className="w-4 h-4" /> Go to Home
        </Link>
        <Link to="/orders" className="btn-secondary">
          <ClipboardList className="w-4 h-4" /> View Orders
        </Link>
      </div>
    </div>
  );
}
