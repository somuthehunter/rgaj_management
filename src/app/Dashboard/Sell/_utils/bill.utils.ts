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

const buildInvoiceStyles = () => `
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #eef1f5;
      color: #111827;
      font-family: "Segoe UI", Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      background: #ffffff;
      padding: 14mm;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      border-bottom: 2px solid #111827;
      padding-bottom: 14px;
    }

    .brand h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .brand p {
      margin: 6px 0 0;
      color: #4b5563;
      font-size: 12px;
      line-height: 1.6;
    }

    .invoice-meta {
      min-width: 220px;
      border: 1px solid #d1d5db;
      background: #f8fafc;
      padding: 14px 16px;
    }

    .invoice-meta h2 {
      margin: 0 0 10px;
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .section-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-top: 18px;
    }

    .card {
      border: 1px solid #e5e7eb;
      padding: 14px;
    }

    .card-title {
      margin: 0 0 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #6b7280;
      font-weight: 700;
    }

    .card p {
      margin: 4px 0;
      font-size: 13px;
      line-height: 1.5;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
      font-size: 12px;
    }

    thead th {
      background: #111827;
      color: #ffffff;
      padding: 10px 8px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    tbody td {
      border-bottom: 1px solid #e5e7eb;
      padding: 10px 8px;
      vertical-align: top;
    }

    .num {
      text-align: right;
      white-space: nowrap;
    }

    .totals {
      width: 360px;
      margin-top: 18px;
      margin-left: auto;
      border: 1px solid #d1d5db;
      background: #f9fafb;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }

    .totals-row.grand {
      background: #111827;
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      border-bottom: 0;
    }

    .footer {
      margin-top: 22px;
      border-top: 1px dashed #d1d5db;
      padding-top: 14px;
      font-size: 11px;
      color: #6b7280;
      line-height: 1.7;
    }

    @media print {
      body {
        background: #ffffff;
      }

      .sheet {
        margin: 0;
        width: auto;
        min-height: auto;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
`;

export const buildInvoiceBillMarkup = (invoice: BillingInvoice) => {
  const rows = invoice.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div style="font-weight:600;">${item.productName}</div>
            <div style="color:#6b7280;font-size:11px;">SKU: ${item.sku}</div>
            <div style="color:#6b7280;font-size:11px;">RFID: ${item.rfid}</div>
          </td>
          <td class="num">${item.actualWeight.toFixed(3)} g</td>
          <td class="num">${item.stoneWeight.toFixed(3)} g</td>
          <td class="num">${item.netGoldWeight.toFixed(3)} g</td>
          <td class="num">${formatOrderCurrency(item.goldPrice)}</td>
          <td class="num">${formatOrderCurrency(item.makingCharge)}</td>
          <td class="num">${formatOrderCurrency(item.gstAmount)}</td>
          <td class="num">${formatOrderCurrency(item.totalAmount)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${invoice.invoiceNumber} Invoice</title>
    ${buildInvoiceStyles()}
  </head>
  <body>
    <div class="sheet">
      <div class="topbar">
        <div class="brand">
          <h1>Ratna Smriti</h1>
          <p>
            Gems and Jewellers<br />
            Jewellery Tax Invoice
          </p>
        </div>

        <div class="invoice-meta">
          <h2>Invoice</h2>
          <p><strong>No:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${formatOrderDate(invoice.createdAt)}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
          <p><strong>Payment:</strong> ${invoice.paymentMethod.replaceAll("_", " ")}</p>
        </div>
      </div>

      <div class="section-grid">
        <div class="card">
          <p class="card-title">Bill To</p>
          <p><strong>${invoice.customer?.name ?? "Walk-in Customer"}</strong></p>
          <p>Phone: ${invoice.customer?.phone ?? "Not provided"}</p>
          <p>Email: ${invoice.customer?.email ?? "Not provided"}</p>
          <p>Address: ${invoice.customer?.address ?? "Not provided"}</p>
        </div>

        <div class="card">
          <p class="card-title">Store Details</p>
          <p><strong>${invoice.store?.name ?? "Store"}</strong></p>
          <p>Store Code: ${invoice.store?.code ?? "N/A"}</p>
          <p>Items: ${invoice.items.length}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th class="num">Gross Wt</th>
            <th class="num">Stone Wt</th>
            <th class="num">Net Gold</th>
            <th class="num">Gold Value</th>
            <th class="num">Making</th>
            <th class="num">GST</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <strong>${formatOrderCurrency(invoice.subtotal)}</strong>
        </div>
        <div class="totals-row">
          <span>GST</span>
          <strong>${formatOrderCurrency(invoice.gstAmount)}</strong>
        </div>
        <div class="totals-row grand">
          <span>Grand Total</span>
          <span>${formatOrderCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      <div class="footer">
        <p>This invoice is formatted for A4 printing.</p>
        <p>Please verify product weights, stone deductions, and GST values before handing it to the customer.</p>
      </div>
    </div>
  </body>
</html>`;
};
