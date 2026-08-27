import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function RootLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 w-full ${isHomePage ? 'px-0 py-0 max-w-full' : 'max-w-7xl mx-auto px-[8px] py-8'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

