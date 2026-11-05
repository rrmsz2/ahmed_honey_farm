import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SiteContentProvider } from '@/context/SiteContentContext';
import Checkout from '@/pages/Checkout';
import Landing from '@/pages/Landing';
import NotFound from '@/pages/NotFound';
import './App.css';

// The admin panel is split into its own bundle; storefront visitors never download it.
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Orders = lazy(() => import('@/pages/admin/Orders'));
const Products = lazy(() => import('@/pages/admin/Products'));
const Gallery = lazy(() => import('@/pages/admin/Gallery'));
const Content = lazy(() => import('@/pages/admin/Content'));
const Settings = lazy(() => import('@/pages/admin/Settings'));

const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-500" dir="rtl">
    جاري التحميل...
  </div>
);

const RequireAdmin = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
};

const adminRoutes = [
  ['', Dashboard],
  ['orders', Orders],
  ['products', Products],
  ['gallery', Gallery],
  ['content', Content],
  ['settings', Settings],
];

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <CartProvider>
        <SiteContentProvider>
          <BrowserRouter>
            <Suspense fallback={<FullPageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                {adminRoutes.map(([path, Page]) => (
                  <Route
                    key={path || 'index'}
                    path={`/admin/${path}`}
                    element={
                      <RequireAdmin>
                        <Page />
                      </RequireAdmin>
                    }
                  />
                ))}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </SiteContentProvider>
      </CartProvider>
    </AuthProvider>
  </LanguageProvider>
);

export default App;
