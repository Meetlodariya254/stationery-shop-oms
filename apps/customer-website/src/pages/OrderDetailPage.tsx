import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { useOrder } from '../hooks/useApi';
import { formatCurrency, formatDate } from '../lib/utils';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-40 w-full rounded-2xl" />
        <div className="skeleton h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/orders" className="btn-primary mt-4 inline-flex">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 pb-16 sm:pb-6">
      <Link to="/orders" className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{order.orderNumber}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`badge-${order.status.toLowerCase()} text-xs sm:text-sm px-3 py-1.5 w-fit font-bold`}>
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Order Items ({order.items.length})</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">SKU: {item.product.sku}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Qty: <span className="font-bold text-gray-900">{item.quantity}</span> {item.product.unit}</p>
                </div>
              </div>

              <div className="flex justify-between sm:block items-center pt-2 sm:pt-0 border-t border-gray-50 sm:border-0 text-right">
                <span className="text-xs text-gray-500 sm:hidden font-medium">Subtotal</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(item.totalPrice)}</p>
                  <p className="text-[11px] sm:text-xs text-gray-400">{formatCurrency(item.unitPrice)} each</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4">
          <div className="flex justify-between font-bold text-base sm:text-lg">
            <span>Grand Total</span>
            <span className="text-brand-700">{formatCurrency(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="card p-4 sm:p-5 bg-amber-50 border-amber-100">
          <p className="text-xs sm:text-sm font-semibold text-amber-800">Special Instructions</p>
          <p className="text-xs sm:text-sm text-amber-700 mt-1 leading-relaxed">{order.specialInstructions}</p>
        </div>
      )}

      {order.preferredDeliveryDate && (
        <div className="card p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-500">Preferred Delivery Date</p>
          <p className="font-semibold text-gray-900 mt-0.5 text-sm sm:text-base">{formatDate(order.preferredDeliveryDate)}</p>
        </div>
      )}
    </div>
  );
}
