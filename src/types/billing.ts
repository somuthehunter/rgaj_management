import { WeightUnit } from "./product";

export type BillingPaymentMethod = "CASH" | "CARD" | "UPI" | "MIXED";

export type SellableProduct = {
  id: string;
  name: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  hsnCode: string;
  weightUnit: WeightUnit;
  pricePerUnit: number;
  gstRate: number;
  availableWeight: number;
  availableStones: number;
};

export type CreateBillPayload = {
  storeId: string;
  paymentMethod: BillingPaymentMethod;
  items: Array<{
    productId: string;
    weight: number;
    stoneCount?: number;
  }>;
  customer: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
};

export type BillingCustomer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BillingInvoiceStore = {
  id: string;
  name: string;
  code: string;
};

export type BillingInvoiceItem = {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  sku: string;
  hsnCode: string;
  weight: number;
  stoneCount: number;
  pricePerUnit: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  rfid: string;
  isReturned: boolean;
  createdAt: string;
};

export type BillingInvoice = {
  id: string;
  invoiceNumber: string;
  storeId: string;
  customerId?: string | null;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: BillingPaymentMethod;
  status: string;
  cashierId: string;
  createdAt: string;
  updatedAt: string;
  items: BillingInvoiceItem[];
  customer: BillingCustomer | null;
  store: BillingInvoiceStore | null;
};

export type BillGenerationResult = {
  invoice: BillingInvoice;
};
