
import { DB, Product, User, Order, Role, OrderStatus } from '../types';

const API_URL = 'http://localhost:5000/api';

// --- MOCK DATA FOR FALLBACK ---
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-fidelity audio with active noise cancellation and 30-hour battery life.',
    price: 14999,
    stock: 25,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80']
  },
  {
    id: '2',
    name: 'Designer Leather Jacket',
    description: 'Genuine leather jacket with a timeless design and modern slim fit.',
    price: 8999,
    stock: 15,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1551028919-ac7f2ca8f2fe?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1551028919-ac7f2ca8f2fe?w=800&q=80']
  },
  {
    id: '3',
    name: 'Smart Fitness Tracker',
    description: 'Track your health metrics, sleep patterns, and workouts with precision.',
    price: 3499,
    stock: 50,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80']
  },
  {
    id: '4',
    name: 'Modern Coffee Table',
    description: 'Minimalist oak wood design suitable for any modern living room.',
    price: 5499,
    stock: 10,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80']
  }
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'mock-order-1',
    userId: 'user-1',
    userName: 'Demo User',
    items: [{ ...MOCK_PRODUCTS[0], quantity: 1 }],
    totalAmount: 14999,
    status: OrderStatus.DELIVERED,
    txnId: 'TXN123456789',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    shippingAddress: '123 Mock Lane, Tech City'
  }
];

const getHeaders = () => {
  const user = localStorage.getItem('luxemart_user');
  const token = user ? JSON.parse(user).token : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const dbService = {
  // PRODUCTS
  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('API Error');
      return res.json();
    } catch (error) {
      console.warn("Backend unreachable, using mock data for products.");
      return MOCK_PRODUCTS;
    }
  },
  getProduct: async (id: string): Promise<Product | undefined> => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`);
      if (!res.ok) throw new Error('API Error');
      return res.json();
    } catch (error) {
      console.warn(`Backend unreachable, looking up product ${id} in mock data.`);
      return MOCK_PRODUCTS.find(p => p.id === id);
    }
  },
  saveProduct: async (product: Product): Promise<Product> => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    } catch (error) {
      console.error("Save product failed (Mock Mode):", error);
      // Mock successful save
      return product;
    }
  },
  deleteProduct: async (id: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (error) {
      console.error("Delete product failed (Mock Mode):", error);
    }
  },
  
  // ORDERS
  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      return res.json();
    } catch (error) {
      console.warn("Backend unreachable, returning mock orders.");
      return MOCK_ORDERS;
    }
  },
  createOrder: async (order: Partial<Order>): Promise<Order> => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(order)
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    } catch (error) {
       console.warn("Backend unreachable, creating mock order.");
       return {
         ...order,
         id: 'mock-new-order-' + Date.now(),
         status: OrderStatus.PENDING,
         createdAt: new Date().toISOString(),
         userName: 'Demo User'
       } as Order;
    }
  },
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    } catch (error) {
       console.warn("Backend unreachable, returning mock updated order.");
       const mockOrder = MOCK_ORDERS.find(o => o.id === id) || MOCK_ORDERS[0];
       return { ...mockOrder, status };
    }
  },

  // STATS
  getStats: async () => {
    try {
      const res = await fetch(`${API_URL}/stats`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API Error');
      return res.json();
    } catch (error) {
      return { totalRevenue: 154500, totalOrders: 12, totalUsers: 5 };
    }
  },

  // AUTH / USER
  findUser: async (email: string) => {
     return null; 
  },
  
  // PAYU
  getPayUHash: async (data: any) => {
    try {
      const res = await fetch(`${API_URL}/payu/hash`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Hash generation failed');
      return res.json();
    } catch (error) {
      console.error("PayU Hash generation failed:", error);
      // Fallback for demo purposes only - DO NOT USE IN PRODUCTION
      return { hash: "mock_hash_demo_only" };
    }
  }
};