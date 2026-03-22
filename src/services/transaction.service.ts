import { PaginatedResponse } from "@/types";
import { TransactionLogItem, TransactionSearchParams } from "@/types/transaction";

let mockTransactions: TransactionLogItem[] = [
  {
    id: "txn-log-1",
    eventType: "DISTRIBUTE",
    module: "Inventory",
    title: "Product distributed to City Branch",
    description:
      "Diamond Earrings 28K was distributed from Main Showroom to City Branch for new stock allocation.",
    performedBy: "Sourav Admin",
    role: "SUPER_ADMIN",
    storeName: "City Branch",
    entityName: "Diamond Earrings 28K",
    referenceId: "dist-1001",
    createdAt: "2026-03-22T09:20:00.000Z",
    metadata: {
      quantityNumber: 4,
      measuredQuantity: 2.5,
      measurementUnit: "carat",
      fromStore: "Main Showroom",
    },
  },
  {
    id: "txn-log-2",
    eventType: "ADD_PRODUCT",
    module: "Products",
    title: "New product added",
    description:
      "Temple Design Pendant was created and published to the catalog with opening stock details.",
    performedBy: "Priya Manager",
    role: "STORE_ADMIN",
    storeName: "Main Showroom",
    entityName: "Temple Design Pendant",
    referenceId: "prod-701",
    createdAt: "2026-03-21T16:45:00.000Z",
    metadata: {
      sku: "TEMP-PEND-014",
      category: "Temple Design",
      quantity: 10,
    },
  },
];

const delay = async () =>
  new Promise((resolve) => window.setTimeout(resolve, 120));

const sortTransactions = (
  rows: TransactionLogItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (sortBy === "eventType") {
      return a.eventType.localeCompare(b.eventType) * multiplier;
    }

    if (sortBy === "performedBy") {
      return a.performedBy.localeCompare(b.performedBy) * multiplier;
    }

    return a.createdAt.localeCompare(b.createdAt) * multiplier;
  });
};

const buildPaginatedResponse = (
  rows: TransactionLogItem[],
  page = 1,
  limit = 10,
): PaginatedResponse<TransactionLogItem> => {
  const total = rows.length;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const startIndex = (safePage - 1) * safeLimit;

  return {
    success: true,
    data: rows.slice(startIndex, startIndex + safeLimit),
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const filterTransactions = (params?: TransactionSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  const filtered = mockTransactions.filter((item) => {
    const matchesSearch = !search
      ? true
      : item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.performedBy.toLowerCase().includes(search) ||
        (item.storeName ?? "").toLowerCase().includes(search) ||
        (item.entityName ?? "").toLowerCase().includes(search) ||
        (item.referenceId ?? "").toLowerCase().includes(search);

    const matchesType = params?.eventType
      ? item.eventType === params.eventType
      : true;

    return matchesSearch && matchesType;
  });

  return sortTransactions(filtered, params?.sortBy, params?.sortOrder);
};

export const transactionService = {
  // Replace this mock implementation with the system activity-log API when it is available.
  getAll: async (params?: TransactionSearchParams) => {
    await delay();
    const rows = filterTransactions(params);
    return buildPaginatedResponse(rows, params?.page, params?.limit);
  },

  search: async (params: TransactionSearchParams) => {
    await delay();
    const rows = filterTransactions(params);
    return buildPaginatedResponse(rows, params.page, params.limit);
  },
};

export const addMockTransaction = (transaction: TransactionLogItem) => {
  mockTransactions = [transaction, ...mockTransactions];
  return transaction;
};
