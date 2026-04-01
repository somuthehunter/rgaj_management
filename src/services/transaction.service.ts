import { auditService } from "./audit.service";

export const transactionService = {
  getAll: auditService.getLogs,
  search: auditService.searchLogs,
};
