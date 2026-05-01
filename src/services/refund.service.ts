import { getService, patchService, postService } from "./service";
import endpoints from "@/constants/query_const";
import { PaginatedResponse } from "@/types";
import {
  CreateRefundPayload,
  RefundDetail,
  RefundListItem,
  RefundSearchParams,
  RefundStatus,
} from "@/types/refund";

type RefundApiItem = {
  id: string;
  refundNumber?: string;
  invoiceId?: string;
  rfid?: string;
  returnedWeight?: number;
  actualWeight?: number;
  weightDeviation?: number;
  refundAmount?: number;
  status?: RefundStatus;
  reason?: string | null;
  approvalNotes?: string | null;
  createdBy?: string;
  approvedBy?: string | null;
  createdAt?: string;
  approvedAt?: string | null;
  updatedAt?: string;
  invoice?: {
    id?: string;
    invoiceNumber?: string;
    storeId?: string;
    store?: {
      id?: string;
      name?: string;
      code?: string;
    };
    items?: Array<{
      id?: string;
      productName?: string;
      sku?: string;
      rfid?: string;
      actualWeight?: number;
      stoneWeight?: number;
      isReturned?: boolean;
    }>;
  };
  isAutoApproved?: boolean;
  weightTolerance?: number;
};

type RefundListResponse = {
  success: boolean;
  data?: RefundApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

type RefundSingleResponse = {
  success: boolean;
  data?: RefundApiItem;
  message?: string;
};

const normalizeRefund = (item: RefundApiItem): RefundListItem => ({
  id: item.id,
  refundNumber: item.refundNumber ?? item.id,
  invoiceId: item.invoiceId ?? item.invoice?.id ?? "",
  invoiceNumber: item.invoice?.invoiceNumber ?? "N/A",
  storeId: item.invoice?.storeId ?? item.invoice?.store?.id ?? "",
  storeName: item.invoice?.store?.name ?? "Store",
  storeCode: item.invoice?.store?.code ?? "N/A",
  rfid: item.rfid ?? "N/A",
  returnedWeight: item.returnedWeight ?? 0,
  actualWeight: item.actualWeight ?? 0,
  weightDeviation: item.weightDeviation ?? 0,
  refundAmount: item.refundAmount ?? 0,
  status: item.status ?? "PENDING",
  reason: item.reason ?? null,
  approvalNotes: item.approvalNotes ?? null,
  createdBy: item.createdBy ?? "System",
  approvedBy: item.approvedBy ?? null,
  createdAt: item.createdAt ?? new Date().toISOString(),
  approvedAt: item.approvedAt ?? null,
  updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
});

const normalizeRefundDetail = (item: RefundApiItem): RefundDetail => ({
  ...normalizeRefund(item),
  isAutoApproved: item.isAutoApproved,
  weightTolerance: item.weightTolerance,
  invoiceItems: (item.invoice?.items ?? []).map((invoiceItem) => ({
    id: invoiceItem.id ?? "",
    productName: invoiceItem.productName ?? "Unnamed Product",
    sku: invoiceItem.sku ?? "N/A",
    rfid: invoiceItem.rfid ?? "N/A",
    actualWeight: invoiceItem.actualWeight ?? 0,
    stoneWeight: invoiceItem.stoneWeight ?? 0,
    isReturned: invoiceItem.isReturned ?? false,
  })),
});

const buildRefundsQuery = (params?: RefundSearchParams) => {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 10));

  if (params?.status) {
    query.set("status", params.status);
  }

  if (params?.invoiceId) {
    query.set("invoiceId", params.invoiceId);
  }

  if (params?.fromDate) {
    query.set("fromDate", params.fromDate);
  }

  if (params?.toDate) {
    query.set("toDate", params.toDate);
  }

  return query.toString();
};

const sortRefunds = (
  rows: RefundListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sortBy === "refundAmount") {
      return (a.refundAmount - b.refundAmount) * multiplier;
    }
    if (sortBy === "status") {
      return a.status.localeCompare(b.status) * multiplier;
    }
    return a.createdAt.localeCompare(b.createdAt) * multiplier;
  });
};

const filterRefunds = (rows: RefundListItem[], params?: RefundSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";
  if (!search) return rows;

  return rows.filter((item) =>
    item.refundNumber.toLowerCase().includes(search) ||
    item.rfid.toLowerCase().includes(search) ||
    item.invoiceNumber.toLowerCase().includes(search) ||
    item.storeName.toLowerCase().includes(search),
  );
};

export const refundService = {
  getAll: async (params?: RefundSearchParams): Promise<PaginatedResponse<RefundListItem>> => {
    const res = (await getService(
      `${endpoints.refunds.getAll}?${buildRefundsQuery(params)}`,
    )) as RefundListResponse;
    const rows = sortRefunds(filterRefunds((res.data ?? []).map(normalizeRefund), params), params?.sortBy, params?.sortOrder);

    return {
      success: res.success,
      data: rows,
      total: res.pagination?.total ?? rows.length,
      page: res.pagination?.page ?? params?.page ?? 1,
      limit: res.pagination?.limit ?? params?.limit ?? 10,
      message: res.message,
    };
  },

  search: async (params: RefundSearchParams): Promise<PaginatedResponse<RefundListItem>> => {
    const res = (await getService(
      `${endpoints.refunds.getAll}?${buildRefundsQuery({ ...params, page: 1, limit: 100 })}`,
    )) as RefundListResponse;
    const filtered = sortRefunds(filterRefunds((res.data ?? []).map(normalizeRefund), params), params.sortBy, params.sortOrder);
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
    };
  },

  getById: async (id: string) => {
    const res = (await getService(endpoints.refunds.getById(id))) as RefundSingleResponse;
    if (!res.data) {
      throw new Error("Refund details not found.");
    }
    return {
      ...res,
      data: normalizeRefundDetail(res.data),
    };
  },

  create: async (payload: CreateRefundPayload) => {
    const res = (await postService(endpoints.refunds.create, payload)) as RefundSingleResponse;
    if (!res.data) {
      throw new Error("Refund was not returned by the server.");
    }
    return {
      ...res,
      data: normalizeRefundDetail(res.data),
    };
  },

  approve: async (id: string, notes?: string) => {
    const res = (await patchService(endpoints.refunds.approve(id), notes ? { notes } : {})) as RefundSingleResponse;
    return {
      ...res,
      data: res.data ? normalizeRefundDetail(res.data) : undefined,
    };
  },

  reject: async (id: string, notes?: string) => {
    const res = (await patchService(endpoints.refunds.reject(id), notes ? { notes } : {})) as RefundSingleResponse;
    return {
      ...res,
      data: res.data ? normalizeRefundDetail(res.data) : undefined,
    };
  },
};
