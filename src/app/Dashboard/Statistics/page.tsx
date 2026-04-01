"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUser } from "@/services/session.service";
import { normalizeRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { auditService } from "@/services/audit.service";
import { refundService } from "@/services/refund.service";
import { storeService } from "@/services/store.service";
import { formatOrderCurrency, formatOrderDate } from "../Orders/_utils/order.utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RefundListItem } from "@/types/refund";

const chartColors = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.65)",
  "hsl(var(--primary) / 0.5)",
];

const REFUND_PAGE_LIMIT = 100;

const getRefundEffectiveDate = (refund: RefundListItem) =>
  refund.approvedAt ?? refund.updatedAt ?? refund.createdAt;

export default function StatisticsPage() {
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const user = getUser();
  const role = normalizeRole(user?.role);
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  const storesQuery = useQuery({
    queryKey: ["statistics-store-options"],
    queryFn: () => storeService.search({ page: 1, limit: 100, isActive: true }),
    enabled: isSuperAdmin,
  });

  useEffect(() => {
    if (!isSuperAdmin) {
      setSelectedStoreId(user?.storeId ?? "");
      return;
    }

    if (!selectedStoreId && storesQuery.data?.data[0]?.id) {
      setSelectedStoreId(storesQuery.data.data[0].id);
    }
  }, [isSuperAdmin, selectedStoreId, storesQuery.data?.data, user?.storeId]);

  const reportFilters = useMemo(
    () => ({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [fromDate, toDate],
  );

  const salesReportQuery = useQuery({
    queryKey: [
      "audit-sales-report",
      isSuperAdmin ? selectedStoreId : user?.storeId,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      auditService.getSalesReport({
        storeId: isSuperAdmin ? selectedStoreId || undefined : undefined,
        ...reportFilters,
      }),
  });

  const inventoryReportQuery = useQuery({
    queryKey: ["audit-inventory-report"],
    queryFn: () => auditService.getInventoryReport(),
    enabled: isSuperAdmin,
  });

  const storeReportQuery = useQuery({
    queryKey: ["audit-store-report", selectedStoreId, fromDate, toDate],
    queryFn: () => auditService.getStoreReport(selectedStoreId, reportFilters),
    enabled: Boolean(selectedStoreId),
  });

  const refundsQuery = useQuery({
    queryKey: ["statistics-refunds", selectedStoreId, fromDate, toDate],
    queryFn: async () => {
      const rows: RefundListItem[] = [];
      let page = 1;

      while (true) {
        const res = await refundService.getAll({
          fromDate,
          toDate,
          page,
          limit: REFUND_PAGE_LIMIT,
        });

        rows.push(...res.data);

        if (res.data.length < REFUND_PAGE_LIMIT) {
          break;
        }

        page += 1;
      }

      return rows;
    },
  });

  const salesData = salesReportQuery.data?.data;
  const inventoryData = inventoryReportQuery.data?.data ?? [];
  const storeReport = storeReportQuery.data?.data;

  const refunds = (refundsQuery.data ?? []).filter((refund) => {
    if (refund.status !== "APPROVED" && refund.status !== "COMPLETED") {
      return false;
    }

    if (selectedStoreId && isSuperAdmin && refund.storeId !== selectedStoreId) {
      return false;
    }

    const effectiveDate = getRefundEffectiveDate(refund);
    if (fromDate && effectiveDate < fromDate) {
      return false;
    }
    if (toDate && effectiveDate > toDate) {
      return false;
    }

    return true;
  });

  const refundTotal = refunds.reduce((sum, refund) => sum + refund.refundAmount, 0);
  const refundsByStore = new Map<string, number>();

  refunds.forEach((refund) => {
    refundsByStore.set(
      refund.storeId,
      (refundsByStore.get(refund.storeId) ?? 0) + refund.refundAmount,
    );
  });

  const netSalesTotal = (salesData?.summary.totalSales ?? 0) - refundTotal;
  const salesByStore = (salesData?.byStore ?? []).map((item) => ({
    ...item,
    netSales: item.totalSales - (refundsByStore.get(item.storeId) ?? 0),
  }));
  const salesByStoreChart = salesByStore.map((item) => ({
    name: item.storeName,
    sales: item.netSales,
    gst: item.totalGst,
  }));
  const paymentMethodChart = (salesData?.byPaymentMethod ?? []).map((item) => ({
    name: item.method,
    value: item.total,
  }));
  const topInventoryChart = (storeReport?.topInventory ?? []).slice(0, 6).map((item) => ({
    name: item.productName,
    available: item.availableWeight,
    sold: item.soldWeight,
  }));
  const inventoryAuditChart = inventoryData.slice(0, 8).map((item) => ({
    name: item.productName,
    central: item.centralAvailableWeight,
    allocated: item.allocatedWeight,
    sold: item.soldWeight,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-sm text-muted-foreground">
          Audit-backed sales, inventory, and store performance reports.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label>Store Report</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {storesQuery.data?.data.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="statistics-from-date">From Date</Label>
            <Input
              id="statistics-from-date"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="statistics-to-date">To Date</Label>
            <Input
              id="statistics-to-date"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {salesReportQuery.isLoading ? "..." : salesData?.summary.totalInvoices ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Net Sales</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {salesReportQuery.isLoading ? "..." : formatOrderCurrency(netSalesTotal)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total GST</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {salesReportQuery.isLoading
              ? "..."
              : formatOrderCurrency(salesData?.summary.totalGst ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Refunded</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {refundsQuery.isLoading ? "..." : formatOrderCurrency(refundTotal)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Trend By Store</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByStoreChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: number) => formatOrderCurrency(value)} />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodChart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {paymentMethodChart.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatOrderCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales By Store</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {salesReportQuery.isError ? (
              <p className="text-sm text-destructive">
                {salesReportQuery.error instanceof Error
                  ? salesReportQuery.error.message
                  : "Failed to load sales report."}
              </p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Store</th>
                    <th className="px-4 py-3 font-medium">Invoices</th>
                    <th className="px-4 py-3 text-right font-medium">Net Sales</th>
                    <th className="px-4 py-3 text-right font-medium">GST</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByStore.map((item) => (
                    <tr key={item.storeId} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.storeName}</p>
                        <p className="text-xs text-muted-foreground">{item.storeCode}</p>
                      </td>
                      <td className="px-4 py-3">{item.invoiceCount}</td>
                      <td className="px-4 py-3 text-right">
                        {formatOrderCurrency(item.netSales)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatOrderCurrency(item.totalGst)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales By Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Count</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(salesData?.byPaymentMethod ?? []).map((item) => (
                  <tr key={item.method} className="border-b last:border-b-0">
                    <td className="px-4 py-3">{item.method}</td>
                    <td className="px-4 py-3">{item.count}</td>
                    <td className="px-4 py-3 text-right">
                      {formatOrderCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {storeReport?.store.name ? `${storeReport.store.name} Store Report` : "Store Report"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {storeReportQuery.isError ? (
            <p className="text-sm text-destructive">
              {storeReportQuery.error instanceof Error
                ? storeReportQuery.error.message
                : "Failed to load store report."}
            </p>
          ) : storeReportQuery.isLoading ? (
            <p>Loading store report...</p>
          ) : storeReport ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Store</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{storeReport.store.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {storeReport.store.code} - {storeReport.store.city}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Invoices</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {storeReport.sales.invoiceCount}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Net Store Sales</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {formatOrderCurrency(
                      storeReport.sales.totalSales - storeReport.refunds.totalRefunded,
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Refunded</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {formatOrderCurrency(storeReport.refunds.totalRefunded)}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Inventory Movement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={topInventoryChart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={11} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="available"
                            stackId="1"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary) / 0.28)"
                          />
                          <Area
                            type="monotone"
                            dataKey="sold"
                            stackId="1"
                            stroke="hsl(var(--primary) / 0.75)"
                            fill="hsl(var(--primary) / 0.5)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="overflow-x-auto rounded-lg border">
                  <div className="border-b px-4 py-3 font-medium">Top Inventory</div>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left">
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 text-right font-medium">Allocated</th>
                        <th className="px-4 py-3 text-right font-medium">Sold</th>
                        <th className="px-4 py-3 text-right font-medium">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeReport.topInventory.map((item) => (
                        <tr key={item.id} className="border-b last:border-b-0">
                          <td className="px-4 py-3">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.sku} - {item.category}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.allocatedWeight.toFixed(3)} g
                          </td>
                          <td className="px-4 py-3 text-right">{item.soldWeight.toFixed(3)} g</td>
                          <td className="px-4 py-3 text-right">
                            {item.availableWeight.toFixed(3)} g
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <div className="border-b px-4 py-3 font-medium">Recent Invoices</div>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeReport.recentInvoices.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3">
                          <p className="font-medium">{item.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{item.status}</p>
                        </td>
                        <td className="px-4 py-3">
                          {item.customerName || "Walk-in Customer"}
                          {item.customerPhone ? (
                            <p className="text-xs text-muted-foreground">
                              {item.customerPhone}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatOrderCurrency(item.totalAmount)}
                        </td>
                        <td className="px-4 py-3">{formatOrderDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a store to load the report.</p>
          )}
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Audit Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 overflow-x-auto">
            {inventoryReportQuery.isError ? (
              <p className="text-sm text-destructive">
                {inventoryReportQuery.error instanceof Error
                  ? inventoryReportQuery.error.message
                  : "Failed to load inventory report."}
              </p>
            ) : inventoryReportQuery.isLoading ? (
              <p>Loading inventory report...</p>
            ) : (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryAuditChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="central" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="allocated"
                        fill="hsl(var(--primary) / 0.7)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="sold"
                        fill="hsl(var(--primary) / 0.45)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 text-right font-medium">Central Available</th>
                      <th className="px-4 py-3 text-right font-medium">Allocated</th>
                      <th className="px-4 py-3 text-right font-medium">Sold</th>
                      <th className="px-4 py-3 text-right font-medium">Returned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item) => (
                      <tr key={item.productId} className="border-b last:border-b-0">
                        <td className="px-4 py-3">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.sku} - {item.category} - {item.purity}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.centralAvailableWeight.toFixed(3)} g
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.allocatedWeight.toFixed(3)} g
                        </td>
                        <td className="px-4 py-3 text-right">{item.soldWeight.toFixed(3)} g</td>
                        <td className="px-4 py-3 text-right">
                          {item.returnedWeight.toFixed(3)} g
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
