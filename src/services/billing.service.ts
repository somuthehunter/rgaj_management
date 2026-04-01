import { getService, postService } from "./service";
import endpoints from "@/constants/query_const";
import {
  BillGenerationResult,
  BillingInvoice,
  BillingInvoiceItem,
  BillingInvoiceStore,
  BillingPaymentMethod,
  CreateBillPayload,
  SellableProduct,
} from "@/types/billing";

type StoreInventoryApiItem = {
  id: string;
  productId: string;
  availableWeight?: number;
  allocatedStones?: number;
  soldStones?: number;
  returnedStones?: number;
  stoneWeight?: number;
  product?: {
    id: string;
    name?: string;
    sku?: string;
    category?: string;
    purity?: string;
    hsnCode?: string;
    makingChargeType?: "PER_GRAM" | "FIXED" | "PERCENTAGE";
    makingCharge?: number;
    gstRate?: number;
  };
};

type PaginatedApiResponse<T> = {
  success: boolean;
  data?: T[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type InvoiceApiItem = {
  id: string;
  invoiceId?: string;
  productId?: string;
  productName?: string;
  sku?: string;
  purity?: string;
  hsnCode?: string;
  allocatedWeight?: number | null;
  actualWeight?: number;
  stoneCount?: number;
  stoneWeight?: number;
  netGoldWeight?: number;
  ratePerGram?: number;
  goldPrice?: number;
  makingCharge?: number;
  gstRate?: number;
  gstAmount?: number;
  totalAmount?: number;
  rfid?: string;
  isReturned?: boolean;
  createdAt?: string;
};

type InvoiceApiResponse = {
  success: boolean;
  data?: {
    id: string;
    invoiceNumber?: string;
    storeId?: string;
    customerId?: string | null;
    subtotal?: number;
    gstAmount?: number;
    totalAmount?: number;
    paymentMethod?: BillingPaymentMethod;
    status?: string;
    cashierId?: string;
    createdAt?: string;
    updatedAt?: string;
    items?: InvoiceApiItem[];
    customer?: {
      id?: string;
      name?: string;
      phone?: string;
      email?: string | null;
      address?: string | null;
      createdAt?: string;
      updatedAt?: string;
    } | null;
    store?: {
      id?: string;
      name?: string;
      code?: string;
    } | null;
  };
  message?: string;
};

const normalizeSellableProduct = (item: StoreInventoryApiItem): SellableProduct => ({
  id: item.product?.id ?? item.productId,
  name: item.product?.name ?? "Unnamed Product",
  sku: item.product?.sku ?? "N/A",
  category: item.product?.category ?? "",
  purity: item.product?.purity ?? "",
  hsnCode: item.product?.hsnCode ?? "",
  makingChargeType: item.product?.makingChargeType,
  makingCharge: item.product?.makingCharge ?? 0,
  gstRate: item.product?.gstRate ?? 0,
  availableWeight: item.availableWeight ?? 0,
  availableStones: Math.max(
    0,
    (item.allocatedStones ?? 0) - (item.soldStones ?? 0) + (item.returnedStones ?? 0),
  ),
  stoneWeight: item.stoneWeight ?? 0,
});

const normalizeInvoiceStore = (
  store: InvoiceApiResponse["data"] extends infer T
    ? T extends { store?: infer S }
      ? S
      : never
    : never,
  fallbackStoreId: string,
): BillingInvoiceStore | null => {
  if (!store) return null;

  return {
    id: store.id ?? fallbackStoreId,
    name: store.name ?? "Store",
    code: store.code ?? "N/A",
  };
};

const normalizeInvoiceItem = (item: InvoiceApiItem, invoiceId: string): BillingInvoiceItem => ({
  id: item.id,
  invoiceId: item.invoiceId ?? invoiceId,
  productId: item.productId ?? "",
  productName: item.productName ?? "Unnamed Product",
  sku: item.sku ?? "N/A",
  purity: item.purity ?? "",
  hsnCode: item.hsnCode ?? "",
  allocatedWeight: item.allocatedWeight ?? null,
  actualWeight: item.actualWeight ?? 0,
  stoneCount: item.stoneCount ?? 0,
  stoneWeight: item.stoneWeight ?? 0,
  netGoldWeight: item.netGoldWeight ?? 0,
  ratePerGram: item.ratePerGram ?? 0,
  goldPrice: item.goldPrice ?? 0,
  makingCharge: item.makingCharge ?? 0,
  gstRate: item.gstRate ?? 0,
  gstAmount: item.gstAmount ?? 0,
  totalAmount: item.totalAmount ?? 0,
  rfid: item.rfid ?? "N/A",
  isReturned: item.isReturned ?? false,
  createdAt: item.createdAt ?? new Date().toISOString(),
});

const normalizeInvoice = (invoice: NonNullable<InvoiceApiResponse["data"]>): BillingInvoice => ({
  id: invoice.id,
  invoiceNumber: invoice.invoiceNumber ?? invoice.id,
  storeId: invoice.storeId ?? "",
  customerId: invoice.customerId ?? null,
  subtotal: invoice.subtotal ?? 0,
  gstAmount: invoice.gstAmount ?? 0,
  totalAmount: invoice.totalAmount ?? 0,
  paymentMethod: invoice.paymentMethod ?? "CASH",
  status: invoice.status ?? "COMPLETED",
  cashierId: invoice.cashierId ?? "",
  createdAt: invoice.createdAt ?? new Date().toISOString(),
  updatedAt: invoice.updatedAt ?? invoice.createdAt ?? new Date().toISOString(),
  items: (invoice.items ?? []).map((item) => normalizeInvoiceItem(item, invoice.id)),
  customer: invoice.customer
    ? {
        id: invoice.customer.id ?? "",
        name: invoice.customer.name ?? "Walk-in Customer",
        phone: invoice.customer.phone ?? "Not provided",
        email: invoice.customer.email ?? null,
        address: invoice.customer.address ?? null,
        createdAt: invoice.customer.createdAt,
        updatedAt: invoice.customer.updatedAt,
      }
    : null,
  store: normalizeInvoiceStore(invoice.store, invoice.storeId ?? ""),
});

export const billingService = {
  getSellableProducts: async (storeId: string) => {
    const res = (await getService(
      `${endpoints.inventory.byStore(storeId)}?page=1&limit=100`,
    )) as PaginatedApiResponse<StoreInventoryApiItem>;

    return {
      success: res.success,
      data: (res.data ?? [])
        .filter((item) => (item.availableWeight ?? 0) > 0 && item.product?.id)
        .map(normalizeSellableProduct),
      message: res.message,
    };
  },

  generateBill: async (
    payload: CreateBillPayload,
  ): Promise<BillGenerationResult> => {
    const res = (await postService(endpoints.billing.invoices, payload)) as InvoiceApiResponse;

    if (!res.data) {
      throw new Error("Invoice was not returned by the server.");
    }

    return {
      invoice: normalizeInvoice(res.data),
    };
  },
};
