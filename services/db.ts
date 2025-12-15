import { DB, Product, User, Order, Role, OrderStatus } from '../types';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASS } from '../constants';

const STORAGE_KEY = 'luxemart_db_v1';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Noise Cancelling Headphones',
    description: 'Premium over-ear headphones with 30-hour battery life.',
    price: 4999,
    stock: 50,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    images: ['https://picsum.photos/400/400?random=1']
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Track your health, sleep, and workouts with ease.',
    price: 2499,
    stock: 100,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    images: ['https://picsum.photos/400/400?random=2']
  },
  {
    id: '3',
    name: 'Classic Leather Jacket',
    description: 'Genuine leather jacket with a timeless design.',
    price: 8999,
    stock: 20,
    category: 'Fashion',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    images: ['https://picsum.photos/400/400?random=3']
  },
  {
    id: '4',
    name: 'Minimalist Coffee Table',
    description: 'Oak wood finish, perfect for modern living rooms.',
    price: 3500,
    stock: 15,
    category: 'Home',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    images: ['https://picsum.photos/400/400?random=4']
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Super Admin',
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASS,
    role: Role.ADMIN
  },
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'user@store.com',
    password: 'user123',
    role: Role.USER
  }
];

const loadDB = (): DB => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const initialDB: DB = {
    users: INITIAL_USERS,
    products: INITIAL_PRODUCTS,
    orders: []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
  return initialDB;
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const dbService = {
  getProducts: () => loadDB().products,
  getProduct: (id: string) => loadDB().products.find(p => p.id === id),
  saveProduct: (product: Product) => {
    const db = loadDB();
    const index = db.products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      db.products[index] = product;
    } else {
      db.products.push(product);
    }
    saveDB(db);
  },
  deleteProduct: (id: string) => {
    const db = loadDB();
    db.products = db.products.filter(p => p.id !== id);
    saveDB(db);
  },
  
  getOrders: () => loadDB().orders,
  createOrder: (order: Order) => {
    const db = loadDB();
    db.orders.unshift(order);
    saveDB(db);
  },
  updateOrderStatus: (id: string, status: OrderStatus) => {
    const db = loadDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      saveDB(db);
    }
  },

  getStats: () => {
    const db = loadDB();
    const totalUsers = db.users.length;
    const totalOrders = db.orders.length;
    const totalRevenue = db.orders
      .filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.DELIVERED)
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
    return { totalUsers, totalOrders, totalRevenue };
  },

  // Auth Helpers
  findUser: (email: string) => loadDB().users.find(u => u.email === email),
  createUser: (user: User) => {
    const db = loadDB();
    db.users.push(user);
    saveDB(db);
  }
};