import { getService, patchService } from "./service";
import endpoints from "@/constants/query_const";
import { OrderStatus, PaginatedResponse } from "@/types";
import { OrderLineItem, OrderListItem, OrderSearchParams } from "@/types/order";
import { getUser } from "./session.service";
import { normalizeRole } from "@/lib/auth";
import { UserRole } from "@/types";

type InvoiceListApiItem = {
  id: string;
  invoiceNumber?: string;
  storeId?: string;
  customerId?: string | null;
  subtotal?: number;
  gstAmount?: number;
  totalAmount?: number;
  paymentMethod?: string;
  status?: string;
  cashierId?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string | null;
  } | null;
  store?: {
    id?: string;
    name?: string;
    code?: string;
  } | null;
  _count?: {
    items?: number;
    refunds?: number;
  };
};

type InvoiceDetailApiItem = {
  id: string;
  invoiceId?: string;
  productId?: string;
  productName?: string;
  sku?: string;
  purity?: string;
  hsnCode?: string;
  actualWeight?: number;
  ratePerGram?: number;
  goldPrice?: number;
  makingCharge?: number;
  gstRate?: number;
  gstAmount?: number;
  totalAmount?: number;
  stoneWeight?: number;
  rfid?: string;
  isReturned?: boolean;
};

type InvoiceDetailApiResponse = {
  success: boolean;
  data?: InvoiceListApiItem & {
    items?: InvoiceDetailApiItem[];
    customer?: {
      id?: string;
      name?: string;
      phone?: string;
      email?: string | null;
      address?: string | null;
    } | null;
  };
  message?: string;
};

type InvoiceListResponse = {
  success: boolean;
  data?: InvoiceListApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

const normalizeOrderStatus = (status?: string): OrderStatus => {
  if (status === "CANCELLED") return OrderStatus.CANCELLED;
  if (status === "DRAFT") return OrderStatus.PENDING;
  return OrderStatus.COMPLETED;
};

const normalizeLineItem = (item: InvoiceDetailApiItem): OrderLineItem => ({
  id: item.id,
  productId: item.productId ?? "",
  productName: item.productName ?? "Unnamed Product",
  sku: item.sku ?? "N/A",
  category: item.purity ?? "Jewellery",
  quantity: 1,
  actualWeight: item.actualWeight ?? 0,
  stoneWeight: item.stoneWeight ?? 0,
  rfid: item.rfid ?? "",
  isReturned: item.isReturned ?? false,
  unitPrice: (item.goldPrice ?? 0) + (item.makingCharge ?? 0),
  taxRate: item.gstRate ?? 0,
  lineSubtotal: (item.goldPrice ?? 0) + (item.makingCharge ?? 0),
  lineTax: item.gstAmount ?? 0,
  lineTotal: item.totalAmount ?? 0,
});

const normalizeOrder = (invoice: InvoiceListApiItem): OrderListItem => ({
  id: invoice.id,
  orderNumber: invoice.invoiceNumber ?? invoice.id,
  storeId: invoice.storeId ?? invoice.store?.id ?? "",
  storeName: invoice.store?.name ?? "Store",
  customer: {
    name: invoice.customer?.name ?? "Walk-in Customer",
    phone: invoice.customer?.phone ?? "Not provided",
    email: invoice.customer?.email ?? undefined,
  },
  items: [],
  itemCount: invoice._count?.items ?? 0,
  subtotal: invoice.subtotal ?? 0,
  tax: invoice.gstAmount ?? 0,
  total: invoice.totalAmount ?? 0,
  status: normalizeOrderStatus(invoice.status),
  paymentMethod:
    invoice.paymentMethod === "MIXED" ||
    invoice.paymentMethod === "CARD" ||
    invoice.paymentMethod === "UPI" ||
    invoice.paymentMethod === "CASH"
      ? invoice.paymentMethod
      : "CASH",
  createdAt: invoice.createdAt ?? new Date().toISOString(),
});

const normalizeOrderDetail = (
  invoice: NonNullable<InvoiceDetailApiResponse["data"]>,
): OrderListItem => ({
  ...normalizeOrder(invoice),
  customer: {
    name: invoice.customer?.name ?? "Walk-in Customer",
    phone: invoice.customer?.phone ?? "Not provided",
    email: invoice.customer?.email ?? undefined,
    address: invoice.customer?.address ?? undefined,
  },
  items: (invoice.items ?? []).map(normalizeLineItem),
  itemCount: invoice.items?.length ?? invoice._count?.items ?? 0,
});

const buildInvoicesQuery = (params?: OrderSearchParams) => {
  const query = new URLSearchParams();
  const user = getUser();
  const role = normalizeRole(user?.role);
  const effectiveStoreId =
    role === UserRole.SUPER_ADMIN ? params?.storeId : user?.storeId ?? params?.storeId;

  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 10));

  if (effectiveStoreId) {
    query.set("storeId", effectiveStoreId);
  }

  if (params?.status) {
    const backendStatus =
      params.status === "pending"
        ? "DRAFT"
        : params.status === "cancelled"
          ? "CANCELLED"
          : "COMPLETED";
    query.set("status", backendStatus);
  }

  return query.toString();
};

const sortOrders = (
  rows: OrderListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (sortBy === "total") {
      return (a.total - b.total) * multiplier;
    }

    if (sortBy === "storeName") {
      return a.storeName.localeCompare(b.storeName) * multiplier;
    }

    return a.createdAt.localeCompare(b.createdAt) * multiplier;
  });
};

const filterOrders = (rows: OrderListItem[], params?: OrderSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  return rows.filter((order) => {
    if (!search) return true;

    return (
      order.orderNumber.toLowerCase().includes(search) ||
      order.storeName.toLowerCase().includes(search) ||
      order.customer.name.toLowerCase().includes(search) ||
      order.customer.phone.toLowerCase().includes(search)
    );
  });
};

export const orderService = {
  getAll: async (params?: OrderSearchParams) => {
    const query = buildInvoicesQuery(params);
    const res = (await getService(
      `${endpoints.billing.invoices}?${query}`,
    )) as InvoiceListResponse;

    const rows = sortOrders(
      filterOrders((res.data ?? []).map(normalizeOrder), params),
      params?.sortBy,
      params?.sortOrder,
    );

    return {
      success: res.success,
      data: rows,
      total: res.pagination?.total ?? rows.length,
      page: res.pagination?.page ?? params?.page ?? 1,
      limit: res.pagination?.limit ?? params?.limit ?? 10,
      message: res.message,
    } satisfies PaginatedResponse<OrderListItem>;
  },

  search: async (params: OrderSearchParams) => {
    const query = buildInvoicesQuery({
      ...params,
      page: 1,
      limit: 100,
    });
    const res = (await getService(
      `${endpoints.billing.invoices}?${query}`,
    )) as InvoiceListResponse;

    const filtered = sortOrders(
      filterOrders((res.data ?? []).map(normalizeOrder), params),
      params.sortBy,
      params.sortOrder,
    );
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const startIndex = (page - 1) * limit;

    return {
      success: res.success,
      data: filtered.slice(startIndex, startIndex + limit),
      total: filtered.length,
      page,
      limit,
      message: res.message,
    } satisfies PaginatedResponse<OrderListItem>;
  },

  getById: async (id: string) => {
    const res = (await getService(endpoints.billing.invoiceById(id))) as InvoiceDetailApiResponse;

    if (!res.data) {
      throw new Error("Order details not found.");
    }

    return {
      ...res,
      data: normalizeOrderDetail(res.data),
    };
  },

  cancel: async (id: string) => {
    const res = (await patchService(endpoints.billing.cancelInvoice(id), {})) as InvoiceDetailApiResponse;

    if (!res.data) {
      return res;
    }

    return {
      ...res,
      data: normalizeOrderDetail(res.data),
    };
  },
};
