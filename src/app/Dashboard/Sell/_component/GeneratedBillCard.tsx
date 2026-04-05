"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { BillingInvoice } from "@/types/billing";
import {
  formatOrderCurrency,
  formatOrderDate,
  openPrintMarkup,
} from "@/app/Dashboard/Orders/_utils/order.utils";
import { buildInvoiceBillMarkup } from "../_utils/bill.utils";

type GeneratedBillCardProps = {
  invoice: BillingInvoice | null;
};

export default function GeneratedBillCard({ invoice }: GeneratedBillCardProps) {
  const printBill = () => {
    if (!invoice) return;

    openPrintMarkup(
      buildInvoiceBillMarkup(invoice),
      `${invoice.invoiceNumber} Invoice`,
    );
  };

  if (!invoice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Bill</CardTitle>
          <CardDescription>
            Once you generate an invoice, the print-ready bill action will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">Invoice {invoice.invoiceNumber}</CardTitle>
            <CardDescription>
              Bill generated successfully for {invoice.customer?.name ?? "Walk-in Customer"}.
            </CardDescription>
          </div>
          <Badge variant="outline">{invoice.paymentMethod.replaceAll("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="mt-1 font-medium">{invoice.customer?.name ?? "Walk-in Customer"}</p>
            <p className="text-sm text-muted-foreground">
              {invoice.customer?.phone ?? "No phone provided"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Invoice Total</p>
            <p className="mt-1 font-medium">{formatOrderCurrency(invoice.totalAmount)}</p>
            <p className="text-sm text-muted-foreground">{formatOrderDate(invoice.createdAt)}</p>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="border-b px-3 py-2 text-sm font-medium">Invoice Items</div>
          <div className="divide-y">
            {invoice.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-muted-foreground">
                    {item.sku} | {item.actualWeight.toFixed(3)} g
                  </p>
                </div>
                <p className="font-medium">{formatOrderCurrency(item.totalAmount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={printBill}>
            <Download className="mr-2 h-4 w-4" />
            Print Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
