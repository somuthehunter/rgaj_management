import { OrderStatus } from "@/types";
import { OrderListItem } from "@/types/order";

export const formatOrderCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export const formatOrderDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const getOrderStatusClasses = (status: OrderStatus) => {
  if (status === OrderStatus.COMPLETED) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === OrderStatus.CANCELLED) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

export const getOrderItemsCount = (order: OrderListItem) =>
  order.itemCount ?? order.items.reduce((total, item) => total + item.quantity, 0);

export const buildOrderBillMarkup = (order: OrderListItem) => {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #d4d4d8;">${item.productName}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;">${item.sku}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${formatOrderCurrency(item.unitPrice)}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${item.taxRate}%</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${formatOrderCurrency(item.lineTotal)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${order.orderNumber} Bill</title>
  </head>
  <body style="font-family:Arial,sans-serif;padding:24px;color:#18181b;">
    <h1 style="margin:0 0 8px;">RatnaSmriti Jewellery Bill</h1>
    <p style="margin:0 0 4px;"><strong>Order:</strong> ${order.orderNumber}</p>
    <p style="margin:0 0 4px;"><strong>Store:</strong> ${order.storeName}</p>
    <p style="margin:0 0 4px;"><strong>Date:</strong> ${formatOrderDate(order.createdAt)}</p>
    <p style="margin:0 0 16px;"><strong>Customer:</strong> ${order.customer.name} (${order.customer.phone})</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f4f4f5;">
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:left;">Product</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:left;">SKU</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Qty</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Rate</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Tax</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:16px;max-width:320px;margin-left:auto;">
      <p><strong>Subtotal:</strong> ${formatOrderCurrency(order.subtotal)}</p>
      <p><strong>Tax:</strong> ${formatOrderCurrency(order.tax)}</p>
      <p><strong>Grand Total:</strong> ${formatOrderCurrency(order.total)}</p>
    </div>
  </body>
</html>`;
};
