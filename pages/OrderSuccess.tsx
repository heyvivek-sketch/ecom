import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { CURRENCY } from '../constants';

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const txnid = searchParams.get('txnid');
  const amount = searchParams.get('amount');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your purchase. Your payment of <strong>{CURRENCY}{amount}</strong> was successful.
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-full mb-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
          <span className="text-gray-500">Transaction ID</span>
          <span className="font-mono font-medium text-gray-900">{txnid}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Status</span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">PAID via PayU</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/" className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;