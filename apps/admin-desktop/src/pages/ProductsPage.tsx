import { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useProducts, useDeleteProduct } from '../hooks/useApi';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { CreateProductModal } from '../components/CreateProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export function ProductsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useProducts({ page, ...(search ? { search } : {}) });

  const [editingProduct, setEditingProduct] = useState<NonNullable<typeof data>['items'][number] | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<NonNullable<typeof data>['items'][number] | null>(null);
  const { mutateAsync: deleteProduct, isPending: deleting } = useDeleteProduct();

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully!');
      setDeletingProduct(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete product';
      toast.error(msg);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void refetch();
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600" /> Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage product catalog and inventory</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Add Product
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
              placeholder="Search products by name or SKU..."
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
                    <th className="w-12"></th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>SKU</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{product.description}</p>
                      </td>
                      <td className="text-gray-600 font-medium">{product.category.name}</td>
                      <td className="text-gray-500">{product.sku}</td>
                      <td>
                        <span className={`font-semibold ${product.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stockQuantity} {product.unit}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data?.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        No products found.
                      </td>
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

      <CreateProductModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
      />
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        isPending={deleting}
      />
    </div>
  );
}
