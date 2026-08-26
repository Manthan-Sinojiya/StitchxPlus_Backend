import { ShoppingBag, Star } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const SAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Precision Custom Hoodie',
    category: 'Apparel & Textiles',
    price: 89.99,
    rating: 4.9,
    tag: 'Best Seller',
  },
  {
    id: '2',
    name: 'Tailored Embroidered Jacket',
    category: 'Outerwear',
    price: 149.99,
    rating: 5.0,
    tag: 'New Release',
  },
  {
    id: '3',
    name: 'Seamless Performance Tee',
    category: 'Activewear',
    price: 49.99,
    rating: 4.8,
    tag: 'Featured',
  },
];

export function ProductGridPlaceholder() {
  const incrementCart = useAppStore((state) => state.incrementCart);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {SAMPLE_PRODUCTS.map((product) => (
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
