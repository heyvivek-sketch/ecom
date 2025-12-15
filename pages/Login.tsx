import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASS } from '../constants';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let success;
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(formData.name, formData.email, formData.password);
      }

      if (success) {
        navigate(redirect);
      } else {
        setError(isLogin ? 'Invalid credentials' : 'User already exists');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setFormData({ ...formData, email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASS });
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-indigo-600 hover:text-indigo-800"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
        
        {isLogin && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2">For Demo Purposes:</p>
            <button onClick={fillAdmin} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200">
              Auto-fill Admin Credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;