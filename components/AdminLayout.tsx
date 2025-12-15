import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { path: '/admin/products', icon: <Package className="h-5 w-5" />, label: 'Products' },
    { path: '/admin/orders', icon: <ShoppingCart className="h-5 w-5" />, label: 'Orders' },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</h2>
          <nav className="mt-4 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};