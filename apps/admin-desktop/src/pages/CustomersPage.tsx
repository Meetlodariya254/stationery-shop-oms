import { useState } from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { useCustomers } from '../hooks/useApi';
import { formatDate } from '../lib/utils';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { CreateCustomerModal } from '../components/CreateCustomerModal';

export function CustomersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useCustomers({ page, ...(search ? { search } : {}) });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void refetch();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/customers/${id}/activate`, { isActive: !currentStatus });
      toast.success(`Customer ${!currentStatus ? 'activated' : 'deactivated'}`);
      void refetch();
    } catch (err: unknown) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" /> Customers
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage B2B customer accounts</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, name, email or phone..."
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="table-container flex-1">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Contact Info</th>
                    <th>GST Number</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((customer) => (
                    <tr key={customer.id}>
                      <td className="font-bold text-gray-900">{customer.companyName}</td>
                      <td className="font-medium text-gray-700">{customer.user.name}</td>
                      <td>
                        <div className="text-xs">
                          <p className="text-gray-900">{customer.phone}</p>
                          <p className="text-gray-500">{customer.user.email}</p>
                        </div>
                      </td>
                      <td className="text-gray-500">{customer.gstNumber || '—'}</td>
                      <td className="text-gray-500">{formatDate(customer.createdAt)}</td>
                      <td>
                        <span className={`badge ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => void toggleStatus(customer.id, customer.isActive)}
                          className={`text-xs font-medium hover:underline ${customer.isActive ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {customer.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data?.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

      <CreateCustomerModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
