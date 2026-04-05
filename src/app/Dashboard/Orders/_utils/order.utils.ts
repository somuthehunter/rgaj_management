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

const buildPrintStyles = () => `
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

    .brand-row {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 14px;
    }

    .brand-title {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
    }

    .brand-subtitle {
      margin: 6px 0 0;
      color: #4b5563;
      font-size: 12px;
      line-height: 1.6;
    }

    .invoice-badge {
      min-width: 190px;
      border: 1px solid #d1d5db;
      padding: 14px 16px;
      background: #f8fafc;
    }

    .invoice-badge h2 {
      margin: 0 0 10px;
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-top: 18px;
    }

    .panel {
      border: 1px solid #e5e7eb;
      padding: 14px;
      background: #fff;
    }

    .panel-title {
      margin: 0 0 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #6b7280;
      font-weight: 700;
    }

    .panel p {
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
      text-align: left;
      padding: 10px 8px;
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
      width: 330px;
      margin-left: auto;
      margin-top: 18px;
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

const buildInvoiceShell = (title: string, bodyMarkup: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${buildPrintStyles()}
  </head>
  <body>
    <div class="sheet">
      ${bodyMarkup}
    </div>
  </body>
</html>`;

export const openPrintMarkup = (markup: string, title: string) => {
  const printWindow = window.open("", "_blank", "width=900,height=1200");

  if (!printWindow) {
    throw new Error("Unable to open print window. Please allow pop-ups and try again.");
  }

  printWindow.document.open();
  printWindow.document.write(markup);
  printWindow.document.close();
  printWindow.document.title = title;

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

export const buildOrderBillMarkup = (order: OrderListItem) => {
  const rows = order.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div style="font-weight:600;">${item.productName}</div>
            <div style="color:#6b7280;font-size:11px;">SKU: ${item.sku}</div>
            <div style="color:#6b7280;font-size:11px;">Category: ${item.category}</div>
          </td>
          <td class="num">${(item.actualWeight ?? 0).toFixed(3)} g</td>
          <td class="num">${(item.stoneWeight ?? 0).toFixed(3)} g</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatOrderCurrency(item.unitPrice)}</td>
          <td class="num">${item.taxRate}%</td>
          <td class="num">${formatOrderCurrency(item.lineTotal)}</td>
        </tr>`,
    )
    .join("");

  return buildInvoiceShell(
    `${order.orderNumber} Bill`,
    `
      <div class="brand-row">
        <div>
          <h1 class="brand-title">Ratna Smriti</h1>
          <p class="brand-subtitle">
            Gems and Jewellers<br />
            Retail Jewellery Invoice
          </p>
        </div>
        <div class="invoice-badge">
          <h2>Tax Invoice</h2>
          <p><strong>Invoice No:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${formatOrderDate(order.createdAt)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod.replaceAll("_", " ")}</p>
        </div>
      </div>

      <div class="meta-grid">
        <div class="panel">
          <p class="panel-title">Bill To</p>
          <p><strong>${order.customer.name || "Walk-in Customer"}</strong></p>
          <p>Phone: ${order.customer.phone || "Not provided"}</p>
          <p>Email: ${order.customer.email || "Not provided"}</p>
          <p>Address: ${order.customer.address || "Not provided"}</p>
        </div>

        <div class="panel">
          <p class="panel-title">Store Details</p>
          <p><strong>${order.storeName}</strong></p>
          <p>Items: ${getOrderItemsCount(order)}</p>
          <p>Order Ref: ${order.orderNumber}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th class="num">Gross Wt</th>
            <th class="num">Stone Wt</th>
            <th class="num">Qty</th>
            <th class="num">Rate</th>
            <th class="num">GST</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <strong>${formatOrderCurrency(order.subtotal)}</strong>
        </div>
        <div class="totals-row">
          <span>GST</span>
          <strong>${formatOrderCurrency(order.tax)}</strong>
        </div>
        <div class="totals-row grand">
          <span>Grand Total</span>
          <span>${formatOrderCurrency(order.total)}</span>
        </div>
      </div>

      <div class="footer">
        <p>This is a computer-generated jewellery invoice intended for printing on A4 paper.</p>
        <p>Please verify item weights, tax details, and customer information before final handover.</p>
      </div>
    `,
  );
};
