import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, User as UserIcon } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export function Header() {
  const { cart, openCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const cartCount = (cart?.items || []).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-navy-900"
        >
          <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-gold-400 shadow-md">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="font-serif">
            Stitchx<span className="text-gold-600">Plus</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-amber-700 transition-colors">
            Home
          </Link>
          <Link to="/collections" className="hover:text-amber-700 transition-colors">
            Collections
          </Link>
          <Link to="/customize" className="hover:text-amber-700 transition-colors font-semibold text-amber-800">
            Customization Studio
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-navy-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{isAuthenticated ? user?.name || 'Account' : 'Sign In'}</span>
          </Link>

          <button
            onClick={openCart}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-gold-400 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-1 bg-amber-500 text-navy-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
