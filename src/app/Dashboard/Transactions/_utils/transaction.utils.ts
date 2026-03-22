import { TransactionLogItem } from "@/types/transaction";

export const formatTransactionDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatTransactionEventLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getTransactionEventClasses = (value: string) => {
  if (value === "DISTRIBUTE") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value === "ADD_PRODUCT" || value === "ADD_CATEGORY" || value === "CREATE_USER") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "REMOVE_PRODUCT") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

export const formatTransactionMetadata = (
  metadata?: Record<string, string | number>,
) => {
  if (!metadata) return [];

  return Object.entries(metadata).map(([key, value]) => ({
    label: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase()),
    value: String(value),
  }));
};

export const downloadTransactionSummary = (transaction: TransactionLogItem) => {
  const metadataMarkup = formatTransactionMetadata(transaction.metadata)
    .map(
      (item) =>
        `<li><strong>${item.label}:</strong> ${item.value}</li>`,
    )
    .join("");

  const markup = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${transaction.id} Log</title>
  </head>
  <body style="font-family:Arial,sans-serif;padding:24px;color:#18181b;">
    <h1 style="margin:0 0 12px;">System Activity Log</h1>
    <p><strong>Event:</strong> ${formatTransactionEventLabel(transaction.eventType)}</p>
    <p><strong>Module:</strong> ${transaction.module}</p>
    <p><strong>Actor:</strong> ${transaction.performedBy} (${transaction.role})</p>
    <p><strong>Store:</strong> ${transaction.storeName || "System-wide"}</p>
    <p><strong>Entity:</strong> ${transaction.entityName || "N/A"}</p>
    <p><strong>Reference ID:</strong> ${transaction.referenceId || "N/A"}</p>
    <p><strong>Date:</strong> ${formatTransactionDate(transaction.createdAt)}</p>
    <p><strong>Description:</strong> ${transaction.description}</p>
    ${metadataMarkup ? `<h2 style="margin-top:16px;">Metadata</h2><ul>${metadataMarkup}</ul>` : ""}
  </body>
</html>`;

  const blob = new Blob([markup], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${transaction.id}-log.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
