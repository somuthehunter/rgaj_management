import { DashboardStats, ChartDataPoint } from "@/types";

export const statsService = {
  getDashboardStats: async () => {
    return {
      data: {
        totalStores: 3,
        totalProducts: 105,
        totalOrders: 247,
        totalRevenue: 48520.5,
        revenueChange: 12.5,
        ordersChange: 8.3,
      },
      success: true,
    };
  },

  getRevenueChart: async () => {
    return {
      data: [
        { name: "Sep", value: 4200 },
        { name: "Oct", value: 5100 },
      ],
      success: true,
    };
  },

  getOrdersChart: async () => {
    return {
      data: [
        { name: "Sep", value: 32, value2: 28 },
        { name: "Oct", value: 41, value2: 35 },
        { name: "Nov", value: 37, value2: 30 },
        { name: "Dec", value: 55, value2: 48 },
        { name: "Jan", value: 48, value2: 40 },
        { name: "Feb", value: 62, value2: 55 },
      ],
      success: true,
    };
  },

  getStorePerformance: async () => {
    return {
      data: [
        { name: "Downtown Store", value: 18200 },
        { name: "Mall Outlet", value: 15800 },
        { name: "Airport Branch", value: 14520 },
      ],
      success: true,
    };
  },
};