import { OrderListItem } from "@/types/order";

export type CustomerListItem = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchase: number;
  itemsPurchased: number;
  ordersCount: number;
  primaryStoreName: string;
  storeNames: string[];
  lastOrderDate: string;
  orders: OrderListItem[];
};

export type CustomerSearchParams = {
  search?: string;
  storeName?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};

export type CreateCustomerPayload = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
};
