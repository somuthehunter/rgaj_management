"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { statsService } from "@/services/stats.service";

export const useDashboardStats = () =>
  useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_STATS],
    queryFn: async () => {
      const res = await statsService.getDashboardStats();
      return res.data;
    },
  });

export const useRevenueChart = () =>
  useQuery({
    queryKey: [QUERY_KEYS.STATISTICS, "revenue"],
    queryFn: async () => {
      const res = await statsService.getRevenueChart();
      return res.data;
    },
  });

export const useStorePerformance = () =>
  useQuery({
    queryKey: [QUERY_KEYS.STATISTICS, "store-performance"],
    queryFn: async () => {
      const res = await statsService.getStorePerformance();
      return res.data;
    },
  });