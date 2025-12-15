
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { CURRENCY, CATEGORIES } from '../constants';
import { Plus, Check, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, items } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await dbService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isInCart = (id: string) => items.some(item => item.id === id);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Premium Quality</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Shop the latest electronics, fashion, and home accessories. 
          Secure checkout integrated with PayU.
        </p>
      </div>

      <div className="max-w-md mx-auto relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-shadow"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex justify-center space-x-4 overflow-x-auto pb-4">
        <button 
          onClick={() => setCategory('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === 'All' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button 
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-3">
             <div className="p-3 bg-gray-50 rounded-full">
               <Search className="h-8 w-8 text-gray-400" />
             </div>
             <p className="text-gray-600 text-lg font-medium">No products found matching your search criteria.</p>
             <button 
               onClick={() => { setSearchQuery(''); setCategory('All'); }}
               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
             >
               Clear all filters
             </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-64 object-cover object-center group-hover:opacity-75"
                  />
                </div>
              </Link>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{CURRENCY} {product.price}</p>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={isInCart(product.id)}
                    className={`p-2 rounded-full transition-colors ${isInCart(product.id) ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    {isInCart(product.id) ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
