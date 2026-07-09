import { Link } from 'react-router-dom';
import { Package, Users, ClipboardList, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import { useDashboardStats } from '../hooks/useApi';
import { formatCurrency, formatDate } from '../lib/utils';

export function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 skeleton h-96 rounded-xl" />
          <div className="skeleton h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Orders', value: data?.todayOrders, icon: ClipboardList, color: 'brand' },
          { label: 'Pending Orders', value: data?.pendingOrders, icon: AlertCircle, color: 'amber' },
          { label: 'Monthly Sales', value: formatCurrency(data?.monthlySales ?? 0), icon: IndianRupee, color: 'green' },
          { label: 'Total Customers', value: data?.totalCustomers, icon: Users, color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 border-l-4" style={{ borderLeftColor: `var(--color-${stat.color}-500, #cbd5e1)` }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100`}>
                <stat.icon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400" /> Recent Orders
            </h2>
            <Link to="/orders" className="text-sm text-brand-600 font-medium hover:underline">View All</Link>
          </div>
          <div className="table-container flex-1">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-brand-700">{order.orderNumber}</td>
                    <td>{order.customer.companyName}</td>
                    <td className="text-gray-500">{formatDate(order.createdAt)}</td>
                    <td><span className={`badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td className="font-semibold text-gray-900">{formatCurrency(parseFloat(order.grandTotal.toString()))}</td>
                  </tr>
                ))}
                {(!data?.recentOrders || data.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="card flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Summary</h2>
          </div>
          <div className="p-5 space-y-5 flex-1">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Delivered Orders</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{data?.deliveredOrders}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Cancelled Orders</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{data?.cancelledOrders}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Total Products</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{data?.totalProducts}</span>
            </div>

            <div className="mt-8">
              <Link to="/products" className="btn-secondary w-full justify-center">Manage Products</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
