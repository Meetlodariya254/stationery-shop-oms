import { useState } from 'react';
import { Tags, Plus, Edit, Trash2 } from 'lucide-react';
import { useCategories, useDeleteCategory } from '../hooks/useApi';
import toast from 'react-hot-toast';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { EditCategoryModal } from '../components/EditCategoryModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export function CategoriesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: categories, isLoading } = useCategories();
  const [editingCategory, setEditingCategory] = useState<NonNullable<typeof categories>[number] | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<NonNullable<typeof categories>[number] | null>(null);
  const { mutateAsync: deleteCategory, isPending: deleting } = useDeleteCategory();

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      toast.success('Category deleted successfully!');
      setDeletingCategory(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete category';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tags className="w-6 h-6 text-brand-600" /> Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((cat) => (
                  <tr key={cat.id}>
                    <td className="font-bold text-gray-900">{cat.name}</td>
                    <td className="text-gray-500">{cat.description || '—'}</td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-gray-500">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateCategoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
      />
      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        isPending={deleting}
      />
    </div>
  );
}
