import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">جاري التحميل...</div>
    </div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
