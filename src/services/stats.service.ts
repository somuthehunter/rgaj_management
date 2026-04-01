import { ChartDataPoint, DashboardStats, UserRole } from "@/types";
import { getService } from "./service";
import endpoints from "@/constants/query_const";
import { getUser } from "./session.service";
import { normalizeRole } from "@/lib/auth";
import { auditService } from "./audit.service";
import { productService } from "./product.service";
import { storeService } from "./store.service";

type InvoiceListApiItem = {
  id: string;
  totalAmount?: number;
  createdAt?: string;
  status?: string;
  store?: {
    id?: string;
    name?: string;
  } | null;
  storeId?: string;
};

type InvoiceListResponse = {
  success: boolean;
  data?: InvoiceListApiItem[];
  pagination?: {
    total?: number;
  };
};

type RefundListApiItem = {
  id: string;
  refundAmount?: number;
  status?: string;
  approvedAt?: string | null;
  updatedAt?: string;
  createdAt?: string;
  storeId?: string;
  invoice?: {
    storeId?: string;
    store?: {
      id?: string;
      name?: string;
    };
  };
};

type RefundListResponse = {
  success: boolean;
  data?: RefundListApiItem[];
  pagination?: {
    total?: number;
  };
};

const PAGE_LIMIT = 100;

const formatMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);

const getMonthBuckets = (count: number) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - index - 1), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatMonthLabel(date),
    };
  });
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const getPeriodRange = (days: number, offsetDays = 0) => {
  const end = new Date();
  end.setDate(end.getDate() - offsetDays);
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  return {
    fromDate: toIsoDate(start),
    toDate: toIsoDate(end),
  };
};

const getChangePercent = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const buildInvoicesQuery = (params?: Record<string, string>) => {
  const query = new URLSearchParams({
    page: "1",
    limit: String(PAGE_LIMIT),
  });

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query.toString();
};

const buildRefundsQuery = (params?: Record<string, string>) => {
  const query = new URLSearchParams({
    page: "1",
    limit: String(PAGE_LIMIT),
  });

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query.toString();
};

const getScopedStoreId = () => {
  const user = getUser();
  const role = normalizeRole(user?.role);

  if (role === UserRole.SUPER_ADMIN) {
    return undefined;
  }

  return user?.storeId ?? undefined;
};

const getCurrentRole = () => normalizeRole(getUser()?.role);

const fetchInvoicesPage = async (params?: Record<string, string>) => {
  const query = buildInvoicesQuery(params);
  return (await getService(
    `${endpoints.billing.invoices}?${query}`,
  )) as InvoiceListResponse;
};

const fetchRefundsPage = async (params?: Record<string, string>) => {
  const query = buildRefundsQuery(params);
  return (await getService(
    `${endpoints.refunds.getAll}?${query}`,
  )) as RefundListResponse;
};

const fetchAllInvoices = async (params?: Record<string, string>) => {
  const rows: InvoiceListApiItem[] = [];
  let page = 1;

  while (true) {
    const res = await fetchInvoicesPage({
      ...params,
      page: String(page),
      limit: String(PAGE_LIMIT),
    });
    const batch = res.data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_LIMIT) {
      break;
    }

    page += 1;
  }

  return rows;
};

const fetchAllRefunds = async (params?: Record<string, string>) => {
  const rows: RefundListApiItem[] = [];
  let page = 1;

  while (true) {
    const res = await fetchRefundsPage({
      ...params,
      page: String(page),
      limit: String(PAGE_LIMIT),
    });
    const batch = res.data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_LIMIT) {
      break;
    }

    page += 1;
  }

  return rows;
};

const isRefundCounted = (refund: RefundListApiItem) =>
  refund.status === "APPROVED" || refund.status === "COMPLETED";

const isInvoiceCounted = (invoice: InvoiceListApiItem) => invoice.status !== "CANCELLED";

const getRefundEffectiveDate = (refund: RefundListApiItem) =>
  refund.approvedAt ?? refund.updatedAt ?? refund.createdAt ?? "";

const summarizeInvoices = (invoices: InvoiceListApiItem[]) => {
  const countedInvoices = invoices.filter(isInvoiceCounted);

  return {
    totalInvoices: countedInvoices.length,
    totalSales: countedInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount ?? 0), 0),
  };
};

const summarizeRefunds = (refunds: RefundListApiItem[]) => ({
  totalRefunded: refunds
    .filter(isRefundCounted)
    .reduce((sum, refund) => sum + (refund.refundAmount ?? 0), 0),
});

const groupRefundsByStore = (refunds: RefundListApiItem[]) => {
  const totals = new Map<string, number>();

  refunds.filter(isRefundCounted).forEach((refund) => {
    const storeId = refund.storeId ?? refund.invoice?.storeId ?? refund.invoice?.store?.id ?? "";
    if (!storeId) return;
    totals.set(storeId, (totals.get(storeId) ?? 0) + (refund.refundAmount ?? 0));
  });

  return totals;
};

export const statsService = {
  getDashboardStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const scopedStoreId = getScopedStoreId();
    const user = getUser();
    const role = getCurrentRole();
    const isCashier = role === UserRole.CASHIER;
    const [allInvoices, allRefunds, currentInvoices, previousInvoices, currentRefunds, previousRefunds, storesRes, productsRes] =
      await Promise.all([
        fetchAllInvoices({
          ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
          ...(isCashier ? { cashierId: user?.id ?? "" } : {}),
        }),
        fetchAllRefunds(scopedStoreId ? { storeId: scopedStoreId } : undefined),
        fetchAllInvoices({
          ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
          ...(isCashier ? { cashierId: user?.id ?? "" } : {}),
          ...getPeriodRange(30, 0),
        }),
        fetchAllInvoices({
          ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
          ...(isCashier ? { cashierId: user?.id ?? "" } : {}),
          ...getPeriodRange(30, 30),
        }),
        fetchAllRefunds({
          ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
          ...getPeriodRange(30, 0),
        }),
        fetchAllRefunds({
          ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
          ...getPeriodRange(30, 30),
        }),
        role === UserRole.SUPER_ADMIN
          ? storeService.getAll({ page: 1, limit: 10 })
          : Promise.resolve({ total: scopedStoreId ? 1 : 0 }),
        productService.getAll({ page: 1, limit: 10, isActive: true }),
      ]);

    const allSummary = summarizeInvoices(allInvoices);
    const allRefundSummary = summarizeRefunds(allRefunds);
    const currentSummary = summarizeInvoices(currentInvoices);
    const previousSummary = summarizeInvoices(previousInvoices);
    const currentRefundSummary = summarizeRefunds(currentRefunds);
    const previousRefundSummary = summarizeRefunds(previousRefunds);
    const currentNetRevenue = currentSummary.totalSales - currentRefundSummary.totalRefunded;
    const previousNetRevenue = previousSummary.totalSales - previousRefundSummary.totalRefunded;

    return {
      success: true,
      data: {
        totalStores: storesRes.total ?? 0,
        totalProducts: productsRes.total ?? 0,
        totalOrders: allSummary.totalInvoices,
        totalRevenue: allSummary.totalSales - allRefundSummary.totalRefunded,
        revenueChange: getChangePercent(currentNetRevenue, previousNetRevenue),
        ordersChange: getChangePercent(
          currentSummary.totalInvoices,
          previousSummary.totalInvoices,
        ),
      },
    };
  },

  getRevenueChart: async (): Promise<{ success: boolean; data: ChartDataPoint[] }> => {
    const scopedStoreId = getScopedStoreId();
    const user = getUser();
    const role = getCurrentRole();
    const [invoices, refunds] = await Promise.all([
      fetchAllInvoices({
        ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
        ...(role === UserRole.CASHIER ? { cashierId: user?.id ?? "" } : {}),
      }),
      fetchAllRefunds(scopedStoreId ? { storeId: scopedStoreId } : undefined),
    ]);
    const buckets = getMonthBuckets(6);
    const invoiceTotals = new Map<string, number>(buckets.map((bucket) => [bucket.key, 0]));
    const refundTotals = new Map<string, number>(buckets.map((bucket) => [bucket.key, 0]));

    invoices.filter(isInvoiceCounted).forEach((invoice) => {
      if (!invoice.createdAt) return;
      const createdAt = new Date(invoice.createdAt);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (!invoiceTotals.has(key)) return;
      invoiceTotals.set(key, (invoiceTotals.get(key) ?? 0) + (invoice.totalAmount ?? 0));
    });

    refunds.filter(isRefundCounted).forEach((refund) => {
      const effectiveDate = getRefundEffectiveDate(refund);
      if (!effectiveDate) return;
      const createdAt = new Date(effectiveDate);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (!refundTotals.has(key)) return;
      refundTotals.set(key, (refundTotals.get(key) ?? 0) + (refund.refundAmount ?? 0));
    });

    return {
      success: true,
      data: buckets.map((bucket) => ({
        name: bucket.label,
        value: Number(
          ((invoiceTotals.get(bucket.key) ?? 0) - (refundTotals.get(bucket.key) ?? 0)).toFixed(2),
        ),
      })),
    };
  },

  getOrdersChart: async (): Promise<{ success: boolean; data: ChartDataPoint[] }> => {
    const scopedStoreId = getScopedStoreId();
    const user = getUser();
    const role = getCurrentRole();
    const invoices = await fetchAllInvoices({
      ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
      ...(role === UserRole.CASHIER ? { cashierId: user?.id ?? "" } : {}),
    });
    const buckets = getMonthBuckets(6);
    const counts = new Map<string, number>(buckets.map((bucket) => [bucket.key, 0]));

    invoices.filter(isInvoiceCounted).forEach((invoice) => {
      if (!invoice.createdAt) return;
      const createdAt = new Date(invoice.createdAt);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (!counts.has(key)) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return {
      success: true,
      data: buckets.map((bucket) => ({
        name: bucket.label,
        value: counts.get(bucket.key) ?? 0,
      })),
    };
  },

  getStorePerformance: async (): Promise<{ success: boolean; data: ChartDataPoint[] }> => {
    const scopedStoreId = getScopedStoreId();
    const user = getUser();
    const role = getCurrentRole();

    if (role === UserRole.CASHIER) {
      const [invoices, refunds] = await Promise.all([
        fetchAllInvoices({
          storeId: scopedStoreId,
          cashierId: user?.id ?? "",
        }),
        fetchAllRefunds(scopedStoreId ? { storeId: scopedStoreId } : undefined),
      ]);
      const grossTotal = invoices.filter(isInvoiceCounted).reduce(
        (sum, invoice) => sum + (invoice.totalAmount ?? 0),
        0,
      );
      const refundTotal = summarizeRefunds(refunds).totalRefunded;

      return {
        success: true,
        data: [
          {
            name: "My Net Sales",
            value: grossTotal - refundTotal,
          },
        ],
      };
    }

    const [salesRes, refunds] = await Promise.all([
      auditService.getSalesReport({
        storeId: scopedStoreId,
      }),
      fetchAllRefunds(scopedStoreId ? { storeId: scopedStoreId } : undefined),
    ]);
    const refundsByStore = groupRefundsByStore(refunds);

    return {
      success: true,
      data: salesRes.data.byStore.map((item) => ({
        name: item.storeName,
        value: item.totalSales - (refundsByStore.get(item.storeId) ?? 0),
      })),
    };
  },
};
