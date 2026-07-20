import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Package, ArrowLeft, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProduct } from '../hooks/useApi';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../lib/utils';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id!);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const addItem = useCartStore((s) => s.addItem);

  const handleDecrease = () => setQuantity((q) => Math.max(1, (typeof q === 'number' ? q : 1) - 1));
  const handleIncrease = () => setQuantity((q) => (typeof q === 'number' ? q : 0) + 1);
  const handleBlur = () => { if (quantity === '' || quantity < 1) setQuantity(1); };

  const handleAddToCart = () => {
    if (!product) return;
    const qty = typeof quantity === 'number' ? quantity : 1;
    
    const existingItem = useCartStore.getState().items.find((i) => i.productId === product.id);
    const requestedTotal = (existingItem?.quantity ?? 0) + qty;

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
      quantity: qty,
      stockQuantity: product.stockQuantity,
    });
    toast.success(`${product.name} added to cart`);
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="skeleton h-80 w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-6 w-1/2" />
          <div className="skeleton h-12 w-1/3" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500">Product not found or not available in your price list.</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-6">
      <Link to="/products" className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-5 sm:gap-8">
        {/* Image */}
        <div className="card overflow-hidden">
          <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 sm:p-8">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <Package className="w-20 sm:w-24 h-20 sm:h-24 text-gray-200" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5 sm:space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.category.name}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2.5 leading-snug">{product.name}</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">SKU: {product.sku}</p>
            </div>

            {product.description && (
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed bg-white p-3 sm:p-0 rounded-xl border border-gray-100 sm:border-0">{product.description}</p>
            )}

            <div className="card p-4 sm:p-5 bg-brand-50 border-brand-100">
              <p className="text-xs sm:text-sm text-brand-700 font-medium mb-1">Your Exclusive Price</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-bold text-brand-800 leading-none">{formatCurrency(product.price)}</p>
                <p className="text-xs sm:text-sm text-brand-600 font-medium">/ {product.unit}</p>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Select Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrease}
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all bg-white font-bold text-gray-700 shadow-sm"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
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
                  className="w-16 text-center font-bold text-lg text-gray-900 border border-gray-200 rounded-xl h-11 sm:h-10 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={handleIncrease}
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all bg-white font-bold text-gray-700 shadow-sm"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100 sm:border-0 sm:pt-0">
            <button
              onClick={handleAddToCart}
              className="btn-primary btn-lg w-full py-3.5 text-sm sm:text-base active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 font-bold"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart — {formatCurrency(product.price * (typeof quantity === 'number' ? quantity : 1))}
            </button>
            <p className="text-[11px] sm:text-xs text-gray-400 text-center font-medium">
              ✓ {product.stockQuantity} units available in stock right now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
