import { useState } from 'react';
import { IndianRupee, Search, Save, Package } from 'lucide-react';
import { useCustomers, useCustomerPrices, useSetPrice } from '../hooks/useApi';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

export function PricingPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // Need all active customers to select from
  const { data: customersData, isLoading: customersLoading } = useCustomers({ page: 1 }); // Simplification for demo
  
  const { data: prices, isLoading: pricesLoading } = useCustomerPrices(selectedCustomerId);
  const { mutateAsync: setPrice } = useSetPrice();

  const [editingPrice, setEditingPrice] = useState<{ productId: string, price: string } | null>(null);

  const handleSavePrice = async (productId: string) => {
    if (!editingPrice || !selectedCustomerId) return;
    try {
      const price = parseFloat(editingPrice.price);
      if (isNaN(price) || price < 0) {
        toast.error('Invalid price');
        return;
      }
      await setPrice({ customerId: selectedCustomerId, productId, price });
      toast.success('Price updated successfully');
      setEditingPrice(null);
    } catch {
      toast.error('Failed to update price');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-brand-600" /> Customer Pricing
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage exclusive pricing for individual customers.</p>
      </div>

      <div className="card p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
        {customersLoading ? (
          <div className="skeleton h-10 w-full md:w-1/2" />
        ) : (
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="input md:w-1/2"
          >
            <option value="">-- Choose a customer --</option>
            {customersData?.items.map(c => (
              <option key={c.id} value={c.id}>{c.companyName} ({c.user.name})</option>
            ))}
          </select>
        )}
      </div>

      {selectedCustomerId && (
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-50">
            <h2 className="font-semibold text-brand-900">Custom Price List</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Filter products..." className="input pl-9 py-1.5 text-sm border-brand-200 focus:border-brand-500 focus:ring-brand-500" />
            </div>
          </div>
          
          {pricesLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="table-container flex-1">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Custom Price (INR)</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prices?.map((item) => {
                    const isEditing = editingPrice?.productId === item.id;
                    return (
                      <tr key={item.id} className={item.customerPrice ? 'bg-green-50/30' : ''}>
                        <td className="font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {item.customerPrice && <span className="w-2 h-2 rounded-full bg-green-500" title="Has custom price"></span>}
                            {item.name}
                          </div>
                        </td>
                        <td className="text-gray-500">{item.sku}</td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingPrice.price}
                              onChange={(e) => setEditingPrice({ productId: item.id, price: e.target.value })}
                              className="input py-1 text-sm w-32 border-brand-400 focus:ring-brand-500 focus:border-brand-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') void handleSavePrice(item.id);
                                if (e.key === 'Escape') setEditingPrice(null);
                              }}
                            />
                          ) : (
                            <span className={`font-semibold ${item.customerPrice ? 'text-green-700' : 'text-gray-400'}`}>
                              {item.customerPrice ? formatCurrency(item.customerPrice.price) : 'Not assigned'}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => void handleSavePrice(item.id)} className="btn-primary btn-sm px-2 py-1 text-xs">Save</button>
                              <button onClick={() => setEditingPrice(null)} className="btn-secondary btn-sm px-2 py-1 text-xs">Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingPrice({ productId: item.id, price: item.customerPrice?.price.toString() || '0' })}
                              className="text-brand-600 hover:text-brand-800 text-sm font-medium hover:underline"
                            >
                              {item.customerPrice ? 'Edit Price' : 'Assign Price'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedCustomerId && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <Package className="w-16 h-16 mb-4 opacity-20" />
          <p>Please select a customer to view and manage their pricing.</p>
        </div>
      )}
    </div>
  );
}
