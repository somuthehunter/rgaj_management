import { CustomerListItem } from "@/types/customer";
import { buildOrderBillMarkup, formatOrderCurrency, formatOrderDate } from "@/app/Dashboard/Orders/_utils/order.utils";
import { orderService } from "@/services/order.service";

export const downloadCustomerSummary = (customer: CustomerListItem) => {
  const ordersMarkup = customer.orders
    .map(
      (order) => `
        <tr>
          <td style="padding:8px;border:1px solid #d4d4d8;">${order.orderNumber}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;">${order.storeName}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;">${formatOrderDate(order.createdAt)}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;">${order.status}</td>
          <td style="padding:8px;border:1px solid #d4d4d8;text-align:right;">${formatOrderCurrency(order.total)}</td>
        </tr>`,
    )
    .join("");

  const markup = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${customer.name} Summary</title>
  </head>
  <body style="font-family:Arial,sans-serif;padding:24px;color:#18181b;">
    <h1 style="margin:0 0 12px;">Customer Purchase Summary</h1>
    <p><strong>Name:</strong> ${customer.name}</p>
    <p><strong>Phone:</strong> ${customer.phone}</p>
    <p><strong>Email:</strong> ${customer.email || "Not provided"}</p>
    <p><strong>Total Purchase:</strong> ${formatOrderCurrency(customer.totalPurchase)}</p>
    <p><strong>Items Purchased:</strong> ${customer.itemsPurchased}</p>
    <p><strong>Orders Count:</strong> ${customer.ordersCount}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      <thead>
        <tr style="background:#f4f4f5;">
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:left;">Order</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:left;">Store</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:left;">Date</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:left;">Status</th>
          <th style="padding:8px;border:1px solid #d4d4d8;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${ordersMarkup}</tbody>
    </table>
  </body>
</html>`;

  const blob = new Blob([markup], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${customer.name.toLowerCase().replaceAll(" ", "-")}-summary.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const escapeCsvValue = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;

export const downloadCustomersCsv = (customers: CustomerListItem[]) => {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Address",
    "Total Purchase",
    "Items Purchased",
    "Orders Count",
    "Stores",
    "Last Order Date",
  ];

  const rows = customers.map((customer) =>
    [
      customer.name,
      customer.phone,
      customer.email || "",
      customer.address || "",
      customer.totalPurchase,
      customer.itemsPurchased,
      customer.ordersCount,
      customer.storeNames.join(" | "),
      formatOrderDate(customer.lastOrderDate),
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  const csv = [headers.map(escapeCsvValue).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "customers-export.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const downloadCustomerLatestBill = async (customer: CustomerListItem) => {
  const latestOrder = customer.orders[0];
  if (!latestOrder) return;

  const resolvedOrder =
    latestOrder.items.length > 0
      ? latestOrder
      : (await orderService.getById(latestOrder.id)).data;

  const blob = new Blob([buildOrderBillMarkup(resolvedOrder)], {
    type: "text/html;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${resolvedOrder.orderNumber.toLowerCase()}-bill.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
