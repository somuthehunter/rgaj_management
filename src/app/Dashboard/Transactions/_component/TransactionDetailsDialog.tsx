"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Eye } from "lucide-react";
import { TransactionLogItem } from "@/types/transaction";
import {
  downloadTransactionSummary,
  formatTransactionDate,
  formatTransactionEventLabel,
  formatTransactionMetadata,
  getTransactionEventClasses,
} from "../_utils/transaction.utils";

type TransactionDetailsDialogProps = {
  transaction: TransactionLogItem;
  trigger?: React.ReactNode;
};

export default function TransactionDetailsDialog({
  transaction,
  trigger,
}: TransactionDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const metadata = formatTransactionMetadata(transaction.metadata);

  const fallbackTrigger = useMemo(
    () => (
      <Button size="icon" variant="ghost">
        <Eye className="h-4 w-4" />
      </Button>
    ),
    [],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>

      <DialogContent className="max-w-3xl p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <DialogTitle>{transaction.title}</DialogTitle>
                  <DialogDescription>
                    System activity log detail for this event.
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getTransactionEventClasses(transaction.eventType)}
                  >
                    {formatTransactionEventLabel(transaction.eventType)}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => downloadTransactionSummary(transaction)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Event Details</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Module:</span>{" "}
                    {transaction.module}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Entity:</span>{" "}
                    {transaction.entityName || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Reference ID:</span>{" "}
                    {transaction.referenceId || "Not available"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Date:</span>{" "}
                    {formatTransactionDate(transaction.createdAt)}
                  </p>
                </div>
              </section>

              <section className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Actor Details</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Performed By:</span>{" "}
                    {transaction.performedBy}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Role:</span>{" "}
                    {transaction.role}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Store:</span>{" "}
                    {transaction.storeName || "System-wide"}
                  </p>
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">Description</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {transaction.description}
              </p>
            </section>

            {metadata.length > 0 && (
              <section className="mt-6 rounded-lg border p-4">
                <h3 className="text-sm font-semibold">Metadata</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {metadata.map((item) => (
                    <div key={item.label} className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
