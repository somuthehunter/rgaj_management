import { SelectOption } from "@/components/shared/ListControlsBar";
import { RefundSearchParams } from "@/types/refund";

export const REFUND_STATUS_OPTIONS: SelectOption[] = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Completed", value: "COMPLETED" },
];

export const REFUND_SORT_OPTIONS: SelectOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Highest Amount", value: "amount-desc" },
  { label: "Lowest Amount", value: "amount-asc" },
  { label: "Status A-Z", value: "status-asc" },
];

export const REFUND_SORT_MAP: Record<
  "newest" | "oldest" | "amount-desc" | "amount-asc" | "status-asc",
  Pick<RefundSearchParams, "sortBy" | "sortOrder">
> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  oldest: { sortBy: "createdAt", sortOrder: "asc" },
  "amount-desc": { sortBy: "refundAmount", sortOrder: "desc" },
  "amount-asc": { sortBy: "refundAmount", sortOrder: "asc" },
  "status-asc": { sortBy: "status", sortOrder: "asc" },
};
