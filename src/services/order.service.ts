import { OrderStatus, PaginatedResponse } from "@/types";
import { OrderListItem, OrderSearchParams } from "@/types/order";

let mockOrders: OrderListItem[] = [
  {
    id: "order-1",
    orderNumber: "RGAJ-1001",
    storeId: "store-1",
    storeName: "Main Showroom",
    customer: {
      name: "Arpita Sen",
      phone: "+91 9876543210",
      email: "arpita.sen@example.com",
      address: "12 Park Street, Kolkata",
    },
    items: [
      {
        id: "order-1-item-1",
        productId: "prod-1",
        productName: "Diamond Earrings 28K",
        sku: "EARR-28K-71534",
        category: "Diamond Collection",
        quantity: 1,
        unitPrice: 18500,
        taxRate: 3,
        lineSubtotal: 18500,
        lineTax: 555,
        lineTotal: 19055,
      },
      {
        id: "order-1-item-2",
        productId: "prod-2",
        productName: "Silver Anklet Premium",
        sku: "SIL-ANK-004",
        category: "Silver Jewellery",
        quantity: 1,
        unitPrice: 4200,
        taxRate: 3,
        lineSubtotal: 4200,
        lineTax: 126,
        lineTotal: 4326,
      },
    ],
    subtotal: 22700,
    tax: 681,
    total: 23381,
    status: OrderStatus.COMPLETED,
    paymentMethod: "UPI",
    createdAt: "2026-03-19T11:10:00.000Z",
    notes: "Gift packaging requested.",
  },
  {
    id: "order-2",
    orderNumber: "RGAJ-1002",
    storeId: "store-2",
    storeName: "City Branch",
    customer: {
      name: "Rohit Dutta",
      phone: "+91 9811122233",
      email: "rohit.dutta@example.com",
      address: "45 Benachity, Durgapur",
    },
    items: [
      {
        id: "order-2-item-1",
        productId: "prod-3",
        productName: "Gold Necklace 22K Traditional",
        sku: "NECK-22K-001",
        category: "Gold Jewellery",
        quantity: 1,
        unitPrice: 38500,
        taxRate: 3,
        lineSubtotal: 38500,
        lineTax: 1155,
        lineTotal: 39655,
      },
    ],
    subtotal: 38500,
    tax: 1155,
    total: 39655,
    status: OrderStatus.PENDING,
    paymentMethod: "CARD",
    createdAt: "2026-03-20T15:45:00.000Z",
    notes: "Waiting for final payment confirmation.",
  },
  {
    id: "order-3",
    orderNumber: "RGAJ-1003",
    storeId: "store-3",
    storeName: "Mall Branch",
    customer: {
      name: "Sneha Paul",
      phone: "+91 9900011122",
      email: "sneha.paul@example.com",
      address: "City Centre Mall Road, Siliguri",
    },
    items: [
      {
        id: "order-3-item-1",
        productId: "prod-4",
        productName: "Wedding Choker Set",
        sku: "WED-CHK-008",
        category: "Wedding Specials",
        quantity: 1,
        unitPrice: 54200,
        taxRate: 3,
        lineSubtotal: 54200,
        lineTax: 1626,
        lineTotal: 55826,
      },
      {
        id: "order-3-item-2",
        productId: "prod-5",
        productName: "Kids Bracelet",
        sku: "KID-BRC-002",
        category: "Kids Collection",
        quantity: 2,
        unitPrice: 3200,
        taxRate: 3,
        lineSubtotal: 6400,
        lineTax: 192,
        lineTotal: 6592,
      },
    ],
    subtotal: 60600,
    tax: 1818,
    total: 62418,
    status: OrderStatus.COMPLETED,
    paymentMethod: "BANK_TRANSFER",
    createdAt: "2026-03-18T13:30:00.000Z",
  },
  {
    id: "order-4",
    orderNumber: "RGAJ-1004",
    storeId: "store-1",
    storeName: "Main Showroom",
    customer: {
      name: "Vikram Shah",
      phone: "+91 9830011223",
      email: "vikram.shah@example.com",
      address: "Salt Lake Sector V, Kolkata",
    },
    items: [
      {
        id: "order-4-item-1",
        productId: "prod-6",
        productName: "Gold Bangles 22K Pair",
        sku: "BANG-22K-001",
        category: "Gold Jewellery",
        quantity: 1,
        unitPrice: 47200,
        taxRate: 3,
        lineSubtotal: 47200,
        lineTax: 1416,
        lineTotal: 48616,
      },
    ],
    subtotal: 47200,
    tax: 1416,
    total: 48616,
    status: OrderStatus.CANCELLED,
    paymentMethod: "CASH",
    createdAt: "2026-03-17T10:05:00.000Z",
    notes: "Order cancelled by customer before dispatch.",
  },
  {
    id: "order-5",
    orderNumber: "RGAJ-1005",
    storeId: "store-2",
    storeName: "City Branch",
    customer: {
      name: "Mousumi Ghosh",
      phone: "+91 9870001234",
      email: "mousumi.ghosh@example.com",
      address: "Muchipara, Durgapur",
    },
    items: [
      {
        id: "order-5-item-1",
        productId: "prod-7",
        productName: "Temple Design Pendant",
        sku: "TEMP-PEND-014",
        category: "Temple Design",
        quantity: 1,
        unitPrice: 16800,
        taxRate: 3,
        lineSubtotal: 16800,
        lineTax: 504,
        lineTotal: 17304,
      },
      {
        id: "order-5-item-2",
        productId: "prod-8",
        productName: "Diamond Nose Pin",
        sku: "DIA-NOSE-301",
        category: "Diamond Collection",
        quantity: 1,
        unitPrice: 9500,
        taxRate: 3,
        lineSubtotal: 9500,
        lineTax: 285,
        lineTotal: 9785,
      },
      {
        id: "order-5-item-3",
        productId: "prod-9",
        productName: "Silver Toe Ring Pair",
        sku: "SIL-TOE-019",
        category: "Silver Jewellery",
        quantity: 2,
        unitPrice: 1200,
        taxRate: 3,
        lineSubtotal: 2400,
        lineTax: 72,
        lineTotal: 2472,
      },
    ],
    subtotal: 28700,
    tax: 861,
    total: 29561,
    status: OrderStatus.COMPLETED,
    paymentMethod: "CARD",
    createdAt: "2026-03-21T17:15:00.000Z",
  },
];

const delay = async () =>
  new Promise((resolve) => window.setTimeout(resolve, 120));

const sortOrders = (
  orders: OrderListItem[],
  sortBy?: string,
  sortOrder?: "asc" | "desc" | "",
) => {
  if (!sortBy || !sortOrder) {
    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;

  return [...orders].sort((a, b) => {
    if (sortBy === "total") {
      return (a.total - b.total) * multiplier;
    }

    if (sortBy === "storeName") {
      return a.storeName.localeCompare(b.storeName) * multiplier;
    }

    if (sortBy === "status") {
      return a.status.localeCompare(b.status) * multiplier;
    }

    return a.createdAt.localeCompare(b.createdAt) * multiplier;
  });
};

const buildPaginatedResponse = (
  rows: OrderListItem[],
  page = 1,
  limit = 10,
): PaginatedResponse<OrderListItem> => {
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

const filterOrders = (params?: OrderSearchParams) => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  const filtered = mockOrders.filter((order) => {
    const matchesSearch = !search
      ? true
      : order.orderNumber.toLowerCase().includes(search) ||
        order.storeName.toLowerCase().includes(search) ||
        order.customer.name.toLowerCase().includes(search) ||
        order.customer.phone.toLowerCase().includes(search);

    const matchesStore = params?.storeId ? order.storeId === params.storeId : true;
    const matchesStatus = params?.status
      ? order.status.toLowerCase() === params.status
      : true;

    return matchesSearch && matchesStore && matchesStatus;
  });

  return sortOrders(filtered, params?.sortBy, params?.sortOrder);
};

export const orderService = {
  // Replace this mock implementation with real order API calls when billing/order endpoints are ready.
  getAll: async (params?: OrderSearchParams) => {
    await delay();
    const rows = filterOrders(params);
    return buildPaginatedResponse(rows, params?.page, params?.limit);
  },

  search: async (params: OrderSearchParams) => {
    await delay();
    const rows = filterOrders(params);
    return buildPaginatedResponse(rows, params.page, params.limit);
  },
};

export const getMockOrdersSnapshot = () =>
  mockOrders.map((order) => ({
    ...order,
    customer: { ...order.customer },
    items: order.items.map((item) => ({ ...item })),
  }));

export const addMockOrder = (order: OrderListItem) => {
  mockOrders = [order, ...mockOrders];
  return order;
};
