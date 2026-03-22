import { OrderListItem } from "@/types/order";

export type SellableProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  gstRate: number;
  availableQuantity: number;
};

export type CreateBillPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  storeId?: string;
  storeName?: string;
  performedBy?: string;
  performerRole?: string;
};

export type BillGenerationResult = {
  order: OrderListItem;
};
