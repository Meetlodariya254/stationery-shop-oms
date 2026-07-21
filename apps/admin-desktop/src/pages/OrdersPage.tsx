import { useState } from 'react';
import { ClipboardList, Search, Filter } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '../hooks/useApi';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useOrders({
    page,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  });
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const statuses = ['PENDING', 'CONFIRMED', 'PACKED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-brand-600" /> Orders
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      <div className="card p-4 flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order number..."
            className="input pl-9"
          />
        </div>
        <div className="relative w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input pl-9"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="table-container flex-1">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order No.</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((order) => (
                    <tr key={order.id}>
                      <td className="font-bold text-brand-700 hover:underline cursor-pointer">{order.orderNumber}</td>
                      <td>
                        <p className="font-medium text-gray-900">{order.customer.companyName}</p>
                        <p className="text-xs text-gray-500">{order.customer.email}</p>
                      </td>
                      <td className="text-gray-500">{formatDate(order.createdAt)}</td>
                      <td>
                        <span className={`badge-${order.status.toLowerCase()}`}>{order.status}</span>
                      </td>
                      <td className="font-semibold text-gray-900">{formatCurrency(parseFloat(order.grandTotal.toString()))}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => void handleStatusChange(order.id, e.target.value)}
                          className="input py-1 text-sm w-auto"
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {data?.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-sm text-gray-500">
                  Showing page {page} of {data.totalPages} ({data.total} total)
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary btn-sm px-3 py-1 text-xs">Prev</button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page === data.totalPages} className="btn-secondary btn-sm px-3 py-1 text-xs">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
