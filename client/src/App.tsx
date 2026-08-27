import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootLayout } from './components/layout/RootLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthInit } from './hooks/useAuthInit';
import { ToastProvider } from './components/ui/Toast';

// Synchronous core landing page
import { HomePage } from './pages/HomePage';

// Lazy-loaded Storefront Pages for code splitting & optimum performance
const CollectionsPage = lazy(() =>
  import('./pages/CollectionsPage').then((m) => ({ default: m.CollectionsPage })),
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
);
const CustomizePage = lazy(() =>
  import('./pages/CustomizePage').then((m) => ({ default: m.CustomizePage })),
);
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
);
const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage })),
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const AccountPage = lazy(() =>
  import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })),
);
const CMSPageDetailView = lazy(() =>
  import('./pages/CMSPageDetailView').then((m) => ({ default: m.CMSPageDetailView })),
);
const BlogPage = lazy(() =>
  import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })),
);
const BlogDetailPage = lazy(() =>
  import('./pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

// Lazy-loaded Admin Portal Pages
const AdminRoute = lazy(() =>
  import('./components/admin/AdminRoute').then((m) => ({ default: m.AdminRoute })),
);
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })),
);
const AdminFabricsPage = lazy(() =>
  import('./pages/admin/AdminFabricsPage').then((m) => ({ default: m.AdminFabricsPage })),
);
const AdminCustomizationPage = lazy(() =>
  import('./pages/admin/AdminCustomizationPage').then((m) => ({ default: m.AdminCustomizationPage })),
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
);
const AdminCustomersPage = lazy(() =>
  import('./pages/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })),
);
const AdminCouponsPage = lazy(() =>
  import('./pages/admin/AdminCouponsPage').then((m) => ({ default: m.AdminCouponsPage })),
);
const AdminContentPage = lazy(() =>
  import('./pages/admin/AdminContentPage').then((m) => ({ default: m.AdminContentPage })),
);
const AdminBlogsPage = lazy(() =>
  import('./pages/admin/AdminBlogsPage').then((m) => ({ default: m.AdminBlogsPage })),
);
const AdminAuditLogsPage = lazy(() =>
  import('./pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-navy-500 tracking-wider uppercase font-heading">
        Loading Atelier...
      </span>
    </div>
  </div>
);

function AppRoutes() {
  useAuthInit();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="category/:slug" element={<CollectionsPage />} />
          <Route path="categories/:slug" element={<CollectionsPage />} />
          <Route path="collection/:slug" element={<CollectionsPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="customize" element={<CustomizePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/success" element={<OrderConfirmationPage />} />
          <Route path="order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="page/:slug" element={<CMSPageDetailView />} />
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Portal Group */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="fabrics" element={<AdminFabricsPage />} />
                  <Route path="customizations" element={<AdminCustomizationPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="content" element={<AdminContentPage />} />
                  <Route path="blogs" element={<AdminBlogsPage />} />
                  <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  <Route path="*" element={<AdminDashboardPage />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
