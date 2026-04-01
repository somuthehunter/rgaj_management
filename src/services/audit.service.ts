import { getService } from "./service";
import endpoints from "@/constants/query_const";
import { PaginatedResponse } from "@/types";
import {
  InventoryAuditRow,
  SalesPaymentBreakdown,
  SalesReport,
  SalesStoreBreakdown,
  StoreAuditReport,
  TransactionLogItem,
  TransactionSearchParams,
} from "@/types/transaction";

type AuditLogApiItem = {
  id: string;
  action?: string;
  entity?: string;
  entityId?: string;
  changes?: unknown;
  userId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string;
};

type AuditLogListResponse = {
  success: boolean;
  data?: AuditLogApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type SalesReportResponse = {
  success: boolean;
  data?: {
    summary?: {
      totalInvoices?: number;
      totalSales?: number;
      totalGst?: number;
      totalSubtotal?: number;
    };
    byStore?: Array<{
      store?: {
        id?: string;
        name?: string;
        code?: string;
      };
      invoiceCount?: number;
      totalSales?: number;
      totalGst?: number;
    }>;
    byPaymentMethod?: Array<{
      method?: "CASH" | "CARD" | "UPI" | "MIXED";
      count?: number;
      total?: number;
    }>;
  };
  message?: string;
};

type InventoryReportResponse = {
  success: boolean;
  data?: Array<{
    product?: {
      id?: string;
      name?: string;
      sku?: string;
      category?: string;
      purity?: string;
    };
    central?: {
      totalWeight?: number;
      availableWeight?: number;
      reservedWeight?: number;
      netGoldWeight?: number;
    };
    storeAggregated?: {
      allocatedWeight?: number;
      soldWeight?: number;
      availableWeight?: number;
      returnedWeight?: number;
    };
  }>;
  message?: string;
};

type StoreReportResponse = {
  success: boolean;
  data?: {
    store?: {
      id?: string;
      name?: string;
      code?: string;
      city?: string;
      userCount?: number;
    };
    sales?: {
      invoiceCount?: number;
      totalSales?: number;
      totalGst?: number;
    };
    refunds?: {
      refundCount?: number;
      totalRefunded?: number;
    };
    topInventory?: Array<{
      id?: string;
      storeId?: string;
      productId?: string;
      allocatedWeight?: number;
      soldWeight?: number;
      returnedWeight?: number;
      availableWeight?: number;
      product?: {
        name?: string;
        sku?: string;
        category?: string;
      };
    }>;
    recentInvoices?: Array<{
      id?: string;
      invoiceNumber?: string;
      totalAmount?: number;
      status?: string;
      createdAt?: string;
      customer?: {
        name?: string | null;
        phone?: string | null;
      } | null;
    }>;
  };
  message?: string;
};

const normalizeAuditLog = (item: AuditLogApiItem): TransactionLogItem => ({
  id: item.id,
  action: item.action ?? "UNKNOWN",
  entity: item.entity ?? "SYSTEM",
  entityId: item.entityId ?? "",
  userId: item.userId ?? "Unknown User",
  ipAddress: item.ipAddress ?? null,
  userAgent: item.userAgent ?? null,
  changes: item.changes,
  createdAt: item.createdAt ?? new Date().toISOString(),
});

const sortLogs = (
  rows: TransactionLogItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (sortBy === "action") {
      return a.action.localeCompare(b.action) * multiplier;
    }

    if (sortBy === "entity") {
      return a.entity.localeCompare(b.entity) * multiplier;
    }

    if (sortBy === "userId") {
      return a.userId.localeCompare(b.userId) * multiplier;
    }

    return a.createdAt.localeCompare(b.createdAt) * multiplier;
  });
};

const filterLogs = (rows: TransactionLogItem[], params?: TransactionSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  return rows.filter((item) => {
    const matchesSearch = !search
      ? true
      : item.action.toLowerCase().includes(search) ||
        item.entity.toLowerCase().includes(search) ||
        item.entityId.toLowerCase().includes(search) ||
        item.userId.toLowerCase().includes(search) ||
        JSON.stringify(item.changes ?? {}).toLowerCase().includes(search);

    return matchesSearch;
  });
};

const buildLogsQuery = (params?: TransactionSearchParams) => {
  const query = new URLSearchParams();

  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 10));

  if (params?.action) {
    query.set("action", params.action);
  }

  if (params?.entity) {
    query.set("entity", params.entity);
  }

  if (params?.fromDate) {
    query.set("fromDate", params.fromDate);
  }

  if (params?.toDate) {
    query.set("toDate", params.toDate);
  }

  return query.toString();
};

const buildReportDateQuery = (params?: { storeId?: string; fromDate?: string; toDate?: string }) => {
  const query = new URLSearchParams();

  if (params?.storeId) {
    query.set("storeId", params.storeId);
  }

  if (params?.fromDate) {
    query.set("fromDate", params.fromDate);
  }

  if (params?.toDate) {
    query.set("toDate", params.toDate);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export const auditService = {
  getLogs: async (params?: TransactionSearchParams) => {
    const res = (await getService(
      `${endpoints.audit.logs}?${buildLogsQuery(params)}`,
    )) as AuditLogListResponse;

    const rows = sortLogs(
      filterLogs((res.data ?? []).map(normalizeAuditLog), params),
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
    } satisfies PaginatedResponse<TransactionLogItem>;
  },

  searchLogs: async (params: TransactionSearchParams) => {
    const res = (await getService(
      `${endpoints.audit.logs}?${buildLogsQuery({
        ...params,
        page: 1,
        limit: 100,
      })}`,
    )) as AuditLogListResponse;

    const filtered = sortLogs(
      filterLogs((res.data ?? []).map(normalizeAuditLog), params),
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
    } satisfies PaginatedResponse<TransactionLogItem>;
  },

  getSalesReport: async (params?: { storeId?: string; fromDate?: string; toDate?: string }) => {
    const res = (await getService(
      `${endpoints.audit.salesReport}${buildReportDateQuery(params)}`,
    )) as SalesReportResponse;

    const data = res.data;

    return {
      success: res.success,
      data: {
        summary: {
          totalInvoices: data?.summary?.totalInvoices ?? 0,
          totalSales: data?.summary?.totalSales ?? 0,
          totalGst: data?.summary?.totalGst ?? 0,
          totalSubtotal: data?.summary?.totalSubtotal ?? 0,
        },
        byStore: (data?.byStore ?? []).map<SalesStoreBreakdown>((item) => ({
          storeId: item.store?.id ?? "",
          storeName: item.store?.name ?? "Store",
          storeCode: item.store?.code ?? "N/A",
          invoiceCount: item.invoiceCount ?? 0,
          totalSales: item.totalSales ?? 0,
          totalGst: item.totalGst ?? 0,
        })),
        byPaymentMethod: (data?.byPaymentMethod ?? []).map<SalesPaymentBreakdown>((item) => ({
          method: item.method ?? "CASH",
          count: item.count ?? 0,
          total: item.total ?? 0,
        })),
      } satisfies SalesReport,
      message: res.message,
    };
  },

  getInventoryReport: async () => {
    const res = (await getService(endpoints.audit.inventoryReport)) as InventoryReportResponse;

    return {
      success: res.success,
      data: (res.data ?? []).map<InventoryAuditRow>((item) => ({
        productId: item.product?.id ?? "",
        productName: item.product?.name ?? "Unnamed Product",
        sku: item.product?.sku ?? "N/A",
        category: item.product?.category ?? "",
        purity: item.product?.purity ?? "",
        centralTotalWeight: item.central?.totalWeight ?? 0,
        centralAvailableWeight: item.central?.availableWeight ?? 0,
        centralReservedWeight: item.central?.reservedWeight ?? 0,
        centralNetGoldWeight: item.central?.netGoldWeight ?? 0,
        allocatedWeight: item.storeAggregated?.allocatedWeight ?? 0,
        soldWeight: item.storeAggregated?.soldWeight ?? 0,
        availableWeight: item.storeAggregated?.availableWeight ?? 0,
        returnedWeight: item.storeAggregated?.returnedWeight ?? 0,
      })),
      message: res.message,
    };
  },

  getStoreReport: async (storeId: string, params?: { fromDate?: string; toDate?: string }) => {
    const query = buildReportDateQuery(params);
    const res = (await getService(
      `${endpoints.audit.storeReport(storeId)}${query}`,
    )) as StoreReportResponse;

    const data = res.data;

    return {
      success: res.success,
      data: {
        store: {
          id: data?.store?.id ?? storeId,
          name: data?.store?.name ?? "Store",
          code: data?.store?.code ?? "N/A",
          city: data?.store?.city ?? "",
          userCount: data?.store?.userCount ?? 0,
        },
        sales: {
          invoiceCount: data?.sales?.invoiceCount ?? 0,
          totalSales: data?.sales?.totalSales ?? 0,
          totalGst: data?.sales?.totalGst ?? 0,
        },
        refunds: {
          refundCount: data?.refunds?.refundCount ?? 0,
          totalRefunded: data?.refunds?.totalRefunded ?? 0,
        },
        topInventory: (data?.topInventory ?? []).map((item) => ({
          id: item.id ?? "",
          productId: item.productId ?? "",
          productName: item.product?.name ?? "Unnamed Product",
          sku: item.product?.sku ?? "N/A",
          category: item.product?.category ?? "",
          allocatedWeight: item.allocatedWeight ?? 0,
          soldWeight: item.soldWeight ?? 0,
          returnedWeight: item.returnedWeight ?? 0,
          availableWeight: item.availableWeight ?? 0,
        })),
        recentInvoices: (data?.recentInvoices ?? []).map((item) => ({
          id: item.id ?? "",
          invoiceNumber: item.invoiceNumber ?? "N/A",
          totalAmount: item.totalAmount ?? 0,
          status: item.status ?? "UNKNOWN",
          createdAt: item.createdAt ?? new Date().toISOString(),
          customerName: item.customer?.name ?? null,
          customerPhone: item.customer?.phone ?? null,
        })),
      } satisfies StoreAuditReport,
      message: res.message,
    };
  },
};
