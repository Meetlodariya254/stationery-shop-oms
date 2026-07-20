import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, ShoppingCart, Filter, Minus, Plus } from 'lucide-react';
import { useProducts, useCategories } from '../hooks/useApi';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

type ProductType = NonNullable<ReturnType<typeof useProducts>['data']>['items'][number];

function ProductCard({ product, onAdd }: { product: ProductType; onAdd: (product: ProductType, quantity: number) => void }) {
  const [quantity, setQuantity] = useState<number | ''>(1);

  const handleDecrease = () => setQuantity((q) => Math.max(1, (typeof q === 'number' ? q : 1) - 1));
  const handleIncrease = () => setQuantity((q) => (typeof q === 'number' ? q : 0) + 1);
  const handleBlur = () => { if (quantity === '' || quantity < 1) setQuantity(1); };

  return (
    <div className="card p-3 sm:p-4 flex flex-col justify-between hover:shadow-md hover:border-brand-200 transition-all group">
      <div>
        <Link to={`/products/${product.id}`} className="block mb-2.5 sm:mb-3">
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <Package className="w-10 sm:w-12 h-10 sm:h-12 text-gray-200" />
            )}
          </div>
        </Link>

        <span className="text-[10px] sm:text-xs text-brand-600 font-semibold uppercase tracking-wider mb-0.5 block truncate">{product.category.name}</span>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug hover:text-brand-700 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 mb-2.5 truncate">SKU: {product.sku}</p>
      </div>

      <div className="mt-auto pt-2 border-t border-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-2.5 sm:mb-3 gap-1">
          <div>
            <p className="text-base sm:text-xl font-bold text-brand-700 leading-tight">{formatCurrency(product.price)}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">per {product.unit}</p>
          </div>
          <span className="text-[10px] sm:text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded w-fit">
            {product.stockQuantity} left
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden flex-shrink-0 h-9 sm:h-10">
            <button
              onClick={handleDecrease}
              className="w-8 sm:w-9 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (e.target.value === '') setQuantity('');
                else if (!isNaN(val)) setQuantity(Math.max(1, val));
              }}
              onBlur={handleBlur}
              className="w-10 sm:w-11 text-center font-semibold text-xs sm:text-sm text-gray-900 border-none p-0 focus:ring-0 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handleIncrease}
              className="w-8 sm:w-9 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              const qty = typeof quantity === 'number' ? quantity : 1;
              onAdd(product, qty);
              setQuantity(1); // Reset quantity after adding
            }}
            className="btn-primary flex-1 text-xs sm:text-sm h-9 sm:h-10 active:scale-95 transition-transform shadow-sm flex items-center justify-center gap-1.5 rounded-lg px-2"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') ?? '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setSearchParams({
        ...(search ? { search } : {}),
        ...(selectedCategory ? { categoryId: selectedCategory } : {}),
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, setSearchParams]);

  const { data, isLoading } = useProducts({
    page,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(selectedCategory ? { categoryId: selectedCategory } : {}),
  });

  const { data: categories } = useCategories();
  const addItem = useCartStore((s) => s.addItem);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
    setSearchParams({ ...(search ? { search } : {}), ...(selectedCategory ? { categoryId: selectedCategory } : {}) });
  };

  const handleAddToCart = (product: ProductType, quantity: number) => {
    const existingItem = useCartStore.getState().items.find((i) => i.productId === product.id);
    const requestedTotal = (existingItem?.quantity ?? 0) + quantity;

    if (requestedTotal > product.stockQuantity) {
      toast.error(`Cannot add. Only ${product.stockQuantity} units available in stock.`);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      imageUrl: product.imageUrl ?? null,
      price: product.price,
      quantity,
      stockQuantity: product.stockQuantity,
    });
    toast.success(`${quantity} ${product.unit}(s) of ${product.name} added to cart`);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Browse products at your exclusive pricing</p>
      </div>

      {/* Search & Filter */}
      <div className="card p-3.5 sm:p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="input pl-9 text-sm py-2.5 w-full"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="input pl-9 pr-8 py-2.5 appearance-none text-sm w-full bg-white"
              >
                <option value="">All Categories</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <button type="submit" className="btn-primary py-2.5 px-5 text-sm flex-shrink-0">Search</button>
          </div>
        </form>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-3 sm:p-4 space-y-3">
              <div className="skeleton h-32 sm:h-40 w-full rounded-xl" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-9 w-full" />
            </div>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="card p-10 sm:p-12 text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Try adjusting your search query or category filter</p>
        </div>
      ) : (
        <>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">{data?.total} products found</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {data?.items.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pb-4">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary py-2 px-3 text-xs sm:text-sm"
              >
                ← Prev
              </button>
              <span className="text-xs sm:text-sm font-medium text-gray-600 px-2">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.totalPages}
                className="btn-secondary py-2 px-3 text-xs sm:text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
