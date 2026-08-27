import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

export function RootLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-navy-900 font-sans selection:bg-gold-500 selection:text-navy-950">
      <Header />
      <main className={`flex-1 w-full ${isHomePage ? 'px-0 py-0 max-w-full' : 'max-w-7xl mx-auto px-[8px] py-8'}`}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
