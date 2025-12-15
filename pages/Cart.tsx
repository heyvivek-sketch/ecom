import React from 'react';
import { useCart } from '../context/CartContext';
import { CURRENCY } from '../constants';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart ({itemCount} items)</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {items.map(item => (
              <li key={item.id} className="p-6 flex items-center">
                <img src={item.imageUrl} alt={item.name} className="h-20 w-20 object-cover rounded-lg bg-gray-100" />
                <div className="ml-6 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                    <p className="text-base font-bold text-gray-900">{CURRENCY} {item.price * item.quantity}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-50 text-gray-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 font-medium text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50 text-gray-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{CURRENCY} {cartTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (Estimated)</span>
              <span>{CURRENCY} {(cartTotal * 0.18).toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-indigo-600">{CURRENCY} {(cartTotal * 1.18).toFixed(2)}</span>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;