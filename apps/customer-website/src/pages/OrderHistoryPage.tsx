import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useOrders } from '../hooks/useApi';
import { formatCurrency, formatDate } from '../lib/utils';

export function OrderHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders({ page });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-10 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-16 sm:pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{data?.total ?? 0} total orders placed</p>
      </div>

      {data?.items.length === 0 ? (
        <div className="card p-12 sm:p-16 text-center">
          <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary inline-flex py-2.5 px-5 text-sm">Browse Products</Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order No.', 'Date', 'Items', 'Status', 'Total', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.items.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-brand-700">{order.orderNumber}</td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4 text-gray-500">{order.items.length} item(s)</td>
                    <td className="px-5 py-4">
                      <span className={`badge-${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900">{formatCurrency(order.grandTotal)}</td>
                    <td className="px-5 py-4">
                      <Link to={`/orders/${order.id}`} className="text-brand-600 hover:underline text-xs font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Order Cards View */}
          <div className="md:hidden space-y-3">
            {data?.items.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="card p-4 flex flex-col justify-between gap-3 active:scale-[0.99] transition-all border border-gray-100 hover:border-brand-200 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div>
                    <span className="font-bold text-sm text-brand-700 block">{order.orderNumber}</span>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`badge-${order.status.toLowerCase()} text-xs px-2.5 py-0.5`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 pt-0.5">
                  <span>{order.items.length} product(s)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-gray-900">{formatCurrency(order.grandTotal)}</span>
                    <span className="text-brand-600 font-semibold text-xs ml-1">Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary py-2 px-3 text-xs sm:text-sm">← Prev</button>
              <span className="text-xs sm:text-sm font-medium text-gray-600 px-2">Page {page} of {data.totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === data.totalPages} className="btn-secondary py-2 px-3 text-xs sm:text-sm">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
