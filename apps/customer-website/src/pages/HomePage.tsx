import { Link } from 'react-router-dom';
import { Package, ShoppingCart, ClipboardList, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProducts, useCategories, useOrders } from '../hooks/useApi';
import { formatCurrency } from '../lib/utils';

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { data: productsData, isLoading: productsLoading } = useProducts({ page: 1 });
  const { data: categories } = useCategories();
  const { data: ordersData } = useOrders({ page: 1 });

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-brand-800 to-brand-600 rounded-2xl p-5 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
          <Package className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <p className="text-brand-200 text-xs sm:text-sm font-medium mb-1">Welcome back!</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{user?.name}</h1>
          <p className="text-brand-100 text-xs sm:text-sm max-w-lg">
            Browse your exclusive product catalog and place orders.
          </p>
          <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-5 sm:mt-6">
            <Link to="/products" className="btn bg-white text-brand-700 hover:bg-brand-50 text-xs sm:text-sm py-2 sm:py-2.5">
              <Package className="w-4 h-4" /> Browse Products
            </Link>
            <Link to="/orders" className="btn bg-brand-700 text-white hover:bg-brand-900 border border-brand-500 text-xs sm:text-sm py-2 sm:py-2.5">
              <ClipboardList className="w-4 h-4" /> My Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Available Products', value: productsData?.total ?? '—', icon: Package, color: 'blue' },
          { label: 'Categories', value: categories?.length ?? '—', icon: TrendingUp, color: 'purple' },
          { label: 'Total Orders', value: ordersData?.total ?? '—', icon: ClipboardList, color: 'green' },
          { label: 'Pending Orders', value: ordersData?.items.filter(o => o.status === 'PENDING').length ?? '—', icon: ShoppingCart, color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 sm:p-5 flex flex-col justify-between">
            <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-2.5 sm:mb-3`}>
              <stat.icon className={`w-4 sm:w-5 h-4 sm:h-5 text-${stat.color}-600`} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{stat.value}</p>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Browse Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="card p-3 sm:p-4 text-center hover:shadow-md hover:border-brand-200 active:scale-95 transition-all group"
              >
                <div className="w-9 sm:w-10 h-9 sm:h-10 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-brand-100 transition-colors">
                  <Package className="w-4 sm:w-5 h-4 sm:h-5 text-brand-600" />
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-gray-700 leading-tight truncate px-1">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Products</h2>
          <Link to="/products" className="text-xs sm:text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all →
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-3 sm:p-4 space-y-3">
                <div className="skeleton h-28 sm:h-32 w-full rounded-lg" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {productsData?.items.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="card p-3 sm:p-4 hover:shadow-md hover:border-brand-200 active:scale-[0.98] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-gray-50 rounded-xl mb-2.5 sm:mb-3 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 truncate">{product.category.name}</p>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug mb-2 group-hover:text-brand-700 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-gray-50 mt-1">
                  <p className="text-sm sm:text-base font-bold text-brand-700">{formatCurrency(product.price)}</p>
                  <span className="text-[10px] sm:text-xs text-gray-400">/{product.unit}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      {ordersData && ordersData.items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-xs sm:text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all →
            </Link>
          </div>

          {/* Desktop Table View */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.items.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link to={`/orders/${order.id}`} className="font-medium text-brand-700 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge-${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(order.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Order Card View */}
          <div className="md:hidden space-y-2.5">
            {ordersData.items.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="card p-3.5 flex items-center justify-between active:scale-[0.99] transition-all border border-gray-100 hover:border-brand-200"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brand-700">{order.orderNumber}</span>
                    <span className={`badge-${order.status.toLowerCase()} text-[10px] px-2 py-0.5`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right flex items-center gap-2 pl-2">
                  <span className="font-bold text-sm text-gray-900">{formatCurrency(order.grandTotal)}</span>
                  <span className="text-gray-400 text-base">›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
