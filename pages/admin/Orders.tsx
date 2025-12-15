import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { Order, OrderStatus } from '../../types';
import { CURRENCY } from '../../constants';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(dbService.getOrders());

  const handleStatusChange = (id: string, status: OrderStatus) => {
    dbService.updateOrderStatus(id, status);
    setOrders(dbService.getOrders());
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID: return 'bg-green-100 text-green-800';
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-800';
      case OrderStatus.DELIVERED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.txnId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.userName}<br/><span className="text-xs">{order.shippingAddress.split(',')[0]}...</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{CURRENCY} {order.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="border rounded text-xs p-1"
                    >
                      {Object.values(OrderStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;