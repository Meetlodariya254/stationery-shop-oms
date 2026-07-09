import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../lib/utils';

export function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="card p-16 text-center max-w-md mx-auto mt-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">Add products from the catalog to get started</p>
        <Link to="/products" className="btn-primary">
          <Package className="w-4 h-4" /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-xs sm:text-sm text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">{itemCount()} items</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Top row on mobile / Left section on desktop */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-7 h-7 sm:w-8 sm:h-8 text-gray-200" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">SKU: {item.sku} • per {item.unit}</p>
                  <p className="text-xs sm:text-sm font-bold text-brand-700 mt-1 sm:hidden">{formatCurrency(item.price)}</p>
                </div>

                {/* Trash button on mobile right */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="sm:hidden p-2 text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Desktop unit price */}
              <div className="hidden sm:block flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-700">{formatCurrency(item.price)}</p>
              </div>

              {/* Bottom row on mobile / Right section on desktop */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2.5 border-t border-gray-100 sm:border-0 sm:pt-0 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all bg-white font-bold"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all bg-white font-bold"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="text-right flex items-center sm:block gap-3">
                  <p className="font-bold text-base sm:text-lg text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="hidden sm:block text-red-400 hover:text-red-600 mt-1 transition-colors ml-auto"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-5 sm:p-6 sticky top-20">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">Order Summary</h2>

            <div className="space-y-3 text-xs sm:text-sm max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                  <span className="font-medium flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 my-4" />

            <div className="flex justify-between font-bold text-base sm:text-lg">
              <span>Grand Total</span>
              <span className="text-brand-700">{formatCurrency(total())}</span>
            </div>

            <p className="text-[11px] sm:text-xs text-gray-400 mt-2 leading-relaxed">
              Payment via cash, UPI, or bank transfer directly to the shop owner upon confirmation.
            </p>

            <Link to="/checkout" className="btn-primary btn-lg w-full mt-5 hidden md:flex items-center justify-center">
              Proceed to Checkout →
            </Link>

            <Link to="/products" className="btn-secondary w-full mt-3 justify-center text-xs sm:text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Fixed Mobile Checkout Bottom Bar (sits right above bottom nav bar on mobile) */}
      <div className="md:hidden fixed bottom-[52px] left-0 right-0 bg-white border-t border-gray-200 p-3 px-4 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.08)] z-40">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Amount</p>
          <p className="text-lg font-bold text-brand-700 leading-tight">{formatCurrency(total())}</p>
        </div>
        <Link to="/checkout" className="btn-primary py-2.5 px-5 text-sm active:scale-95 transition-transform shadow-md">
          Checkout →
        </Link>
      </div>
    </div>
  );
}
