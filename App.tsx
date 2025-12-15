import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import OrderSuccess from './pages/OrderSuccess';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route path="order-success" element={<OrderSuccess />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;