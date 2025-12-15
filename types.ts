export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string; // In real app, never store plain text
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string; // Primary thumbnail
  images: string[]; // Gallery images
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  txnId: string;
  createdAt: string;
  shippingAddress: string;
}

export interface PayUConfig {
  key: string;
  salt: string;
  actionUrl: string; // https://test.payu.in/_payment or https://secure.payu.in/_payment
}

// Backend Mock Interface
export interface DB {
  users: User[];
  products: Product[];
  orders: Order[];
}