import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { useCart } from '../context/CartContext';
import { CURRENCY } from '../constants';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = id ? dbService.getProduct(id) : null;

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        <div className="space-y-4">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
          </button>
          <img src={product.imageUrl} alt={product.name} className="w-full h-96 object-cover rounded-xl bg-gray-100" />
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-indigo-600 font-medium mt-2">{product.category}</p>
          </div>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold text-gray-900">{CURRENCY} {product.price}</span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <button
              onClick={() => { addToCart(product); navigate('/cart'); }}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg shadow-indigo-200"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;