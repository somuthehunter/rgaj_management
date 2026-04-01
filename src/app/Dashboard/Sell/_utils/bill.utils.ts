import { BillingInvoice, SellableProduct } from "@/types/billing";
import { formatOrderCurrency, formatOrderDate } from "@/app/Dashboard/Orders/_utils/order.utils";

const getNetGoldWeight = (actualWeight: number, stoneWeight = 0) =>
  Math.max(actualWeight - stoneWeight, 0);

const getMakingChargeValue = (
  product: SellableProduct,
  goldPrice: number,
  netGoldWeight: number,
) => {
  const makingCharge = product.makingCharge ?? 0;

  if (product.makingChargeType === "FIXED") {
    return makingCharge;
  }

  if (product.makingChargeType === "PERCENTAGE") {
    return (goldPrice * makingCharge) / 100;
  }

  return makingCharge * netGoldWeight;
};

export const getSellLineTotals = (
  product: SellableProduct | undefined,
  actualWeight: number,
  goldRatePerGram: number,
  stoneWeight = 0,
) => {
  if (!product || !actualWeight || !goldRatePerGram) {
    return {
      subtotal: 0,
      tax: 0,
      total: 0,
      netGoldWeight: 0,
    };
  }

  const netGoldWeight = getNetGoldWeight(actualWeight, stoneWeight);
  const goldPrice = netGoldWeight * goldRatePerGram;
  const makingCharge = getMakingChargeValue(product, goldPrice, netGoldWeight);
  const subtotal = goldPrice + makingCharge;
  const tax = (subtotal * (product.gstRate ?? 0)) / 100;

  return {
    subtotal,
    tax,
    total: subtotal + tax,
    netGoldWeight,
  };
};

export const buildInvoiceBillMarkup = (invoice: BillingInvoice) => {
  const rows = invoice.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #d4d4d8;">${item.productName}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;">${item.sku}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${item.actualWeight.toFixed(3)} g</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${item.netGoldWeight.toFixed(3)} g</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${item.gstRate}%</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${formatOrderCurrency(item.totalAmount)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${invoice.invoiceNumber} Bill</title>
  </head>
  <body style="font-family:Arial,sans-serif;padding:24px;color:#18181b;">
    <h1 style="margin:0 0 8px;">RatnaSmriti Jewellery Invoice</h1>
    <p style="margin:0 0 4px;"><strong>Invoice:</strong> ${invoice.invoiceNumber}</p>
    <p style="margin:0 0 4px;"><strong>Store:</strong> ${invoice.store?.name ?? "Store"}</p>
    <p style="margin:0 0 4px;"><strong>Date:</strong> ${formatOrderDate(invoice.createdAt)}</p>
    <p style="margin:0 0 16px;"><strong>Customer:</strong> ${invoice.customer?.name ?? "Walk-in Customer"} (${invoice.customer?.phone ?? "Not provided"})</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f4f4f5;">
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:left;">Product</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:left;">SKU</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Actual Weight</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Net Gold</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Tax</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:16px;max-width:320px;margin-left:auto;">
      <p><strong>Subtotal:</strong> ${formatOrderCurrency(invoice.subtotal)}</p>
      <p><strong>GST:</strong> ${formatOrderCurrency(invoice.gstAmount)}</p>
      <p><strong>Grand Total:</strong> ${formatOrderCurrency(invoice.totalAmount)}</p>
    </div>
  </body>
</html>`;
};
