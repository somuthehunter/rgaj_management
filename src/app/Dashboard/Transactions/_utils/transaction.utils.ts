import { TransactionLogItem } from "@/types/transaction";

export const formatTransactionDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatTransactionLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getTransactionActionClasses = (value: string) => {
  if (value === "CREATE" || value === "ACTIVATE" || value === "LOGIN" || value === "SELL") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "DELETE" || value === "CANCEL" || value === "REJECT") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (value === "UPDATE" || value === "ALLOCATE" || value === "REFUND") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

export const formatTransactionChanges = (changes?: unknown) => {
  if (!changes) return [];

  if (typeof changes !== "object" || changes === null) {
    return [{ label: "Changes", value: String(changes) }];
  }

  return Object.entries(changes as Record<string, unknown>).map(([key, value]) => ({
    label: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase()),
    value:
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value),
  }));
};

export const downloadTransactionSummary = (transaction: TransactionLogItem) => {
  const changesMarkup = formatTransactionChanges(transaction.changes)
    .map((item) => `<li><strong>${item.label}:</strong> ${item.value}</li>`)
    .join("");

  const markup = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${transaction.id} Log</title>
  </head>
  <body style="font-family:Arial,sans-serif;padding:24px;color:#18181b;">
    <h1 style="margin:0 0 12px;">System Audit Log</h1>
    <p><strong>Action:</strong> ${formatTransactionLabel(transaction.action)}</p>
    <p><strong>Entity:</strong> ${formatTransactionLabel(transaction.entity)}</p>
    <p><strong>Entity ID:</strong> ${transaction.entityId || "N/A"}</p>
    <p><strong>User ID:</strong> ${transaction.userId}</p>
    <p><strong>IP Address:</strong> ${transaction.ipAddress || "N/A"}</p>
    <p><strong>User Agent:</strong> ${transaction.userAgent || "N/A"}</p>
    <p><strong>Date:</strong> ${formatTransactionDate(transaction.createdAt)}</p>
    ${changesMarkup ? `<h2 style="margin-top:16px;">Changes</h2><ul>${changesMarkup}</ul>` : ""}
  </body>
</html>`;

  const blob = new Blob([markup], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${transaction.id}-audit-log.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
