"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function SellPage() {
  const {
    form,
    itemsFieldArray,
    products,
    productsLoading,
    generatedOrder,
    isSubmitting,
    submitBill,
  } = useBillBuilder();

  const watchedItems = form.watch("items");
  const summary = watchedItems.reduce(
    (accumulator, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const totals = getSellLineTotals(product, item.quantity);

      return {
        subtotal: accumulator.subtotal + totals.subtotal,
        tax: accumulator.tax + totals.tax,
        total: accumulator.total + totals.total,
      };
    },
    { subtotal: 0, tax: 0, total: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Bill</h1>
        <p className="text-sm text-muted-foreground">
          Create a customer order, generate the bill, and push the mock order into the dashboard flow.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billing Form</CardTitle>
            <CardDescription>
              Capture customer details, choose products, and generate a bill/order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitBill} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input {...form.register("customerName")} />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customerName?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input {...form.register("customerPhone")} />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customerPhone?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...form.register("customerEmail")} />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
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
                <Textarea rows={3} {...form.register("customerAddress")} />
              </div>

              <div className="space-y-2">
                <Label>Order Notes</Label>
                <Textarea rows={3} {...form.register("notes")} />
              </div>

              {productsLoading ? (
                <p>Loading products...</p>
              ) : (
                <BillItemsEditor
                  control={form.control}
                  register={form.register}
                  watch={form.watch}
                  errors={form.formState.errors}
                  products={products}
                  itemsFieldArray={itemsFieldArray}
                />
              )}

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Subtotal: {formatOrderCurrency(summary.subtotal)}
                  </p>
                  <p className="text-muted-foreground">
                    Tax: {formatOrderCurrency(summary.tax)}
                  </p>
                  <p className="font-semibold">
                    Grand Total: {formatOrderCurrency(summary.total)}
                  </p>
                </div>

                <Button type="submit" disabled={isSubmitting || productsLoading}>
                  {isSubmitting ? "Generating..." : "Generate Bill"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <GeneratedBillCard order={generatedOrder} />
        </div>
      </div>
    </div>
  );
}
