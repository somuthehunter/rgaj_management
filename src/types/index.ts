// Enums
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  STORE_ADMIN = "STORE_ADMIN",
}

export enum TransactionType {
  SELL = "SELL",
  DISTRIBUTE = "DISTRIBUTE",
  RETURN = "RETURN",
}

export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  managerId: string;
  managerName: string;
  createdAt: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  storeId: string;
  storeName: string;
  category: string;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  products: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  timestamp: string;
  description: string;
}

export interface Bill {
  id: string;
  storeId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  customerName?: string;
}

export interface DashboardStats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueChange: number;
  ordersChange: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

