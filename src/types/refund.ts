export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export type RefundListItem = {
  id: string;
  refundNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  storeId: string;
  storeName: string;
  storeCode: string;
  rfid: string;
  returnedWeight: number;
  actualWeight: number;
  weightDeviation: number;
  refundAmount: number;
  status: RefundStatus;
  reason?: string | null;
  approvalNotes?: string | null;
  createdBy: string;
  approvedBy?: string | null;
  createdAt: string;
  approvedAt?: string | null;
  updatedAt: string;
};

export type RefundOrderItem = {
  id: string;
  productName: string;
  sku: string;
  rfid: string;
  actualWeight: number;
  stoneWeight: number;
  isReturned: boolean;
};

export type RefundDetail = RefundListItem & {
  isAutoApproved?: boolean;
  weightTolerance?: number;
  invoiceItems: RefundOrderItem[];
};

export type RefundSearchParams = {
  search?: string;
  status?: RefundStatus | "";
  invoiceId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  page?: number;
  limit?: number;
};

export type CreateRefundPayload = {
  rfid: string;
  returnedWeight: number;
  reason?: string;
};
