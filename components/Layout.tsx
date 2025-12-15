import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { APP_NAME } from '../constants';

export const Layout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">{APP_NAME}</span>
              </Link>
            </div>
            
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              <Link to="/" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Shop</Link>
              
              {user ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="text-indigo-600 font-bold hover:text-indigo-800 px-3 py-2 text-sm">
                      Admin Panel
                    </Link>
                  ) : (
                    <Link to="/orders" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      My Orders
                    </Link>
                  )}
                  <span className="text-gray-900 text-sm font-medium flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> {user.name}
                  </span>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login / Register
                </Link>
              )}

              <Link to="/cart" className="relative p-2 text-gray-400 hover:text-indigo-600">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Shop</Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Cart ({itemCount})</Link>
              {user ? (
                <>
                   {isAdmin ? (
                     <Link to="/admin" className="block pl-3 pr-4 py-2 text-indigo-600 font-bold">Admin Panel</Link>
                   ) : (
                     <Link to="/orders" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800">My Orders</Link>
                   )}
                   <button onClick={handleLogout} className="block w-full text-left pl-3 pr-4 py-2 text-red-600">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block pl-3 pr-4 py-2 text-indigo-600">Login</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2024 {APP_NAME}. Secure Payments by PayU.
          </p>
        </div>
      </footer>
    </div>
  );
};