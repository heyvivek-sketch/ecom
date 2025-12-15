import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CURRENCY, PAYU_TEST_CONFIG } from '../constants';
import { dbService } from '../services/db';
import { Order, OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';

const Checkout: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState({ street: '', city: '', zip: '', phone: '' });
  const [processing, setProcessing] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) navigate('/login?redirect=checkout');
  }, [user, navigate]);

  if (!user || items.length === 0) return null;

  const totalAmount = Number((cartTotal * 1.18).toFixed(2));
  const txnid = 'TXN' + Math.floor(Math.random() * 1000000000);

  const handlePayUCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // 1. Create Pending Order in DB
    const order: Order = {
      id: txnid,
      userId: user.id,
      userName: user.name,
      items: items,
      totalAmount: totalAmount,
      status: OrderStatus.PENDING,
      txnId: txnid,
      createdAt: new Date().toISOString(),
      shippingAddress: `${address.street}, ${address.city} - ${address.zip}, Phone: ${address.phone}`
    };
    dbService.createOrder(order);

    // 2. Simulate Backend Hash Generation (See services/payu.ts for real logic)
    // In a real app, you would fetch the hash from your backend here.
    // const response = await fetch('/api/payu/hash', { ... });
    // const { hash } = await response.json();
    
    // 3. Simulate PayU Redirection (Since we are client-side only)
    setTimeout(() => {
      // Simulate Payment Success
      dbService.updateOrderStatus(txnid, OrderStatus.PAID);
      clearCart();
      navigate(`/order-success?txnid=${txnid}&amount=${totalAmount}`);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Secure Checkout</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Shipping Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 font-bold text-xs">1</div>
            Shipping Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" value={user.name} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Street Address</label>
              <input 
                required 
                type="text" 
                value={address.street} 
                onChange={e => setAddress({...address, street: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input 
                  required 
                  type="text" 
                  value={address.city}
                  onChange={e => setAddress({...address, city: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input 
                  required 
                  type="text" 
                  value={address.zip}
                  onChange={e => setAddress({...address, zip: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                required 
                type="tel" 
                value={address.phone}
                onChange={e => setAddress({...address, phone: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" 
              />
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 font-bold text-xs">2</div>
            Order Summary
          </h2>
          <div className="divide-y divide-gray-100">
             {items.map(item => (
               <div key={item.id} className="py-2 flex justify-between text-sm">
                 <span className="text-gray-600">{item.name} x {item.quantity}</span>
                 <span className="font-medium">{CURRENCY} {item.price * item.quantity}</span>
               </div>
             ))}
             <div className="py-2 flex justify-between font-bold text-lg mt-2">
               <span>Total Payable</span>
               <span className="text-indigo-600">{CURRENCY} {totalAmount}</span>
             </div>
          </div>
        </div>

        {/* PayU Button */}
        <button
          onClick={handlePayUCheckout}
          disabled={!address.street || !address.phone || processing}
          className="w-full bg-green-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <span className="animate-pulse">Processing Payment...</span>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              Pay Securely with PayU
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <CreditCard className="h-3 w-3" />
          Encrypted by PayU Payments India
        </p>

        {/* 
            HIDDEN FORM FOR REAL PAYU INTEGRATION 
            In a real app, this form is submitted programmatically after receiving Hash from backend.
        */}
        <form action={PAYU_TEST_CONFIG.actionUrl} method="post" id="payu_form" className="hidden">
           <input type="hidden" name="key" value={PAYU_TEST_CONFIG.key} />
           <input type="hidden" name="txnid" value={txnid} />
           <input type="hidden" name="amount" value={totalAmount} />
           <input type="hidden" name="productinfo" value="LuxeMart Order" />
           <input type="hidden" name="firstname" value={user.name} />
           <input type="hidden" name="email" value={user.email} />
           <input type="hidden" name="phone" value={address.phone} />
           <input type="hidden" name="surl" value={`${window.location.origin}/#/order-success`} />
           <input type="hidden" name="furl" value={`${window.location.origin}/#/order-failure`} />
           <input type="hidden" name="hash" value="HASH_FROM_BACKEND" />
        </form>
      </div>
    </div>
  );
};

export default Checkout;