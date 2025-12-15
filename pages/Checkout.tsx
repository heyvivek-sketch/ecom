
import React, { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CURRENCY, PAYU_TEST_CONFIG } from '../constants';
import { dbService } from '../services/db';
import { Order, OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Loader2 } from 'lucide-react';

const Checkout: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [address, setAddress] = useState({ street: '', city: '', zip: '', phone: '' });
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState('');

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

    try {
        // 1. Create Pending Order in DB via API
        const orderData = {
          items: items,
          totalAmount: totalAmount,
          shippingAddress: `${address.street}, ${address.city} - ${address.zip}, Phone: ${address.phone}`,
          txnId: txnid
        };
        await dbService.createOrder(orderData as any);

        // 2. Fetch Hash from Backend
        const hashData = await dbService.getPayUHash({
            txnid,
            amount: totalAmount,
            productinfo: 'LuxeMart Order',
            firstname: user.name,
            email: user.email
        });
        
        setHash(hashData.hash);

        // 3. Submit Form to PayU
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.submit();
            }
        }, 1000);

    } catch (error) {
        console.error("Checkout failed", error);
        alert("Something went wrong. Please try again.");
        setProcessing(false);
    }
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
            <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Redirecting to PayU...
            </span>
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

        {/* REAL PAYU FORM */}
        <form 
            ref={formRef} 
            action={PAYU_TEST_CONFIG.actionUrl} 
            method="post" 
            className="hidden"
        >
           <input type="hidden" name="key" value={PAYU_TEST_CONFIG.key} />
           <input type="hidden" name="txnid" value={txnid} />
           <input type="hidden" name="amount" value={totalAmount} />
           <input type="hidden" name="productinfo" value="LuxeMart Order" />
           <input type="hidden" name="firstname" value={user.name} />
           <input type="hidden" name="email" value={user.email} />
           <input type="hidden" name="phone" value={address.phone} />
           {/* In real app, these point to backend endpoints that redirect */}
           <input type="hidden" name="surl" value="http://localhost:5000/api/payu/webhook" />
           <input type="hidden" name="furl" value="http://localhost:5000/api/payu/webhook" />
           <input type="hidden" name="hash" value={hash} />
        </form>
      </div>
    </div>
  );
};

export default Checkout;
