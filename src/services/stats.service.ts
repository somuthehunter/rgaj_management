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
};

type InvoiceListResponse = {
  success: boolean;
  data?: InvoiceListApiItem[];
  pagination?: {
    total?: number;
  };
};

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
    limit: "100",
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

const fetchInvoices = async (params?: Record<string, string>) => {
  const query = buildInvoicesQuery(params);
  return (await getService(
    `${endpoints.billing.invoices}?${query}`,
  )) as InvoiceListResponse;
};

const summarizeInvoices = (invoices: InvoiceListApiItem[]) => ({
  totalInvoices: invoices.length,
  totalSales: invoices.reduce((sum, invoice) => sum + (invoice.totalAmount ?? 0), 0),
});

export const statsService = {
  getDashboardStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const scopedStoreId = getScopedStoreId();
    const user = getUser();
    const role = getCurrentRole();
    const isCashier = role === UserRole.CASHIER;

    const [salesCurrentRes, salesPreviousRes, storesRes, productsRes] = await Promise.all([
      isCashier
        ? fetchInvoices({
            storeId: scopedStoreId,
            cashierId: user?.id ?? "",
            ...getPeriodRange(30, 0),
          })
        : auditService.getSalesReport({
            storeId: scopedStoreId,
            ...getPeriodRange(30, 0),
          }),
      isCashier
        ? fetchInvoices({
            storeId: scopedStoreId,
            cashierId: user?.id ?? "",
            ...getPeriodRange(30, 30),
          })
        : auditService.getSalesReport({
            storeId: scopedStoreId,
            ...getPeriodRange(30, 30),
          }),
      role === UserRole.SUPER_ADMIN
        ? storeService.getAll({ page: 1, limit: 10 })
        : Promise.resolve({ total: scopedStoreId ? 1 : 0 }),
      productService.getAll({ page: 1, limit: 10, isActive: true }),
    ]);

    const currentSummary = isCashier
      ? summarizeInvoices(salesCurrentRes.data ?? [])
      : salesCurrentRes.data.summary;
    const previousSummary = isCashier
      ? summarizeInvoices(salesPreviousRes.data ?? [])
      : salesPreviousRes.data.summary;

    return {
      success: true,
      data: {
        totalStores: storesRes.total ?? 0,
        totalProducts: productsRes.total ?? 0,
        totalOrders: currentSummary.totalInvoices,
        totalRevenue: currentSummary.totalSales,
        revenueChange: getChangePercent(
          currentSummary.totalSales,
          previousSummary.totalSales,
        ),
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
    const invoicesRes = await fetchInvoices({
      ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
      ...(role === UserRole.CASHIER ? { cashierId: user?.id ?? "" } : {}),
    });
    const buckets = getMonthBuckets(6);
    const totals = new Map<string, number>(buckets.map((bucket) => [bucket.key, 0]));

    (invoicesRes.data ?? []).forEach((invoice) => {
      if (!invoice.createdAt) return;
      const createdAt = new Date(invoice.createdAt);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (!totals.has(key)) return;
      totals.set(key, (totals.get(key) ?? 0) + (invoice.totalAmount ?? 0));
    });

    return {
      success: true,
      data: buckets.map((bucket) => ({
        name: bucket.label,
        value: Number((totals.get(bucket.key) ?? 0).toFixed(2)),
      })),
    };
  },

  getOrdersChart: async (): Promise<{ success: boolean; data: ChartDataPoint[] }> => {
    const scopedStoreId = getScopedStoreId();
    const user = getUser();
    const role = getCurrentRole();
    const invoicesRes = await fetchInvoices({
      ...(scopedStoreId ? { storeId: scopedStoreId } : {}),
      ...(role === UserRole.CASHIER ? { cashierId: user?.id ?? "" } : {}),
    });
    const buckets = getMonthBuckets(6);
    const counts = new Map<string, number>(buckets.map((bucket) => [bucket.key, 0]));

    (invoicesRes.data ?? []).forEach((invoice) => {
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
      const invoicesRes = await fetchInvoices({
        storeId: scopedStoreId,
        cashierId: user?.id ?? "",
      });
      const total = (invoicesRes.data ?? []).reduce(
        (sum, invoice) => sum + (invoice.totalAmount ?? 0),
        0,
      );

      return {
        success: true,
        data: [
          {
            name: "My Sales",
            value: total,
          },
        ],
      };
    }

    const salesRes = await auditService.getSalesReport({
      storeId: scopedStoreId,
      ...getPeriodRange(30, 0),
    });

    return {
      success: true,
      data: salesRes.data.byStore.map((item) => ({
        name: item.storeName,
        value: item.totalSales,
      })),
    };
  },
};
