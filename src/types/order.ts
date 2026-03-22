import { OrderStatus } from "@/types";

export type OrderLineItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  customer: OrderCustomer;
  items: OrderLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
  createdAt: string;
  notes?: string;
};

export type OrderSearchStatus = "pending" | "completed" | "cancelled" | "";

export type OrderSearchParams = {
  search?: string;
  storeId?: string;
  status?: OrderSearchStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};
