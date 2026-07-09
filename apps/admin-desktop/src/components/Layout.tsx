import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Tags, IndianRupee, ClipboardList, BarChart, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

const sidebarLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/pricing', label: 'Customer Pricing', icon: IndianRupee },
  { to: '/reports', label: 'Reports', icon: BarChart },
  { to: '/profile', label: 'Admin Profile', icon: UserIcon },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 relative z-20 shadow-xl">
        <div className="h-16 flex items-center px-6 bg-gray-950 border-b border-gray-800">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-3">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide text-gray-100">OMS Admin</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                location.pathname === to
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 bg-gray-950 border-t border-gray-800">
          <div className="flex flex-col gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-brand-300 font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-brand-300 transition-colors">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </Link>
            <button
              onClick={() => void handleLogout()}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Window */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Titlebar draggable area (for electron frameless or titlebar context) */}
        <div className="h-4 app-region-drag bg-gray-50 w-full shrink-0" />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
