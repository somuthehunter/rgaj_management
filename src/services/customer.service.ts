import { getService, postService } from "./service";
import endpoints from "@/constants/query_const";
import { PaginatedResponse } from "@/types";
import {
  CreateCustomerPayload,
  CustomerListItem,
  CustomerSearchParams,
} from "@/types/customer";
import { OrderListItem } from "@/types/order";
import { orderService } from "./order.service";

type CustomerApiItem = {
  id: string;
  name?: string;
  phone?: string;
  email?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type CustomerDetailResponse = {
  success: boolean;
  data?: CustomerApiItem & {
    invoices?: Array<{
      id?: string;
      invoiceNumber?: string;
      totalAmount?: number;
      createdAt?: string;
      status?: string;
    }>;
  };
  message?: string;
};

type CustomerListResponse = {
  success: boolean;
  data?: CustomerApiItem[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

const buildCustomerMap = (
  customers: CustomerApiItem[],
  orders: OrderListItem[],
) => {
  const customerMap = new Map<string, CustomerListItem>();

  customers.forEach((customer) => {
    customerMap.set(customer.id, {
      id: customer.id,
      name: customer.name ?? "Walk-in Customer",
      phone: customer.phone ?? "Not provided",
      email: customer.email ?? undefined,
      address: customer.address ?? undefined,
      totalPurchase: 0,
      itemsPurchased: 0,
      ordersCount: 0,
      primaryStoreName: "",
      storeNames: [],
      lastOrderDate: customer.updatedAt ?? customer.createdAt ?? new Date().toISOString(),
      orders: [],
    });
  });

  orders.forEach((order) => {
    const match = customers.find(
      (customer) =>
        Boolean(customer.phone && customer.phone === order.customer.phone),
    );

    const key = match?.id ?? order.customer.phone;
    const current = customerMap.get(key) ?? {
      id: key,
      name: order.customer.name,
      phone: order.customer.phone,
      email: order.customer.email,
      address: order.customer.address,
      totalPurchase: 0,
      itemsPurchased: 0,
      ordersCount: 0,
      primaryStoreName: order.storeName,
      storeNames: [],
      lastOrderDate: order.createdAt,
      orders: [],
    };

    current.totalPurchase += order.total;
    current.itemsPurchased += order.itemCount ?? 0;
    current.ordersCount += 1;
    current.orders = [...current.orders, order].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

    if (!current.storeNames.includes(order.storeName)) {
      current.storeNames = [...current.storeNames, order.storeName].sort((a, b) =>
        a.localeCompare(b),
      );
    }

    if (order.createdAt >= current.lastOrderDate) {
      current.lastOrderDate = order.createdAt;
      current.primaryStoreName = order.storeName;
      current.email = order.customer.email || current.email;
      current.address = order.customer.address || current.address;
    }

    customerMap.set(key, current);
  });

  return Array.from(customerMap.values()).sort((a, b) =>
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

const filterCustomers = (rows: CustomerListItem[], params?: CustomerSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  return rows.filter((customer) => {
    const matchesSearch = !search
      ? true
      : customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        (customer.email ?? "").toLowerCase().includes(search) ||
        customer.orders.some((order) => order.orderNumber.toLowerCase().includes(search));

    const matchesStore = params?.storeName
      ? customer.storeNames.includes(params.storeName)
      : true;

    return matchesSearch && matchesStore;
  });
};

const paginateRows = (
  rows: CustomerListItem[],
  page = 1,
  limit = 10,
): PaginatedResponse<CustomerListItem> => {
  const total = rows.length;
  const startIndex = (page - 1) * limit;

  return {
    success: true,
    data: rows.slice(startIndex, startIndex + limit),
    total,
    page,
    limit,
  };
};

const loadCustomersWithOrders = async (params?: CustomerSearchParams) => {
  const searchQuery = new URLSearchParams({
    page: "1",
    limit: "100",
  });

  if (params?.search) {
    searchQuery.set("search", params.search);
  }

  const [customersRes, ordersRes] = await Promise.all([
    getService(`${endpoints.billing.customers}?${searchQuery.toString()}`) as Promise<CustomerListResponse>,
    orderService.search({
      search: params?.search,
      page: 1,
      limit: 100,
    }),
  ]);

  const merged = buildCustomerMap(customersRes.data ?? [], ordersRes.data ?? []);
  return merged;
};

export const customerService = {
  create: async (payload: CreateCustomerPayload) => {
    const res = (await postService(endpoints.billing.customers, payload)) as {
      success: boolean;
      data?: CustomerApiItem;
      message?: string;
    };

    if (!res.data) {
      throw new Error("Customer was not returned by the server.");
    }

    return {
      ...res,
      data: res.data,
    };
  },

  getAll: async (params?: CustomerSearchParams) => {
    const merged = await loadCustomersWithOrders(params);
    const filtered = sortCustomers(filterCustomers(merged, params), params?.sortBy, params?.sortOrder);
    return paginateRows(filtered, params?.page ?? 1, params?.limit ?? 10);
  },

  search: async (params: CustomerSearchParams) => {
    const merged = await loadCustomersWithOrders(params);
    const filtered = sortCustomers(filterCustomers(merged, params), params.sortBy, params.sortOrder);
    return paginateRows(filtered, params.page ?? 1, params.limit ?? 10);
  },

  getById: async (id: string) => {
    const [customerRes, ordersRes] = await Promise.all([
      getService(endpoints.billing.customerById(id)) as Promise<CustomerDetailResponse>,
      orderService.search({
        page: 1,
        limit: 100,
      }),
    ]);

    if (!customerRes.data) {
      throw new Error("Customer details not found.");
    }

    const customerOrders = ordersRes.data.filter(
      (order) =>
        order.customer.phone === (customerRes.data?.phone ?? "") ||
        order.customer.name === (customerRes.data?.name ?? ""),
    );

    const [mergedCustomer] = buildCustomerMap([customerRes.data], customerOrders).filter(
      (customer) =>
        customer.phone === (customerRes.data?.phone ?? "") ||
        customer.name === (customerRes.data?.name ?? ""),
    );

    if (!mergedCustomer) {
      return {
        ...customerRes,
        data: {
          id: customerRes.data.id,
          name: customerRes.data.name ?? "Walk-in Customer",
          phone: customerRes.data.phone ?? "Not provided",
          email: customerRes.data.email ?? undefined,
          address: customerRes.data.address ?? undefined,
          totalPurchase: 0,
          itemsPurchased: 0,
          ordersCount: 0,
          primaryStoreName: "",
          storeNames: [],
          lastOrderDate:
            customerRes.data.updatedAt ??
            customerRes.data.createdAt ??
            new Date().toISOString(),
          orders: [],
        },
      };
    }

    return {
      ...customerRes,
      data: mergedCustomer,
    };
  },
};
