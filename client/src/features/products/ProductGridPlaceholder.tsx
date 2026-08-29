import { ShoppingBag, Star, Tag as TagIcon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface ProductGridPlaceholderProps {
  products?: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    tag: string;
  }>;
}

export function ProductGridPlaceholder({ products = [] }: ProductGridPlaceholderProps) {
  const incrementCart = useAppStore((state) => state.incrementCart);

  if (!products || products.length === 0) {
    return (
      <div className="py-12 px-4 text-center bg-slate-50 border border-slate-200/80 rounded-2xl max-w-xl mx-auto space-y-3 shadow-xs my-8">
        <TagIcon className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
        <h4 className="text-base font-bold text-slate-800">No Data Found</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          No products available to display at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              {product.tag}
            </span>
            <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">{product.category}</p>

          <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
            <span className="text-xl font-extrabold text-slate-900">${product.price}</span>
            <button
              onClick={incrementCart}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

