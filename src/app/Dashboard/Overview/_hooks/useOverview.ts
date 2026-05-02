"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query_keys";
import { QUERY_TIMINGS } from "@/constants/query_options";
import { statsService } from "@/services/stats.service";

export const useDashboardStats = () =>
  useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_STATS],
    staleTime: QUERY_TIMINGS.REPORT_STALE_MS,
    gcTime: QUERY_TIMINGS.REPORT_STALE_MS * 2,
    refetchOnMount: false,
    queryFn: async () => {
      const res = await statsService.getDashboardStats();
      return res.data;
    },
  });

export const useRevenueChart = () =>
  useQuery({
    queryKey: [QUERY_KEYS.STATISTICS, "revenue"],
    staleTime: QUERY_TIMINGS.REPORT_STALE_MS,
    gcTime: QUERY_TIMINGS.REPORT_STALE_MS * 2,
    refetchOnMount: false,
    queryFn: async () => {
      const res = await statsService.getRevenueChart();
      return res.data;
    },
  });

export const useStorePerformance = () =>
  useQuery({
    queryKey: [QUERY_KEYS.STATISTICS, "store-performance"],
    staleTime: QUERY_TIMINGS.REPORT_STALE_MS,
    gcTime: QUERY_TIMINGS.REPORT_STALE_MS * 2,
    refetchOnMount: false,
    queryFn: async () => {
      const res = await statsService.getStorePerformance();
      return res.data;
    },
  });
