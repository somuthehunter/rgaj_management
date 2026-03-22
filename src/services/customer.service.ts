import { PaginatedResponse } from "@/types";
import { getMockOrdersSnapshot } from "@/services/order.service";
import { CustomerListItem, CustomerSearchParams } from "@/types/customer";

const delay = async () =>
  new Promise((resolve) => window.setTimeout(resolve, 120));

const buildCustomers = (): CustomerListItem[] => {
  const orders = getMockOrdersSnapshot();
  const customersMap = new Map<string, CustomerListItem>();

  orders.forEach((order) => {
    const key = order.customer.phone;
    const existing = customersMap.get(key);
    const itemsPurchased = order.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    if (!existing) {
      customersMap.set(key, {
        id: `customer-${key.replace(/\D/g, "")}`,
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
        address: order.customer.address,
        totalPurchase: order.total,
        itemsPurchased,
        ordersCount: 1,
        primaryStoreName: order.storeName,
        storeNames: [order.storeName],
        lastOrderDate: order.createdAt,
        orders: [order],
      });
      return;
    }

    existing.totalPurchase += order.total;
    existing.itemsPurchased += itemsPurchased;
    existing.ordersCount += 1;
    existing.orders = [...existing.orders, order].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

    if (!existing.storeNames.includes(order.storeName)) {
      existing.storeNames = [...existing.storeNames, order.storeName].sort((a, b) =>
        a.localeCompare(b),
      );
    }

    if (order.createdAt > existing.lastOrderDate) {
      existing.lastOrderDate = order.createdAt;
      existing.primaryStoreName = order.storeName;
      existing.email = order.customer.email || existing.email;
      existing.address = order.customer.address || existing.address;
    }
  });

  return Array.from(customersMap.values()).sort((a, b) =>
    b.lastOrderDate.localeCompare(a.lastOrderDate),
  );
};

const sortCustomers = (
  customers: CustomerListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...customers].sort((a, b) =>
      b.lastOrderDate.localeCompare(a.lastOrderDate),
    );
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...customers].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name) * multiplier;
    }

    if (sortBy === "totalPurchase") {
      return (a.totalPurchase - b.totalPurchase) * multiplier;
    }

    if (sortBy === "itemsPurchased") {
      return (a.itemsPurchased - b.itemsPurchased) * multiplier;
    }

    return a.lastOrderDate.localeCompare(b.lastOrderDate) * multiplier;
  });
};

const buildPaginatedResponse = (
  rows: CustomerListItem[],
  page = 1,
  limit = 10,
): PaginatedResponse<CustomerListItem> => {
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

const filterCustomers = (params?: CustomerSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";
  const customers = buildCustomers();

  const filtered = customers.filter((customer) => {
    const matchesSearch = !search
      ? true
      : customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        (customer.email ?? "").toLowerCase().includes(search) ||
        customer.orders.some((order) =>
          order.orderNumber.toLowerCase().includes(search),
        );

    const matchesStore = params?.storeName
      ? customer.storeNames.includes(params.storeName)
      : true;

    return matchesSearch && matchesStore;
  });

  return sortCustomers(filtered, params?.sortBy, params?.sortOrder);
};

export const customerService = {
  // Replace this mock implementation with real customer API calls when the backend is ready.
  getAll: async (params?: CustomerSearchParams) => {
    await delay();
    const rows = filterCustomers(params);
    return buildPaginatedResponse(rows, params?.page, params?.limit);
  },

  search: async (params: CustomerSearchParams) => {
    await delay();
    const rows = filterCustomers(params);
    return buildPaginatedResponse(rows, params.page, params.limit);
  },

  getExportRows: () => filterCustomers(),
};
