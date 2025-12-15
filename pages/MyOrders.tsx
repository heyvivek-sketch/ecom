import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Order } from '../types';
import { CURRENCY } from '../constants';
import { Loader2, Package, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await dbService.getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-8">
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-8">Start shopping to see your orders here.</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-b border-gray-100">
               <div className="flex gap-8">
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-semibold">Order Placed</p>
                     <p className="text-sm font-medium text-gray-900">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                     <p className="text-sm font-medium text-gray-900">{CURRENCY} {order.totalAmount}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
                     <p className="text-sm font-medium text-gray-900 font-mono">{order.txnId}</p>
                   </div>
               </div>
               <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'PAID' || order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                      order.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
               </div>
            </div>
            <div className="p-6">
               {order.items.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-4 py-3 border-b last:border-0 border-gray-50">
                    <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                       <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-semibold text-gray-900">{item.name}</h4>
                       <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-medium text-gray-900">{CURRENCY} {item.price}</p>
                       <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;