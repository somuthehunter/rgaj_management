"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { paymentMethods } from "@/schemas/bill.schema";
import { formatOrderCurrency } from "@/app/Dashboard/Orders/_utils/order.utils";
import BillItemsEditor from "./_component/BillItemsEditor";
import GeneratedBillCard from "./_component/GeneratedBillCard";
import { useBillBuilder } from "./_hooks/useBillBuilder";
import { getSellLineTotals } from "./_utils/bill.utils";
import { Textarea } from "@/components/ui/textarea";

export default function SellPage() {
  const {
    form,
    itemsFieldArray,
    isSuperAdmin,
    stores,
    storesLoading,
    products,
    productsLoading,
    productsError,
    selectedStoreId,
    selectedStoreName,
    generatedInvoice,
    isSubmitting,
    submitBill,
  } = useBillBuilder();

  const watchedItems = form.watch("items");
  const goldRatePerGram = form.watch("goldRatePerGram");
  const summary = watchedItems.reduce(
    (accumulator, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const totals = getSellLineTotals(
        product,
        item.actualWeight,
        goldRatePerGram,
        item.stoneWeight || 0,
      );

      return {
        subtotal: accumulator.subtotal + totals.subtotal,
        tax: accumulator.tax + totals.tax,
        total: accumulator.total + totals.total,
      };
    },
    { subtotal: 0, tax: 0, total: 0 },
  );

  const showSelectStoreHint = isSuperAdmin && !selectedStoreId;
  const showEmptyProducts = !productsLoading && selectedStoreId && products.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Bill</h1>
        <p className="text-sm text-muted-foreground">
          Create a backend invoice from live store inventory and customer details.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billing Form</CardTitle>
            <CardDescription>
              Select a store, enter customer details, add sold items by weight, and generate an invoice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitBill} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label>Store *</Label>
                    <Controller
                      control={form.control}
                      name="storeId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id}>
                                {store.name} ({store.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {storesLoading && (
                      <p className="text-xs text-muted-foreground">Loading store options...</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input {...form.register("customerName")} placeholder="Enter customer name" maxLength={80} />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    {...form.register("customerPhone")}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit phone number"
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customerPhone?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...form.register("customerEmail")} placeholder="name@example.com" />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customerEmail?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Gold Rate / Gram *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter today's gold rate"
                    {...form.register("goldRatePerGram", { valueAsNumber: true })}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.goldRatePerGram?.message}
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Payment Method *</Label>
                  <Controller
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method.replaceAll("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.paymentMethod?.message}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Customer Address</Label>
                <Textarea rows={3} {...form.register("customerAddress")} placeholder="Enter address if available" />
              </div>

              {showSelectStoreHint ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Select a store first to load sellable inventory.
                </div>
              ) : productsLoading ? (
                <p>Loading sellable inventory...</p>
              ) : productsError ? (
                <p className="text-sm text-destructive">
                  {productsError instanceof Error
                    ? productsError.message
                    : "Failed to load sellable inventory."}
                </p>
              ) : showEmptyProducts ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No sellable stock is available for {selectedStoreName || "the selected store"} yet.
                </div>
              ) : (
                <BillItemsEditor
                  control={form.control}
                  register={form.register}
                  watch={form.watch}
                  errors={form.formState.errors}
                  products={products}
                  goldRatePerGram={goldRatePerGram}
                  itemsFieldArray={itemsFieldArray}
                />
              )}

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Estimated subtotal: {formatOrderCurrency(summary.subtotal)}
                  </p>
                  <p className="text-muted-foreground">
                    Estimated GST: {formatOrderCurrency(summary.tax)}
                  </p>
                  <p className="font-semibold">
                    Estimated grand total: {formatOrderCurrency(summary.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Final invoice totals come from the backend calculation.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    productsLoading ||
                    showSelectStoreHint ||
                    showEmptyProducts
                  }
                >
                  {isSubmitting ? "Generating..." : "Generate Bill"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <GeneratedBillCard invoice={generatedInvoice} />
        </div>
      </div>
    </div>
  );
}
